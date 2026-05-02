import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";

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

router.post("/admin/verify", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(503).json({ error: "Admin not configured" });
    return;
  }
  const { password } = req.body as { password?: string };
  if (password === adminPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

router.get("/admin/stats", adminAuth, async (req, res) => {
  const [revenue, orderGroups, allProducts, recentOrders] = await Promise.all([
    db.select({
      total: sql<string>`COALESCE(SUM(${ordersTable.amountCents}), 0)`,
    }).from(ordersTable).where(eq(ordersTable.status, "paid")),
    db.select({
      status: ordersTable.status,
      count: count(),
    }).from(ordersTable).groupBy(ordersTable.status),
    db.select({ inStock: productsTable.inStock }).from(productsTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
  ]);

  const totalRevenueCents = Number(revenue[0]?.total || 0);
  const orderStats: Record<string, number> = {};
  for (const g of orderGroups) orderStats[g.status] = g.count;
  const totalOrders = orderGroups.reduce((s, g) => s + g.count, 0);

  res.json({
    totalRevenueCents,
    totalRevenueEur: (totalRevenueCents / 100).toFixed(2),
    orderStats,
    totalOrders,
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
    name: body.name,
    slug: body.slug,
    description: body.description,
    shortDescription: body.shortDescription,
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    currency: body.currency || "EUR",
    publisher: body.publisher,
    version: body.version,
    platform: body.platform,
    categoryId: Number(body.categoryId),
    features: body.features || [],
    deliveryMethod: body.deliveryMethod,
    inStock: Boolean(body.inStock),
    isFeatured: Boolean(body.isFeatured),
    imageUrl: body.imageUrl || null,
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
