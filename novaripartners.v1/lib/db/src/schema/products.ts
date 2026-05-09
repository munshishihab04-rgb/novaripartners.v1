import { pgTable, serial, text, decimal, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformEnum = pgEnum("platform", ["windows", "macos", "cross-platform"]);

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD").notNull(),
  imageUrl: text("image_url"),
  publisher: text("publisher").notNull(),
  version: text("version").notNull(),
  platform: platformEnum("platform").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  features: text("features").array().notNull().default([]),
  deliveryMethod: text("delivery_method").default("Email delivery within 1 minute").notNull(),
  inStock: boolean("in_stock").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  year: integer("year"),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
