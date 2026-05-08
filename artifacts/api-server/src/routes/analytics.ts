import { Router } from "express";
import { db } from "@workspace/db";
import { analyticsEventsTable } from "@workspace/db";
import { updateVisitor } from "../visitor-store";

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

  const sid = String(sessionId).slice(0, 128);
  const pg = page ? String(page).slice(0, 512) : null;
  const pid = productId ? Number(productId) : null;

  updateVisitor(sid, String(type).slice(0, 64), pg, pid);

  await db.insert(analyticsEventsTable).values({
    eventType: String(type).slice(0, 64),
    sessionId: sid,
    page: pg,
    productId: pid,
    metadata: metadata ?? null,
  });

  res.json({ ok: true });
});

export default router;
