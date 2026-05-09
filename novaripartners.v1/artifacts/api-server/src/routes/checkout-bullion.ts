import { Router } from "express";
import { randomBytes, randomUUID } from "crypto";
import { checkoutLimiter } from "../lib/limiters";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";

const router = Router();

const NEXI_API_KEY = process.env.NEXI_API_KEY || "";
const NEXI_ENV = process.env.NEXI_ENV || "sandbox";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

async function sendOrderConfirmationEmail(opts: {
  to: string; customerName: string; orderId: string; amountCents: number; currency: string;
}) {
  if (!RESEND_API_KEY) return;
  try {
    const amount = (opts.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: opts.currency });
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "NOVARI PARTNERS <contact@novaripartnersllc.com>",
        to: [opts.to],
        subject: `Order Confirmed \u2014 ${opts.orderId}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;"><h2 style="color:#111;">Thank you, ${opts.customerName}!</h2><p>Your order <strong>#${opts.orderId}</strong> has been confirmed.</p><div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:24px 0;"><p style="margin:0;font-size:18px;font-weight:bold;">Total: ${amount}</p><p style="color:#888;margin:8px 0 0;font-size:13px;">American Silver Eagle BU Coin(s) \u2014 .999 Fine Silver</p></div><p style="color:#555;font-size:14px;">We will ship within 2 business days. Questions? <a href="mailto:contact@novaripartnersllc.com">contact@novaripartnersllc.com</a></p><p style="color:#aaa;font-size:12px;margin-top:28px;">NOVARI PARTNERS LLC \u2014 30 N Gould St Ste R, Sheridan, WY 82801</p></div>`,
      }),
    });
  } catch { /* non-blocking */ }
}
const NEXI_BASE =
  NEXI_ENV === "production"
    ? "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1"
    : "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";

function getSiteUrl(): string {
  return process.env.SITE_URL || "https://novaripartners.com";
}

function generateOrderId(): string {
  return `NV${randomBytes(8).toString("hex").toUpperCase()}`;
}

// ── Cart item from frontend: only productId (or slug fallback) + quantity ───
type CartItemInput = {
  productId?: number;   // preferred
  slug?: string;        // fallback for old carts without productId
  id?: string;          // legacy string id (= slug for bullion products)
  quantity: number;
};

router.post("/checkout/create-bullion-order", checkoutLimiter, async (req, res) => {
  const { customerName, customerEmail, items } = req.body as {
    customerName?: string;
    customerEmail?: string;
    items?: CartItemInput[];
  };

  if (!customerName?.trim() || !customerEmail?.trim()) {
    res.status(400).json({ error: "Customer name and email are required" });
    return;
  }

  if (!items || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  // Validate quantities
  for (const item of items) {
    const qty = item.quantity;
    if (typeof qty !== "number" || qty <= 0 || !Number.isInteger(qty) || qty > 500) {
      res.status(400).json({ error: "Invalid quantity in cart" });
      return;
    }
    if (!item.productId && !item.slug && !item.id) {
      res.status(400).json({ error: "Each item must have productId or slug" });
      return;
    }
  }

  // ── Resolve products from DB — NEVER trust frontend price ─────────────────
  // Collect numeric productIds
  const numericIds = items
    .map((i) => i.productId)
    .filter((id): id is number => typeof id === "number" && id > 0);

  // Collect slugs (from slug or id field — for old localStorage carts)
  const slugs = items
    .filter((i) => !i.productId)
    .map((i) => (i.slug || i.id || "").trim())
    .filter(Boolean);

  // Fetch products by id
  const productsByIdRows =
    numericIds.length > 0
      ? await db
          .select({
            id: productsTable.id,
            slug: productsTable.slug,
            name: productsTable.name,
            price: productsTable.price,
            currency: productsTable.currency,
            inStock: productsTable.inStock,
            published: productsTable.published,
          })
          .from(productsTable)
          .where(inArray(productsTable.id, numericIds))
      : [];

  // Fetch products by slug (fallback for legacy carts)
  const productsBySlugRows =
    slugs.length > 0
      ? await db
          .select({
            id: productsTable.id,
            slug: productsTable.slug,
            name: productsTable.name,
            price: productsTable.price,
            currency: productsTable.currency,
            inStock: productsTable.inStock,
            published: productsTable.published,
          })
          .from(productsTable)
          .where(inArray(productsTable.slug, slugs))
      : [];

  // Build lookup maps
  const byId = new Map(productsByIdRows.map((p) => [p.id, p]));
  const bySlug = new Map(productsBySlugRows.map((p) => [p.slug, p]));

  // Resolve each cart item to a DB product
  type ResolvedItem = {
    product: (typeof productsByIdRows)[0];
    quantity: number;
  };

  const resolvedItems: ResolvedItem[] = [];

  for (const item of items) {
    let product =
      item.productId != null ? byId.get(item.productId) : undefined;

    if (!product) {
      const lookupSlug = item.slug || item.id || "";
      product = bySlug.get(lookupSlug);
    }

    if (!product) {
      req.log.warn({ item }, "Checkout: product not found");
      res.status(400).json({ error: `Product not found: ${item.slug || item.id || item.productId}` });
      return;
    }
    if (!product.published) {
      res.status(400).json({ error: `Product is not available: ${product.name}` });
      return;
    }
    if (!product.inStock) {
      res.status(400).json({ error: `Product is out of stock: ${product.name}` });
      return;
    }

    resolvedItems.push({ product, quantity: item.quantity });
  }

type DiscountTier = { minQty: number; maxQty: number | null; discountPercent: number };

async function getDiscountMultiplier(qty: number): Promise<number> {
  try {
    const res = await db.execute(sql`SELECT value FROM settings WHERE key = 'discount_tiers'`);
    const tiers = (res.rows[0] as { value?: DiscountTier[] } | undefined)?.value ?? [];
    const tier = tiers.find(t => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty));
    return tier ? 1 - (tier.discountPercent / 100) : 1;
  } catch { return 1; }
}

  // ── Calculate total SERVER-SIDE with quantity discounts ────────────────────
  const totalUsd = (await Promise.all(
    resolvedItems.map(async ({ product, quantity }) =>
      parseFloat(product.price) * (await getDiscountMultiplier(quantity)) * quantity
    )
  )).reduce((a, b) => a + b, 0);
  const amountCents = Math.round(totalUsd * 100);
  const orderId = generateOrderId();
  const siteUrl = getSiteUrl();

  // Persist order before calling Nexi
  await db.insert(ordersTable).values({
    id: orderId,
    sessionId: (req.headers["x-session-id"] as string) || "web",
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    amountCents,
    currency: "USD",
    status: "pending",
  });

  req.log.info(
    { orderId, amountCents, currency: "USD", items: resolvedItems.length },
    "Bullion order created",
  );

  if (!NEXI_API_KEY) {
    req.log.warn("NEXI_API_KEY not set — returning mock hostedPage for development");
    // Mark as paid in mock mode so order-success can verify
    await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, orderId));
    res.json({
      hostedPage: `${siteUrl}/order-success?orderId=${orderId}&mock=1`,
      orderId,
      amountCents,
    });
    return;
  }

  const description = resolvedItems
    .map(({ product, quantity }) => `${quantity}x ${product.name}`)
    .join(", ")
    .slice(0, 200);

  try {
    const nexiResponse = await fetch(`${NEXI_BASE}/orders/hpp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": NEXI_API_KEY,
        "Correlation-Id": randomUUID(),
      },
      body: JSON.stringify({
        order: {
          orderId,
          amount: String(amountCents),
          currency: "USD",
          description,
          customerInfo: {
            cardHolderName: customerName.trim(),
            cardHolderEmail: customerEmail.trim(),
          },
        },
        paymentSession: {
          actionType: "PAY",
          amount: String(amountCents),
          currency: "USD",
          language: "eng",
          resultUrl: `${siteUrl}/order-success?orderId=${orderId}`,
          cancelUrl: `${siteUrl}/cart`,
          notificationUrl: `${siteUrl}/api/checkout/notify`,
        },
      }),
    });

    if (!nexiResponse.ok) {
      const errBody = await nexiResponse.text();
      req.log.error(
        { orderId, nexiStatus: nexiResponse.status },
        "Nexi HPP error (bullion)",
      );
      await db
        .update(ordersTable)
        .set({ status: "failed" })
        .where(eq(ordersTable.id, orderId));
      res.status(502).json({ error: "Payment gateway error. Please try again." });
      return;
    }

    const nexiData = (await nexiResponse.json()) as {
      hostedPage: string;
      securityToken: string;
    };

    // Save securityToken for webhook verification
    await db
      .update(ordersTable)
      .set({ nexiSecurityToken: nexiData.securityToken })
      .where(eq(ordersTable.id, orderId));

    req.log.info({ orderId }, "Nexi HPP session created (bullion)");

    res.json({ hostedPage: nexiData.hostedPage, orderId, amountCents });
  } catch (e) {
    req.log.error({ orderId, err: e }, "Unexpected error creating Nexi session (bullion)");
    await db
      .update(ordersTable)
      .set({ status: "failed" })
      .where(eq(ordersTable.id, orderId));
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

export default router;
