import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc, count, sql, inArray } from "drizzle-orm";

const router = Router();

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(503).json({ error: "Admin not configured. Set ADMIN_PASSWORD environment variable." });
    return;
  }
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${adminPassword}`) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  next();
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
  rating: productsTable.rating,
  reviewCount: productsTable.reviewCount,
});

router.post("/admin/verify", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) { res.status(503).json({ error: "Admin not configured" }); return; }
  const { password } = req.body as { password?: string };
  if (password === adminPassword) { res.json({ success: true }); }
  else { res.status(401).json({ error: "Invalid password" }); }
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
    publisher: productsTable.publisher,
    version: productsTable.version,
    imageUrl: productsTable.imageUrl,
    rating: productsTable.rating,
    reviewCount: productsTable.reviewCount,
  }).from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(productsTable.name);
  res.json(products);
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
    isFeatured: Boolean(body.isFeatured), imageUrl: body.imageUrl || null,
    rating: body.rating ? String(body.rating) : "5.0",
    reviewCount: body.reviewCount || 0,
  }).where(eq(productsTable.id, id));
  const [updated] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  res.json(updated);
});

router.get("/admin/categories", adminAuth, async (req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(cats);
});

export default router;
