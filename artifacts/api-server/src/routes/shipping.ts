import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { shippingMethodsTable, shippingClassesTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

// ── Helper: calculate shipping cost ────────────────────────────────────────
export async function calculateShipping(
  methodId: number,
  subtotalCents: number,  // after product discounts + coupon
  shippingClassExtraCents = 0
): Promise<{ method: typeof shippingMethodsTable.$inferSelect; shippingCents: number } | null> {
  const [method] = await db
    .select()
    .from(shippingMethodsTable)
    .where(eq(shippingMethodsTable.id, methodId));

  if (!method || !method.active) return null;

  let shippingCents = method.priceCents;

  if (method.type === "free") {
    shippingCents = 0;
  } else if (method.type === "free_threshold") {
    // Free if subtotal >= threshold, else charge base price
    shippingCents =
      method.freeThresholdCents !== null && subtotalCents >= method.freeThresholdCents
        ? 0
        : method.priceCents;
  }

  // Add shipping class surcharge
  shippingCents += shippingClassExtraCents;

  return { method, shippingCents: Math.max(0, shippingCents) };
}

// ── PUBLIC: list active shipping methods ────────────────────────────────────
router.get("/shipping/methods", async (_req, res) => {
  const methods = await db
    .select()
    .from(shippingMethodsTable)
    .where(eq(shippingMethodsTable.active, true))
    .orderBy(asc(shippingMethodsTable.sortOrder));
  res.json(methods);
});

// ── PUBLIC: get free shipping threshold ─────────────────────────────────────
router.get("/shipping/config", async (_req, res) => {
  const [freeMethod] = await db
    .select()
    .from(shippingMethodsTable)
    .where(
      sql`${shippingMethodsTable.active} = TRUE AND ${shippingMethodsTable.type} = 'free_threshold'`
    )
    .orderBy(asc(shippingMethodsTable.sortOrder));

  res.json({
    freeThresholdCents: freeMethod?.freeThresholdCents ?? null,
    hasFreeShipping: !!freeMethod,
  });
});

// ── PUBLIC: estimate shipping for a cart ────────────────────────────────────
router.post("/shipping/estimate", async (req: Request, res: Response) => {
  const { methodId, subtotalCents } = req.body as {
    methodId?: number;
    subtotalCents?: number;
  };
  if (typeof subtotalCents !== "number") {
    res.status(400).json({ error: "subtotalCents required" });
    return;
  }
  if (typeof methodId !== "number") {
    // Return all methods with calculated prices for this subtotal
    const methods = await db
      .select()
      .from(shippingMethodsTable)
      .where(eq(shippingMethodsTable.active, true))
      .orderBy(asc(shippingMethodsTable.sortOrder));

    const priced = methods.map(m => {
      let cents = m.priceCents;
      if (m.type === "free") cents = 0;
      else if (m.type === "free_threshold") {
        cents = m.freeThresholdCents !== null && subtotalCents >= m.freeThresholdCents
          ? 0 : m.priceCents;
      }
      return { ...m, calculatedPriceCents: Math.max(0, cents) };
    });
    res.json(priced);
    return;
  }

  const result = await calculateShipping(methodId, subtotalCents);
  if (!result) {
    res.status(404).json({ error: "Shipping method not found or inactive" });
    return;
  }
  res.json({ method: result.method, shippingCents: result.shippingCents });
});

// ── ADMIN: shipping methods CRUD ────────────────────────────────────────────
router.get("/admin/shipping/methods", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(shippingMethodsTable)
    .orderBy(asc(shippingMethodsTable.sortOrder));
  res.json(rows);
});

router.post("/admin/shipping/methods", requireAdmin, async (req: Request, res: Response) => {
  const { name, description, estimatedDays, priceCents, type, freeThresholdCents, active, sortOrder } = req.body;
  if (!name?.trim() || !type) {
    res.status(400).json({ error: "name and type required" });
    return;
  }
  const [row] = await db
    .insert(shippingMethodsTable)
    .values({
      name: name.trim(),
      description: description ?? null,
      estimatedDays: estimatedDays ?? null,
      priceCents: priceCents ?? 0,
      type,
      freeThresholdCents: freeThresholdCents ?? null,
      active: active !== false,
      sortOrder: sortOrder ?? 0,
    })
    .returning();
  res.json(row);
});

router.put("/admin/shipping/methods/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const patch: Record<string, unknown> = {};
  const f = req.body;
  if (f.name != null) patch.name = f.name.trim();
  if (f.description != null) patch.description = f.description;
  if (f.estimatedDays != null) patch.estimatedDays = f.estimatedDays;
  if (f.priceCents != null) patch.priceCents = f.priceCents;
  if (f.type != null) patch.type = f.type;
  if ("freeThresholdCents" in f) patch.freeThresholdCents = f.freeThresholdCents ?? null;
  if (f.active != null) patch.active = f.active;
  if (f.sortOrder != null) patch.sortOrder = f.sortOrder;
  const [row] = await db
    .update(shippingMethodsTable)
    .set(patch)
    .where(eq(shippingMethodsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/shipping/methods/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(shippingMethodsTable).where(eq(shippingMethodsTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// ── ADMIN: shipping classes CRUD ────────────────────────────────────────────
router.get("/admin/shipping/classes", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(shippingClassesTable);
  res.json(rows);
});

router.post("/admin/shipping/classes", requireAdmin, async (req: Request, res: Response) => {
  const { name, description, extraPriceCents, active } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db
    .insert(shippingClassesTable)
    .values({ name: name.trim(), description, extraPriceCents: extraPriceCents ?? 0, active: active !== false })
    .returning();
  res.json(row);
});

router.put("/admin/shipping/classes/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const patch: Record<string, unknown> = {};
  const f = req.body;
  if (f.name != null) patch.name = f.name.trim();
  if (f.description != null) patch.description = f.description;
  if (f.extraPriceCents != null) patch.extraPriceCents = f.extraPriceCents;
  if (f.active != null) patch.active = f.active;
  const [row] = await db
    .update(shippingClassesTable)
    .set(patch)
    .where(eq(shippingClassesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/shipping/classes/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(shippingClassesTable).where(eq(shippingClassesTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

export default router;
