import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable, cartItemsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  ListProductsQueryParams,
  GetProductParams,
  RemoveFromCartParams,
  AddToCartBody,
} from "@workspace/api-zod";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { categoryId, platform, search, limit, offset } = parsed.data;

  const conditions = [];
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (platform) conditions.push(eq(productsTable.platform, platform));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        shortDescription: productsTable.shortDescription,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        currency: productsTable.currency,
        imageUrl: productsTable.imageUrl,
        publisher: productsTable.publisher,
        version: productsTable.version,
        platform: productsTable.platform,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        features: productsTable.features,
        deliveryMethod: productsTable.deliveryMethod,
        inStock: productsTable.inStock,
        isFeatured: productsTable.isFeatured,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(where),
  ]);

  res.json({
    products: products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
      rating: parseFloat(p.rating),
    })),
    total: Number(countResult[0]?.count ?? 0),
    limit,
    offset,
  });
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      shortDescription: productsTable.shortDescription,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      currency: productsTable.currency,
      imageUrl: productsTable.imageUrl,
      publisher: productsTable.publisher,
      version: productsTable.version,
      platform: productsTable.platform,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      features: productsTable.features,
      deliveryMethod: productsTable.deliveryMethod,
      inStock: productsTable.inStock,
      isFeatured: productsTable.isFeatured,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .limit(8);

  res.json(
    products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
      rating: parseFloat(p.rating),
    }))
  );
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { id } = parsed.data;

  const results = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      shortDescription: productsTable.shortDescription,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      currency: productsTable.currency,
      imageUrl: productsTable.imageUrl,
      publisher: productsTable.publisher,
      version: productsTable.version,
      platform: productsTable.platform,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      features: productsTable.features,
      deliveryMethod: productsTable.deliveryMethod,
      inStock: productsTable.inStock,
      isFeatured: productsTable.isFeatured,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (results.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const p = results[0];
  res.json({
    ...p,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
    rating: parseFloat(p.rating),
  });
});

// GET /categories
router.get("/categories", async (req, res) => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      productCount: sql<number>`count(${productsTable.id})`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(categoriesTable.id, productsTable.categoryId))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.description);

  res.json(
    categories.map((c) => ({
      ...c,
      productCount: Number(c.productCount),
    }))
  );
});

// Cart helpers — session via cookie or header
function getSessionId(req: Parameters<typeof router.get>[1] extends (req: infer R, ...args: any[]) => any ? R : never): string {
  return (req.headers["x-session-id"] as string) || "default-session";
}

// GET /cart
router.get("/cart", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "default-session";
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  res.json({
    items: items.map((i) => ({ ...i, price: parseFloat(i.price) })),
    total,
    currency: "USD",
  });
});

// POST /cart/items
router.post("/cart/items", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "default-session";
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { productId } = parsed.data;
  const itemId = randomUUID();

  await db.insert(cartItemsTable).values({
    id: itemId,
    sessionId,
    productId,
  });

  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  res.json({
    items: items.map((i) => ({ ...i, price: parseFloat(i.price) })),
    total,
    currency: "USD",
  });
});

// DELETE /cart/items/:itemId
router.delete("/cart/items/:itemId", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "default-session";
  const parsed = RemoveFromCartParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { itemId } = parsed.data;

  await db.delete(cartItemsTable).where(
    and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId))
  );

  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  res.json({
    items: items.map((i) => ({ ...i, price: parseFloat(i.price) })),
    total,
    currency: "USD",
  });
});

export default router;
