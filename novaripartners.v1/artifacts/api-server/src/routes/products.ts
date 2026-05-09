import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable, cartItemsTable } from "@workspace/db";
import { eq, ilike, and, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  ListProductsQueryParams,
  RemoveFromCartParams,
  AddToCartBody,
} from "@workspace/api-zod";

const router = Router();

// ── Shared select fields ──────────────────────────────────────────────────────
const productFields = {
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
  features: productsTable.features,
  deliveryMethod: productsTable.deliveryMethod,
  inStock: productsTable.inStock,
  isFeatured: productsTable.isFeatured,
  published: productsTable.published,
  year: productsTable.year,
  rating: productsTable.rating,
  reviewCount: productsTable.reviewCount,
  createdAt: productsTable.createdAt,
};

function formatProduct(p: Record<string, unknown>) {
  return {
    ...p,
    price: parseFloat(p.price as string),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : undefined,
    rating: parseFloat(p.rating as string),
  };
}

// ── GET /products — public, only published ──────────────────────────────────
router.get("/products", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query params" });
      return;
    }
    const { categoryId, platform, search, limit, offset } = parsed.data;

    const conditions = [eq(productsTable.published, true)];
    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
    if (platform) conditions.push(eq(productsTable.platform, platform));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

    const where = and(...conditions);

    const [products, countResult] = await Promise.all([
      db
        .select({ ...productFields, categoryName: categoriesTable.name })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(productsTable.year),
      db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where),
    ]);

    res.json({
      products: products.map(formatProduct),
      total: Number(countResult[0]?.count ?? 0),
      limit,
      offset,
    });
  } catch (e) {
    req.log.error({ err: e }, "GET /products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /products/featured — public, only published ──────────────────────────
router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select({ ...productFields, categoryName: categoriesTable.name })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(
        eq(productsTable.published, true),
        eq(productsTable.isFeatured, true),
      ))
      .limit(8)
      .orderBy(productsTable.year);

    res.json(products.map(formatProduct));
  } catch (e) {
    req.log.error({ err: e }, "GET /products/featured error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /products/by-slug/:slug — public, only published ─────────────────────
router.get("/products/by-slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug || typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
      res.status(400).json({ error: "Invalid slug" });
      return;
    }

    const results = await db
      .select({ ...productFields, categoryName: categoriesTable.name })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(
        eq(productsTable.slug, slug),
        eq(productsTable.published, true),
      ))
      .limit(1);

    if (results.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(formatProduct(results[0] as Record<string, unknown>));
  } catch (e) {
    req.log.error({ err: e }, "GET /products/by-slug error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /products/:id — public, only published ───────────────────────────────
router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const results = await db
      .select({ ...productFields, categoryName: categoriesTable.name })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(
        eq(productsTable.id, id),
        eq(productsTable.published, true),
      ))
      .limit(1);

    if (results.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(formatProduct(results[0] as Record<string, unknown>));
  } catch (e) {
    req.log.error({ err: e }, "GET /products/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /categories ──────────────────────────────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        productCount: sql<number>`count(${productsTable.id})`,
      })
      .from(categoriesTable)
      .leftJoin(
        productsTable,
        and(
          eq(categoriesTable.id, productsTable.categoryId),
          eq(productsTable.published, true),
        ),
      )
      .groupBy(
        categoriesTable.id,
        categoriesTable.name,
        categoriesTable.slug,
        categoriesTable.description,
      );

    res.json(categories.map((c) => ({ ...c, productCount: Number(c.productCount) })));
  } catch (e) {
    req.log.error({ err: e }, "GET /categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Cart endpoints (session-based) ──────────────────────────────────────────

// GET /cart
router.get("/cart", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "default-session";
    const items = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        slug: productsTable.slug,
        price: productsTable.price,
        imageUrl: productsTable.imageUrl,
        inStock: productsTable.inStock,
        published: productsTable.published,
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
  } catch (e) {
    req.log.error({ err: e }, "GET /cart error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /cart/items
router.post("/cart/items", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "default-session";
    const parsed = AddToCartBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const { productId } = parsed.data;

    // Verify product exists and is published
    const [product] = await db
      .select({ id: productsTable.id, published: productsTable.published, inStock: productsTable.inStock })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (!product.published) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const itemId = randomUUID();
    await db.insert(cartItemsTable).values({ id: itemId, sessionId, productId });

    const items = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        slug: productsTable.slug,
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
  } catch (e) {
    req.log.error({ err: e }, "POST /cart/items error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /cart/items/:itemId
router.delete("/cart/items/:itemId", async (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "default-session";
    const parsed = RemoveFromCartParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }
    const { itemId } = parsed.data;

    await db.delete(cartItemsTable).where(
      and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId)),
    );

    const items = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        productName: productsTable.name,
        slug: productsTable.slug,
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
  } catch (e) {
    req.log.error({ err: e }, "DELETE /cart/items error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
