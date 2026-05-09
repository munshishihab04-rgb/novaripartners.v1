import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes, randomUUID } from "crypto";

const router = Router();

const NEXI_API_KEY = process.env.NEXI_API_KEY || "";
const NEXI_ENV = process.env.NEXI_ENV || "sandbox";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

async function sendOrderConfirmationEmail(opts: {
  to: string;
  customerName: string;
  orderId: string;
  amountCents: number;
  currency: string;
}) {
  if (!RESEND_API_KEY) return; // silently skip if not configured
  try {
    const amount = (opts.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: opts.currency });
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "NOVARI PARTNERS <contact@novaripartnersllc.com>",
        to: [opts.to],
        subject: `Order Confirmed — ${opts.orderId}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;">
            <h2 style="font-size:24px;color:#111;">Thank you, ${opts.customerName}!</h2>
            <p style="color:#555;font-size:15px;">Your order <strong>#${opts.orderId}</strong> has been confirmed.</p>
            <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:24px 0;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#111;">Total: ${amount}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#888;">American Silver Eagle BU Coin(s) — .999 Fine Silver</p>
            </div>
            <p style="color:#555;font-size:14px;">We will ship your order within 2 business days. You will receive a separate tracking notification once your package is in transit.</p>
            <p style="color:#555;font-size:14px;">Questions? Reply to this email or contact us at <a href="mailto:contact@novaripartnersllc.com" style="color:#b87333;">contact@novaripartnersllc.com</a>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
            <p style="color:#aaa;font-size:12px;">NOVARI PARTNERS LLC &mdash; 30 N Gould St Ste R, Sheridan, WY 82801</p>
          </div>`,
      }),
    });
  } catch { /* non-blocking */ }
}
const NEXI_BASE =
  NEXI_ENV === "production"
    ? "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1"
    : "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";

function getEurUsdRate(): number {
  const r = parseFloat(process.env.EUR_USD_RATE || "1.09");
  return isFinite(r) && r > 0 ? r : 1.09;
}

function getSiteUrl(): string {
  return process.env.SITE_URL || "https://novaripartners.com";
}

function generateOrderId(): string {
  return `NK${randomBytes(8).toString("hex").toUpperCase()}`;
}

router.post("/checkout/create-order", async (req, res) => {
  const sessionId =
    (req.headers["x-session-id"] as string) || "default-session";
  const { customerName, customerEmail, currency = "EUR" } = req.body as {
    customerName?: string;
    customerEmail?: string;
    currency?: string;
  };
  const selectedCurrency = currency === "USD" ? "USD" : "EUR";

  if (!customerName?.trim() || !customerEmail?.trim()) {
    res.status(400).json({ error: "Customer name and email are required" });
    return;
  }

  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      price: productsTable.price,
      name: productsTable.name,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const totalEur = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price as string),
    0
  );
  const rate = getEurUsdRate();
  const amountCents =
    selectedCurrency === "USD"
      ? Math.round(totalEur * rate * 100)
      : Math.round(totalEur * 100);
  const orderId = generateOrderId();
  const siteUrl = getSiteUrl();

  await db.insert(ordersTable).values({
    id: orderId,
    sessionId,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    amountCents,
    currency: selectedCurrency,
    status: "pending",
  });

  if (!NEXI_API_KEY) {
    req.log.warn("NEXI_API_KEY not set — returning mock hostedPage for development");
    res.json({
      hostedPage: `${siteUrl}/checkout/result/${orderId}?mock=1`,
      orderId,
      currency: selectedCurrency,
      amountCents,
    });
    return;
  }

  const description = cartItems
    .map((i) => i.name)
    .join(", ")
    .slice(0, 200);

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
        currency: selectedCurrency,
        description,
        customerInfo: {
          cardHolderName: customerName.trim(),
          cardHolderEmail: customerEmail.trim(),
        },
      },
      paymentSession: {
        actionType: "PAY",
        amount: String(amountCents),
        currency: selectedCurrency,
        language: "ita",
        resultUrl: `${siteUrl}/checkout/result/${orderId}`,
        cancelUrl: `${siteUrl}/checkout/cancel`,
        notificationUrl: `${siteUrl}/api/checkout/notify`,
      },
    }),
  });

  if (!nexiResponse.ok) {
    const errBody = await nexiResponse.text();
    req.log.error(
      { status: nexiResponse.status, body: errBody },
      "Nexi HPP error"
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

  await db
    .update(ordersTable)
    .set({ nexiSecurityToken: nexiData.securityToken })
    .where(eq(ordersTable.id, orderId));

  res.json({ hostedPage: nexiData.hostedPage, orderId, currency: selectedCurrency, amountCents });
});

router.get("/checkout/verify/:orderId", async (req, res) => {
  const { orderId } = req.params;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "paid") {
    res.json({ orderId, status: "paid" });
    return;
  }

  if (!NEXI_API_KEY) {
    const mockPaid = req.query.mock === "1";
    const status = mockPaid ? "paid" : order.status;
    res.json({ orderId, status });
    return;
  }

  const nexiResponse = await fetch(`${NEXI_BASE}/orders/${orderId}`, {
    headers: {
      "X-Api-Key": NEXI_API_KEY,
      "Correlation-Id": randomUUID(),
    },
  });

  if (!nexiResponse.ok) {
    res.status(502).json({ error: "Could not verify order with payment gateway" });
    return;
  }

  const nexiOrder = (await nexiResponse.json()) as {
    operations?: Array<{ operationResult: string }>;
  };

  const operations = nexiOrder.operations || [];
  const latestOp = operations[operations.length - 1];
  const operationResult = latestOp?.operationResult || "UNKNOWN";

  let status = "pending";
  if (operationResult === "AUTHORIZED" || operationResult === "EXECUTED") {
    status = "paid";
  } else if (
    operationResult === "DECLINED" ||
    operationResult === "FAILED" ||
    operationResult === "VOIDED"
  ) {
    status = "failed";
  } else if (operationResult === "CANCELLED") {
    status = "cancelled";
  }

  await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, orderId));

  res.json({ orderId, status, operationResult });
});

router.post("/checkout/notify", async (req, res) => {
  // Never log full body — may contain securityToken
  req.log.info({ method: "POST", path: "/checkout/notify" }, "Nexi webhook received");

  try {
    const { orderId, operationResult, securityToken, amount, currency } = req.body as {
      orderId?: string;
      operationResult?: string;
      securityToken?: string;
      amount?: string;
      currency?: string;
    };

    if (!orderId) {
      req.log.warn("Nexi notify: missing orderId");
      res.status(200).json({ received: true });
      return;
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) {
      req.log.warn({ orderId }, "Nexi notify: orderId not found");
      res.status(200).json({ received: true });
      return;
    }

    // Idempotency: already in final state
    if (order.status === "paid" || order.status === "refunded") {
      req.log.info({ orderId, status: order.status }, "Nexi notify: duplicate ignored (already final)");
      res.status(200).json({ received: true });
      return;
    }

    // Verify securityToken
    if (NEXI_API_KEY && order.nexiSecurityToken) {
      if (securityToken !== order.nexiSecurityToken) {
        req.log.warn({ orderId }, "Nexi notify: securityToken mismatch");
        res.status(200).json({ received: true });
        return;
      }
    }

    // Verify amount if provided
    if (amount !== undefined) {
      const notifiedAmountCents = Math.round(parseFloat(amount));
      if (Math.abs(notifiedAmountCents - order.amountCents) > 1) {
        req.log.warn(
          { orderId, expected: order.amountCents, received: notifiedAmountCents },
          "Nexi notify: amount mismatch"
        );
        res.status(200).json({ received: true });
        return;
      }
    }

    // Verify currency if provided
    if (currency && currency !== order.currency) {
      req.log.warn(
        { orderId, expected: order.currency, received: currency },
        "Nexi notify: currency mismatch"
      );
      res.status(200).json({ received: true });
      return;
    }

    // Map Nexi operationResult to our status
    let newStatus = order.status;
    if (operationResult === "AUTHORIZED" || operationResult === "EXECUTED") {
      newStatus = "paid";
    } else if (operationResult === "DECLINED" || operationResult === "FAILED" || operationResult === "VOIDED") {
      newStatus = "failed";
    } else if (operationResult === "CANCELLED") {
      newStatus = "cancelled";
    }

    if (newStatus !== order.status) {
      await db
        .update(ordersTable)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(ordersTable.id, orderId));
      req.log.info(
        { orderId, operationResult, oldStatus: order.status, newStatus },
        "Nexi notify: order status updated"
      );
      // Send email confirmation when order becomes paid
      if (newStatus === "paid" && order.customerEmail) {
        sendOrderConfirmationEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderId: order.id,
          amountCents: order.amountCents,
          currency: order.currency,
        });
      }
    } else {
      req.log.info({ orderId, operationResult }, "Nexi notify: no status change");
    }

    res.status(200).json({ received: true });
  } catch (e) {
    req.log.error({ err: e }, "Nexi notify handler error");
    res.status(200).json({ received: true }); // always 200 to avoid Nexi retries
  }
});

export default router;
