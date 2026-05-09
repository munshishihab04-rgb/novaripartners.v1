import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc, count, sql, inArray } from "drizzle-orm";
import { analyticsEventsTable } from "@workspace/db";
import { getActiveVisitors, getRecentEvents } from "../visitor-store";
import jwt from "jsonwebtoken";
import { adminLoginLimiter } from "../lib/limiters";

// Raw DB query helper for settings table (not in Drizzle schema)
async function getSetting(key: string): Promise<unknown> {
  const res = await db.execute(sql`SELECT value FROM settings WHERE key = ${key}`);
  return (res.rows[0] as { value?: unknown } | undefined)?.value ?? null;
}
async function setSetting(key: string, value: unknown): Promise<void> {
  await db.execute(
    sql`INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = NOW()`
  );
}

const router = Router();

function getJwtSecret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET env var not set");
  return s;
}

function adminAuth(req: Request, res: Response, next: NextFunction) {
  // Support token in Authorization header OR query param (for SSE/EventSource)
  const auth = req.headers.authorization || (req.query.token ? `Bearer ${req.query.token}` : "");
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, getJwtSecret());
    next();
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : "unknown";
    req.log.warn({ ip: req.ip, reason }, "Admin auth rejected");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

const fullProductSelect = (withJoin = true) => ({
  id: productsTable.id,
  name: productsTable.name,
  slug: productsTable.slug,
  shortDescription: productsTable.shortDescription,
  description: productsTable.description,
  publisher: productsTable.publisher,
  version: productsTable.version,
  platform: productsTable.platform,
  categoryId: productsTable.categoryId,
  ...(withJoin ? { categoryName: categoriesTable.name } : {}),
  price: productsTable.price,
  originalPrice: productsTable.originalPrice,
  currency: productsTable.currency,
  imageUrl: productsTable.imageUrl,
  deliveryMethod: productsTable.deliveryMethod,
  features: productsTable.features,
  inStock: productsTable.inStock,
  isFeatured: productsTable.isFeatured,
  published: productsTable.published,
  year: productsTable.year,
  rating: productsTable.rating,
  reviewCount: productsTable.reviewCount,
});

router.post("/admin/verify", adminLoginLimiter, (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) { res.status(503).json({ error: "Admin not configured" }); return; }
  const { password } = req.body as { password?: string };
  if (!password || password !== adminPassword) {
    req.log.warn({ ip: req.ip }, "Admin login failed");
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  try {
    const token = jwt.sign({ role: "admin" }, getJwtSecret(), { expiresIn: "8h" });
    req.log.info({ ip: req.ip }, "Admin login success");
    res.json({ success: true, token });
  } catch (e) {
    req.log.error({ err: e }, "Failed to sign admin JWT");
    res.status(500).json({ error: "Could not generate token" });
  }
});

router.get("/admin/stats", adminAuth, async (req, res) => {
  const [revenue, orderGroups, allProducts, recentOrders] = await Promise.all([
    db.select({ total: sql<string>`COALESCE(SUM(${ordersTable.amountCents}), 0)` }).from(ordersTable).where(eq(ordersTable.status, "paid")),
    db.select({ status: ordersTable.status, count: count() }).from(ordersTable).groupBy(ordersTable.status),
    db.select({ inStock: productsTable.inStock }).from(productsTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
  ]);
  const totalRevenueCents = Number(revenue[0]?.total || 0);
  const orderStats: Record<string, number> = {};
  for (const g of orderGroups) orderStats[g.status] = g.count;
  res.json({
    totalRevenueCents,
    totalRevenueEur: (totalRevenueCents / 100).toFixed(2),
    orderStats,
    totalOrders: orderGroups.reduce((s, g) => s + g.count, 0),
    inStockCount: allProducts.filter((p) => p.inStock).length,
    outOfStockCount: allProducts.filter((p) => !p.inStock).length,
    totalProducts: allProducts.length,
    recentOrders,
  });
});

router.get("/admin/orders", adminAuth, async (req, res) => {
  const { status } = req.query;
  const where = status && status !== "all" ? eq(ordersTable.status, status as string) : undefined;
  const orders = await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(300);
  res.json(orders);
});

router.patch("/admin/orders/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };
  await db.update(ordersTable).set({ status, updatedAt: new Date() }).where(eq(ordersTable.id, id));
  const [updated] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  res.json(updated);
});

router.get("/admin/products", adminAuth, async (req, res) => {
  try {
    const products = await db.select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      currency: productsTable.currency,
      platform: productsTable.platform,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      inStock: productsTable.inStock,
      isFeatured: productsTable.isFeatured,
      published: productsTable.published,
      year: productsTable.year,
      publisher: productsTable.publisher,
      version: productsTable.version,
      imageUrl: productsTable.imageUrl,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
    }).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(productsTable.name);
    res.json(products);
  } catch (e) {
    req.log.error({ err: e }, "GET /admin/products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// NOTE: must be registered BEFORE /admin/products/:id to avoid "export" being treated as an id
router.get("/admin/products/export", adminAuth, async (req, res) => {
  const { ids, categoryId } = req.query;

  const baseQuery = () =>
    db.select(fullProductSelect()).from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

  let rows;
  if (ids) {
    const idList = String(ids).split(",").map(Number).filter(Boolean);
    rows = idList.length > 0
      ? await baseQuery().where(inArray(productsTable.id, idList)).orderBy(productsTable.name)
      : [];
  } else if (categoryId) {
    rows = await baseQuery().where(eq(productsTable.categoryId, Number(categoryId))).orderBy(productsTable.name);
  } else {
    rows = await baseQuery().orderBy(productsTable.name);
  }

  res.json(rows);
});

router.post("/admin/products/import", adminAuth, async (req, res) => {
  const { products } = req.body as { products: Array<Record<string, unknown>> };

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ error: "No products provided" }); return;
  }

  const categories = await db.select().from(categoriesTable);
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]));

  let created = 0, updated = 0;
  const errors: string[] = [];

  for (const p of products) {
    try {
      const name = String(p.name || "").trim();
      const slug = String(p.slug || "").trim();
      if (!name || !slug) { errors.push(`Skipped: missing name or slug`); continue; }

      const catName = String(p.category || p.categoryName || "").toLowerCase().trim();
      const categoryId = (typeof p.categoryId === "number" && p.categoryId > 0)
        ? p.categoryId
        : catByName.get(catName) ?? categories[0]?.id ?? 1;

      const features = Array.isArray(p.features)
        ? p.features.map(String)
        : String(p.features || "").split("|").map((f) => f.trim()).filter(Boolean);

      const platform = ["windows", "macos", "cross-platform"].includes(String(p.platform))
        ? (String(p.platform) as "windows" | "macos" | "cross-platform")
        : "windows";

      const toBool = (v: unknown) => v === true || v === 1 || String(v).toLowerCase() === "true";

      const data = {
        name, slug,
        description: String(p.description || ""),
        shortDescription: String(p.shortDescription || ""),
        price: String(p.price || "0"),
        originalPrice: p.originalPrice ? String(p.originalPrice) : null,
        currency: String(p.currency || "EUR"),
        publisher: String(p.publisher || ""),
        version: String(p.version || "1.0"),
        platform,
        categoryId: Number(categoryId),
        features,
        deliveryMethod: String(p.deliveryMethod || "Email delivery within 24 hours"),
        inStock: toBool(p.inStock),
        isFeatured: toBool(p.isFeatured),
        published: p.published !== undefined ? toBool(p.published) : true,
        year: p.year ? Number(p.year) : null,
        imageUrl: p.imageUrl ? String(p.imageUrl) : null,
        rating: String(p.rating || "5.0"),
        reviewCount: Number(p.reviewCount || 0),
      };

      const [existing] = await db.select({ id: productsTable.id })
        .from(productsTable).where(eq(productsTable.slug, slug));

      if (existing) {
        await db.update(productsTable).set(data).where(eq(productsTable.id, existing.id));
        updated++;
      } else {
        await db.insert(productsTable).values(data);
        created++;
      }
    } catch (e) {
      errors.push(`"${p.name}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  res.json({ created, updated, errors, total: products.length });
});

router.get("/admin/products/:id", adminAuth, async (req, res) => {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, Number(req.params.id)));
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(product);
});

router.put("/admin/products/:id", adminAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body as {
    name: string; slug: string; description: string; shortDescription: string;
    price: string | number; originalPrice?: string | number | null;
    currency?: string; publisher: string; version: string;
    platform: "windows" | "macos" | "cross-platform"; categoryId: number;
    features: string[]; deliveryMethod: string; inStock: boolean;
    isFeatured: boolean; imageUrl?: string | null;
    rating?: string | number; reviewCount?: number;
    published?: boolean; year?: number | null;
  };
  await db.update(productsTable).set({
    name: body.name, slug: body.slug,
    description: body.description, shortDescription: body.shortDescription,
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    currency: body.currency || "EUR",
    publisher: body.publisher, version: body.version, platform: body.platform,
    categoryId: Number(body.categoryId), features: body.features || [],
    deliveryMethod: body.deliveryMethod, inStock: Boolean(body.inStock),
    isFeatured: Boolean(body.isFeatured),
    published: body.published !== undefined ? Boolean(body.published) : true,
    year: body.year !== undefined ? (body.year ? Number(body.year) : null) : undefined,
    imageUrl: body.imageUrl || null,
    rating: body.rating ? String(body.rating) : "5.0",
    reviewCount: body.reviewCount || 0,
  }).where(eq(productsTable.id, id));
  const [updated] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  res.json(updated);
});

router.post("/admin/products", adminAuth, async (req, res) => {
  const body = req.body as {
    name: string; slug: string; description: string; shortDescription: string;
    price: string | number; originalPrice?: string | number | null;
    currency?: string; publisher: string; version: string;
    platform: "windows" | "macos" | "cross-platform"; categoryId: number;
    features: string[]; deliveryMethod: string; inStock: boolean;
    isFeatured: boolean; imageUrl?: string | null;
    rating?: string | number; reviewCount?: number;
  };
  const [created] = await db.insert(productsTable).values({
    name: body.name, slug: body.slug,
    description: body.description || "", shortDescription: body.shortDescription || "",
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    currency: body.currency || "EUR",
    publisher: body.publisher || "", version: body.version || "1.0",
    platform: body.platform || "windows",
    categoryId: Number(body.categoryId),
    features: body.features || [],
    deliveryMethod: body.deliveryMethod || "Email delivery within 24 hours",
    inStock: Boolean(body.inStock),
    isFeatured: Boolean(body.isFeatured),
    published: body.published !== undefined ? Boolean(body.published) : true,
    year: body.year !== undefined ? (body.year ? Number(body.year) : null) : null,
    imageUrl: body.imageUrl || null,
    rating: body.rating ? String(body.rating) : "5.0",
    reviewCount: body.reviewCount || 0,
  }).returning();
  res.status(201).json(created);
});

router.delete("/admin/products/:id", adminAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/categories", adminAuth, async (req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(cats);
});

router.post("/admin/categories", adminAuth, async (req, res) => {
  const { name, slug, description } = req.body as { name: string; slug: string; description?: string };
  if (!name || !slug) { res.status(400).json({ error: "name and slug required" }); return; }
  const [created] = await db.insert(categoriesTable).values({ name, slug, description: description || null }).returning();
  res.status(201).json(created);
});

// Real-time visitors (SSE)
router.get("/admin/visitors/stream", adminAuth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = () => {
    const visitors = getActiveVisitors();
    const events = getRecentEvents(30);
    res.write(`data: ${JSON.stringify({ visitors, events, ts: Date.now() })}\n\n`);
  };

  send();
  const iv = setInterval(send, 3000);
  req.on("close", () => clearInterval(iv));
});

router.get("/admin/visitors", adminAuth, (req, res) => {
  const visitors = getActiveVisitors();
  const events = getRecentEvents(30);
  res.json({ visitors, events, ts: Date.now() });
});

router.get("/admin/analytics", adminAuth, async (req, res) => {
  const months: { key: string; label: string; revenue: number; orders: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      revenue: 0,
      orders: 0,
    });
  }

  const [revenueRows, funnelRows, sessionRows, topPagesRows, paidRows] = await Promise.all([
    db.execute(sql`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month_key,
             COALESCE(SUM(amount_cents), 0)::bigint as revenue_cents,
             COUNT(*)::int as order_count
      FROM orders
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
    `),
    db.execute(sql`
      SELECT event_type, COUNT(DISTINCT session_id)::int as sessions
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY event_type
    `),
    db.execute(sql`
      SELECT COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days'  THEN session_id END)::int AS sessions_7d,
             COUNT(DISTINCT session_id)::int AS sessions_30d,
             COUNT(*)::int AS page_views_30d
      FROM analytics_events
      WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '30 days'
    `),
    db.execute(sql`
      SELECT page, COUNT(*)::int as views
      FROM analytics_events
      WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '30 days' AND page IS NOT NULL
      GROUP BY page ORDER BY views DESC LIMIT 8
    `),
    db.execute(sql`
      SELECT COUNT(*)::int as cnt FROM orders
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'
    `),
  ]);

  for (const row of revenueRows.rows) {
    const m = months.find((m) => m.key === row.month_key);
    if (m) { m.revenue = Number(row.revenue_cents) / 100; m.orders = Number(row.order_count); }
  }

  const funnelMap: Record<string, number> = {};
  for (const row of funnelRows.rows) funnelMap[String(row.event_type)] = Number(row.sessions);

  const sd = sessionRows.rows[0] ?? {};

  res.json({
    monthlyRevenue: months.map((m) => ({ month: m.label, revenue: m.revenue, orders: m.orders })),
    funnel: {
      pageViews: funnelMap["page_view"] ?? 0,
      productViews: funnelMap["product_view"] ?? 0,
      checkoutStarted: funnelMap["start_checkout"] ?? 0,
      paidOrders: Number(paidRows.rows[0]?.cnt ?? 0),
    },
    sessions7d: Number(sd.sessions_7d ?? 0),
    sessions30d: Number(sd.sessions_30d ?? 0),
    pageViews30d: Number(sd.page_views_30d ?? 0),
    topPages: topPagesRows.rows.map((r) => ({ page: String(r.page), views: Number(r.views) })),
  });
});

// ── Discount tiers (public) ──────────────────────────────────────────────────
router.get("/discount-tiers", async (_req, res) => {
  try {
    const tiers = await getSetting("discount_tiers");
    res.json(tiers ?? []);
  } catch { res.json([]); }
});

// ── Discount tiers admin CRUD ─────────────────────────────────────────────────
router.get("/admin/discount-tiers", adminAuth, async (_req, res) => {
  const tiers = await getSetting("discount_tiers");
  res.json(tiers ?? []);
});

router.put("/admin/discount-tiers", adminAuth, async (req, res) => {
  const tiers = req.body as Array<{ minQty: number; maxQty: number | null; discountPercent: number; label: string }>;
  if (!Array.isArray(tiers)) { res.status(400).json({ error: "Expected array" }); return; }
  // Validate
  for (const t of tiers) {
    if (typeof t.minQty !== "number" || typeof t.discountPercent !== "number") {
      res.status(400).json({ error: "Invalid tier format" }); return;
    }
    if (t.discountPercent < 0 || t.discountPercent > 80) {
      res.status(400).json({ error: "Discount must be 0–80%" }); return;
    }
  }
  await setSetting("discount_tiers", tiers);
  res.json({ ok: true, tiers });
});

export default router;
