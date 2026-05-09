/**
 * NEXI XPAY HPP — Checkout Bullion Route
 * Struttura basata sul template ufficiale Nexi XPay HPP.
 * Esteso con: DB ordini, shipping configurabile, coupon, email.
 */

import { Router } from "express";
import { randomBytes, randomUUID } from "crypto";
import { checkoutLimiter } from "../lib/limiters";
import { db } from "@workspace/db";
import { ordersTable, productsTable, couponsTable } from "@workspace/db";
import { applyCoupon } from "./coupons";
import { calculateShipping } from "./shipping";
import { eq, inArray, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import {
  NEXI_API_KEY,
  NEXI_BASE_URL,
  getSiteUrl,
  CURRENCY,
  LANGUAGE,
  ORDER_ID_PREFIX,
  RESULT_PATH,
  CANCEL_PATH,
  API_BASE_PATH,
} from "../config/nexi.config";

const router = Router();
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  return `${ORDER_ID_PREFIX}${randomBytes(8).toString("hex").toUpperCase()}`;
}

function nexiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": NEXI_API_KEY,
    "Correlation-Id": randomUUID(),
  };
}

function mapOperationResult(result: string): "paid" | "failed" | "cancelled" | "pending" {
  if (result === "AUTHORIZED" || result === "EXECUTED") return "paid";
  if (["DECLINED", "FAILED", "VOIDED"].includes(result)) return "failed";
  if (result === "CANCELLED") return "cancelled";
  return "pending";
}

function extractUserId(req: any): number | null {
  try {
    const auth = req.headers["authorization"] as string;
    if (!auth?.startsWith("Bearer ")) return null;
    const secret = (process.env.JWT_SECRET || "fallback_secret") + "_user";
    const p = jwt.verify(auth.slice(7), secret) as any;
    return p.type === "user" ? Number(p.userId) : null;
  } catch { return null; }
}

async function sendOrderConfirmationEmail(opts: {
  to: string; customerName: string; orderId: string; amountCents: number;
}) {
  if (!RESEND_API_KEY) return;
  try {
    const amount = (opts.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: CURRENCY });
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "NOVARI PARTNERS <contact@novaripartnersllc.com>",
        to: [opts.to],
        subject: `Order Confirmed — ${opts.orderId}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;">
          <h2>Thank you, ${opts.customerName}!</h2>
          <p>Your order <strong>#${opts.orderId}</strong> has been confirmed.</p>
          <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="font-size:18px;font-weight:bold;margin:0;">Total: ${amount}</p>
            <p style="color:#888;font-size:13px;margin:8px 0 0;">American Silver Eagle BU Coin(s) — .999 Fine Silver</p>
          </div>
          <p style="color:#555;font-size:14px;">We will ship within 2 business days.<br>
            Questions? <a href="mailto:contact@novaripartnersllc.com">contact@novaripartnersllc.com</a></p>
          <p style="color:#aaa;font-size:12px;margin-top:28px;">NOVARI PARTNERS LLC — 30 N Gould St Ste R, Sheridan, WY 82801</p>
        </div>`,
      }),
    });
  } catch { /* non-blocking */ }
}

type DiscountTier = { minQty: number; maxQty: number | null; discountAmount: number };
async function getDiscountedPrice(basePrice: number, qty: number): Promise<number> {
  try {
    const res = await db.execute(sql`SELECT value FROM settings WHERE key = 'discount_tiers'`);
    const tiers = (res.rows[0] as { value?: DiscountTier[] } | undefined)?.value ?? [];
    const tier = tiers.find(t => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty));
    return Math.max(0, basePrice - (tier?.discountAmount ?? 0));
  } catch { return basePrice; }
}

// ─── Cart item types ───────────────────────────────────────────────────────────
type CartItemInput = {
  productId?: number;
  slug?: string;
  id?: string;
  quantity: number;
};

// ─── POST /api/checkout/create-bullion-order ──────────────────────────────────

router.post("/checkout/create-bullion-order", checkoutLimiter, async (req, res) => {
  const { customerName, customerEmail, items, couponCode, shippingMethodId } = req.body as {
    customerName?: string;
    customerEmail?: string;
    items?: CartItemInput[];
    couponCode?: string;
    shippingMethodId?: number;
  };

  if (!customerName?.trim() || !customerEmail?.trim()) {
    res.status(400).json({ error: "Customer name and email are required" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  if (!shippingMethodId || typeof shippingMethodId !== "number") {
    res.status(400).json({ error: "A shipping method is required" });
    return;
  }
  if (!items || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

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

  // ── Resolve products from DB (NEVER trust frontend price) ─────────────────
  const numericIds = items.map(i => i.productId).filter((id): id is number => typeof id === "number" && id > 0);
  const slugs = items.filter(i => !i.productId).map(i => (i.slug || i.id || "").trim()).filter(Boolean);

  const productsByIdRows = numericIds.length > 0
    ? await db.select({ id: productsTable.id, slug: productsTable.slug, name: productsTable.name, price: productsTable.price, inStock: productsTable.inStock, published: productsTable.published })
        .from(productsTable).where(inArray(productsTable.id, numericIds))
    : [];
  const productsBySlugRows = slugs.length > 0
    ? await db.select({ id: productsTable.id, slug: productsTable.slug, name: productsTable.name, price: productsTable.price, inStock: productsTable.inStock, published: productsTable.published })
        .from(productsTable).where(inArray(productsTable.slug, slugs))
    : [];

  const byId = new Map(productsByIdRows.map(p => [p.id, p]));
  const bySlug = new Map(productsBySlugRows.map(p => [p.slug, p]));

  type ResolvedItem = { product: typeof productsByIdRows[0]; quantity: number };
  const resolvedItems: ResolvedItem[] = [];

  for (const item of items) {
    const product = (item.productId != null ? byId.get(item.productId) : undefined)
      ?? bySlug.get(item.slug || item.id || "");
    if (!product) { res.status(400).json({ error: `Product not found: ${item.slug || item.id || item.productId}` }); return; }
    if (!product.published) { res.status(400).json({ error: `Product unavailable: ${product.name}` }); return; }
    if (!product.inStock) { res.status(400).json({ error: `Out of stock: ${product.name}` }); return; }
    resolvedItems.push({ product, quantity: item.quantity });
  }

  // ── Calculate subtotal server-side with volume discounts ──────────────────
  const totals = await Promise.all(
    resolvedItems.map(async ({ product, quantity }) => {
      const discounted = await getDiscountedPrice(parseFloat(product.price), quantity);
      return discounted * quantity;
    })
  );
  const totalUsd = totals.reduce((a, b) => a + b, 0);
  const subtotalCents = Math.round(totalUsd * 100);

  req.log.info(
    { subtotalCents, totalUsd, items: resolvedItems.map(r => ({ id: r.product.id, slug: r.product.slug, price: r.product.price, qty: r.quantity })) },
    "Checkout: product subtotal"
  );

  if (subtotalCents < 500) {
    res.status(400).json({ error: "Minimum order value is $5.00" });
    return;
  }

  // ── Validate coupon server-side ───────────────────────────────────────────
  let couponDiscountCents = 0;
  let validatedCouponCode: string | null = null;
  if (couponCode?.trim()) {
    const [coupon] = await db.select().from(couponsTable)
      .where(eq(sql`UPPER(${couponsTable.code})`, couponCode.trim().toUpperCase()));
    if (coupon && coupon.active
      && (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt))
      && (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit)
      && subtotalCents >= coupon.minAmountCents) {
      couponDiscountCents = applyCoupon(coupon, subtotalCents);
      validatedCouponCode = coupon.code;
    }
  }

  const productSubtotalCents = Math.max(0, subtotalCents - couponDiscountCents);

  // ── Calculate shipping server-side ────────────────────────────────────────
  let shippingClassExtraCents = 0;
  const firstProductId = resolvedItems[0]?.product?.id;
  if (firstProductId) {
    const classRow = await db.execute(
      sql`SELECT sc.extra_price_cents FROM products p
          LEFT JOIN shipping_classes sc ON sc.id = p.shipping_class_id
          WHERE p.id = ${firstProductId}`
    );
    shippingClassExtraCents = Number((classRow.rows[0] as any)?.extra_price_cents ?? 0);
  }

  const shippingResult = await calculateShipping(shippingMethodId, productSubtotalCents, shippingClassExtraCents);
  if (!shippingResult) {
    res.status(400).json({ error: "Selected shipping method is unavailable" });
    return;
  }

  const shippingAmountCents = shippingResult.shippingCents;
  const amountCents = productSubtotalCents + shippingAmountCents;
  const orderId = generateOrderId();
  const siteUrl = getSiteUrl();

  // ── Persist order to DB ───────────────────────────────────────────────────
  await db.insert(ordersTable).values({
    id: orderId,
    sessionId: (req.headers["x-session-id"] as string) || "web",
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    amountCents,
    currency: CURRENCY,
    status: "pending",
    userId: extractUserId(req),
    shippingMethodId: shippingResult.method.id,
    shippingMethodName: shippingResult.method.name,
    shippingAmountCents,
    itemsJson: JSON.stringify(resolvedItems.map(({ product, quantity }) => ({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
    }))),
    couponCode: validatedCouponCode,
    couponDiscountCents,
    subtotalCents,
  });

  req.log.info({ orderId, amountCents, currency: CURRENCY, items: resolvedItems.length }, "Bullion order created");

  // ── Mock mode (no API key) ────────────────────────────────────────────────
  if (!NEXI_API_KEY) {
    req.log.warn("NEXI_API_KEY not set — mock mode");
    await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, orderId));
    res.json({ hostedPage: `${siteUrl}${RESULT_PATH}?orderId=${orderId}&mock=1`, orderId, amountCents, couponDiscountCents, shippingAmountCents, shippingMethodName: shippingResult.method.name });
    return;
  }

  // ── Call Nexi HPP ─────────────────────────────────────────────────────────
  const description = resolvedItems.map(({ product, quantity }) => `${quantity}x ${product.name}`).join(", ").slice(0, 200);

  try {
    const nexiResponse = await fetch(`${NEXI_BASE_URL}/orders/hpp`, {
      method: "POST",
      headers: nexiHeaders(),
      body: JSON.stringify({
        order: {
          orderId,
          amount: String(amountCents),
          currency: CURRENCY,
          description,
          customerInfo: { cardHolderName: customerName.trim(), cardHolderEmail: customerEmail.trim() },
        },
        paymentSession: {
          actionType: "PAY",
          amount: String(amountCents),
          currency: CURRENCY,
          language: LANGUAGE,
          resultUrl: `${siteUrl}${RESULT_PATH}?orderId=${orderId}`,
          cancelUrl: `${siteUrl}${CANCEL_PATH}`,
          notificationUrl: `${siteUrl}${API_BASE_PATH}/checkout/notify`,
        },
      }),
    });

    if (!nexiResponse.ok) {
      const errBody = await nexiResponse.text();
      req.log.error({ orderId, nexiStatus: nexiResponse.status, errBody }, "Nexi HPP error");
      await db.update(ordersTable).set({ status: "failed" }).where(eq(ordersTable.id, orderId));
      res.status(502).json({ error: "Payment gateway error. Please try again." });
      return;
    }

    const nexiData = (await nexiResponse.json()) as { hostedPage: string; securityToken: string };

    await db.update(ordersTable).set({ nexiSecurityToken: nexiData.securityToken }).where(eq(ordersTable.id, orderId));

    req.log.info({ orderId }, "Nexi HPP session created");

    if (validatedCouponCode) {
      await db.update(couponsTable)
        .set({ usageCount: sql`${couponsTable.usageCount} + 1` })
        .where(eq(sql`UPPER(${couponsTable.code})`, validatedCouponCode.toUpperCase()));
    }

    res.json({ hostedPage: nexiData.hostedPage, orderId, amountCents, couponDiscountCents, shippingAmountCents, shippingMethodName: shippingResult.method.name });

  } catch (e) {
    req.log.error({ orderId, err: e }, "Unexpected error creating Nexi session");
    await db.update(ordersTable).set({ status: "failed" }).where(eq(ordersTable.id, orderId));
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// ─── GET /api/checkout/verify/:orderId ────────────────────────────────────────

router.get("/checkout/verify/:orderId", async (req, res) => {
  const { orderId } = req.params;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  if (order.status === "paid") {
    res.json({ orderId, status: "paid", amountCents: order.amountCents, shippingAmountCents: order.shippingAmountCents, shippingMethodName: order.shippingMethodName });
    return;
  }

  if (!NEXI_API_KEY || req.query.mock === "1") {
    if (req.query.mock === "1") await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, orderId));
    res.json({ orderId, status: req.query.mock === "1" ? "paid" : order.status, amountCents: order.amountCents });
    return;
  }

  const nexiResponse = await fetch(`${NEXI_BASE_URL}/orders/${orderId}`, { headers: nexiHeaders() });
  if (!nexiResponse.ok) {
    res.json({ orderId, status: order.status, amountCents: order.amountCents });
    return;
  }

  const nexiOrder = (await nexiResponse.json()) as { operations?: Array<{ operationResult: string }> };
  const latestOp = (nexiOrder.operations ?? []).at(-1);
  const operationResult = latestOp?.operationResult ?? "UNKNOWN";
  const status = mapOperationResult(operationResult);

  await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, orderId));

  // Send confirmation email on first paid verify
  if (status === "paid") {
    sendOrderConfirmationEmail({ to: order.customerEmail, customerName: order.customerName, orderId, amountCents: order.amountCents });
  }

  req.log.info({ orderId, operationResult, status }, "Order verified from Nexi");
  res.json({ orderId, status, operationResult, amountCents: order.amountCents, shippingAmountCents: order.shippingAmountCents, shippingMethodName: order.shippingMethodName });
});

// ─── POST /api/checkout/notify (webhook Nexi) ─────────────────────────────────

router.post("/checkout/notify", async (req, res) => {
  req.log.info({ method: req.method, path: "/checkout/notify" }, "Nexi webhook received");

  const { orderId, operationResult } = req.body as { orderId?: string; operationResult?: string };

  if (orderId && operationResult) {
    const status = mapOperationResult(operationResult);
    const nexiPaymentId = (req.body as any).operationId || (req.body as any).paymentId || null;
    await db.update(ordersTable)
      .set({ status, ...(nexiPaymentId ? { nexiPaymentId } : {}) })
      .where(eq(ordersTable.id, orderId)).catch(() => {});
    req.log.info({ orderId, operationResult, status }, "Nexi webhook processed");

    if (status === "paid") {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).catch(() => []);
      if (order) sendOrderConfirmationEmail({ to: order.customerEmail, customerName: order.customerName, orderId, amountCents: order.amountCents });
    }
  }

  res.status(200).json({ received: true });
});

export default router;
