import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes, randomUUID } from "crypto";

const router = Router();

const NEXI_API_KEY = process.env.NEXI_API_KEY || "";
const NEXI_ENV = process.env.NEXI_ENV || "sandbox";
const NEXI_BASE =
  NEXI_ENV === "production"
    ? "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1"
    : "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";

function getSiteUrl(): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",");
  if (domains?.length) return `https://${domains[0].trim()}`;
  return `https://${process.env.REPLIT_DEV_DOMAIN}`;
}

function generateOrderId(): string {
  return `NK${randomBytes(8).toString("hex").toUpperCase()}`;
}

router.post("/checkout/create-order", async (req, res) => {
  const sessionId =
    (req.headers["x-session-id"] as string) || "default-session";
  const { customerName, customerEmail } = req.body as {
    customerName?: string;
    customerEmail?: string;
  };

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
  const amountCents = Math.round(totalEur * 100);
  const orderId = generateOrderId();
  const siteUrl = getSiteUrl();

  await db.insert(ordersTable).values({
    id: orderId,
    sessionId,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    amountCents,
    currency: "EUR",
    status: "pending",
  });

  if (!NEXI_API_KEY) {
    req.log.warn("NEXI_API_KEY not set — returning mock hostedPage for development");
    res.json({
      hostedPage: `${siteUrl}/checkout/result/${orderId}?mock=1`,
      orderId,
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
        currency: "EUR",
        description,
        customerInfo: {
          cardHolderName: customerName.trim(),
          cardHolderEmail: customerEmail.trim(),
        },
      },
      resultUrl: `${siteUrl}/checkout/result/${orderId}`,
      cancelUrl: `${siteUrl}/checkout/cancel`,
      notificationUrl: `${siteUrl}/api/checkout/notify`,
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

  res.json({ hostedPage: nexiData.hostedPage, orderId });
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
  req.log.info({ body: req.body }, "Nexi payment notification received");
  res.status(200).json({ received: true });
});

export default router;
