import { Router } from "express";
import { randomBytes, randomUUID } from "crypto";
import { checkoutLimiter } from "../app";

const router = Router();

const NEXI_API_KEY = process.env.NEXI_API_KEY || "";
const NEXI_ENV = process.env.NEXI_ENV || "sandbox";
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

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

router.post("/checkout/create-bullion-order", checkoutLimiter, async (req, res) => {
  const { customerName, customerEmail, items } = req.body as {
    customerName?: string;
    customerEmail?: string;
    items?: CartItem[];
  };

  if (!customerName?.trim() || !customerEmail?.trim()) {
    res.status(400).json({ error: "Customer name and email are required" });
    return;
  }

  if (!items || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const totalUsd = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const amountCents = Math.round(totalUsd * 100);
  const orderId = generateOrderId();
  const siteUrl = getSiteUrl();

  if (!NEXI_API_KEY) {
    req.log.warn("NEXI_API_KEY not set — returning mock hostedPage for development");
    res.json({
      hostedPage: `${siteUrl}/bullion-shop/order-success?orderId=${orderId}&mock=1`,
      orderId,
      amountCents,
    });
    return;
  }

  const description = items
    .map((i) => `${i.quantity}x ${i.name}`)
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
      { status: nexiResponse.status, body: errBody },
      "Nexi HPP error (bullion)"
    );
    res.status(502).json({ error: "Payment gateway error. Please try again." });
    return;
  }

  const nexiData = (await nexiResponse.json()) as {
    hostedPage: string;
    securityToken: string;
  };

  res.json({ hostedPage: nexiData.hostedPage, orderId, amountCents });
});

export default router;
