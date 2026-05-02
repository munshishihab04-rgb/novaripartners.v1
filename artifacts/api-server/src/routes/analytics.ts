import { Router } from "express";
import { db } from "@workspace/db";
import { analyticsEventsTable } from "@workspace/db";

const router = Router();

router.post("/analytics/event", async (req, res) => {
  const { type, sessionId, page, productId, metadata } = req.body as {
    type?: string;
    sessionId?: string;
    page?: string | null;
    productId?: number | null;
    metadata?: Record<string, unknown> | null;
  };

  if (!type || !sessionId) {
    res.status(400).json({ error: "type and sessionId required" });
    return;
  }

  await db.insert(analyticsEventsTable).values({
    eventType: String(type).slice(0, 64),
    sessionId: String(sessionId).slice(0, 128),
    page: page ? String(page).slice(0, 512) : null,
    productId: productId ? Number(productId) : null,
    metadata: metadata ?? null,
  });

  res.json({ ok: true });
});

export default router;
