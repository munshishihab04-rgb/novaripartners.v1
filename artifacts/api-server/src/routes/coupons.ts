import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

// ── Helper: calcola sconto in cents ────────────────────────────────────────
export function applyCoupon(
  coupon: { type: string; value: string },
  cartTotalCents: number
): number {
  if (coupon.type === "percent") {
    return Math.round(cartTotalCents * (parseFloat(coupon.value) / 100));
  }
  // fixed
  return Math.min(Math.round(parseFloat(coupon.value) * 100), cartTotalCents);
}

// ── PUBLIC: validate coupon ─────────────────────────────────────────────────
router.post("/coupons/validate", async (req: Request, res: Response) => {
  const { code, cartTotalCents } = req.body as {
    code?: string;
    cartTotalCents?: number;
  };
  if (!code || typeof cartTotalCents !== "number") {
    res.status(400).json({ valid: false, message: "Invalid request" });
    return;
  }

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(sql`UPPER(${couponsTable.code})`, code.trim().toUpperCase()));

  if (!coupon) {
    res.json({ valid: false, message: "Coupon not found" });
    return;
  }
  if (!coupon.active) {
    res.json({ valid: false, message: "Coupon is no longer active" });
    return;
  }
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    res.json({ valid: false, message: "Coupon has expired" });
    return;
  }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    res.json({ valid: false, message: "Coupon usage limit reached" });
    return;
  }
  if (cartTotalCents < coupon.minAmountCents) {
    const minUsd = (coupon.minAmountCents / 100).toFixed(2);
    res.json({ valid: false, message: `Minimum order $${minUsd} required` });
    return;
  }

  const discountCents = applyCoupon(coupon, cartTotalCents);

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountCents,
  });
});

// ── ADMIN CRUD ──────────────────────────────────────────────────────────────
router.get("/admin/coupons", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(couponsTable)
    .orderBy(sql`${couponsTable.createdAt} DESC`);
  res.json(rows);
});

router.post("/admin/coupons", requireAdmin, async (req: Request, res: Response) => {
  const { code, type, value, active, minAmountCents, expiresAt, usageLimit } = req.body;
  if (!code || !type || value == null) {
    res.status(400).json({ error: "code, type, value required" });
    return;
  }
  const [row] = await db
    .insert(couponsTable)
    .values({
      code: code.trim().toUpperCase(),
      type,
      value: String(value),
      active: active !== false,
      minAmountCents: minAmountCents ?? 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: usageLimit ?? null,
    })
    .returning();
  res.json(row);
});

router.put("/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { code, type, value, active, minAmountCents, expiresAt, usageLimit } = req.body;
  const patch: Record<string, unknown> = {};
  if (code != null) patch.code = code.trim().toUpperCase();
  if (type != null) patch.type = type;
  if (value != null) patch.value = String(value);
  if (active != null) patch.active = active;
  if (minAmountCents != null) patch.minAmountCents = minAmountCents;
  if ("expiresAt" in req.body) patch.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if ("usageLimit" in req.body) patch.usageLimit = usageLimit ?? null;
  const [row] = await db
    .update(couponsTable)
    .set(patch)
    .where(eq(couponsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(couponsTable).where(eq(couponsTable.id, id));
  res.json({ success: true });
});

export default router;
