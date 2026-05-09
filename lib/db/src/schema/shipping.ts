import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const shippingClassesTable = pgTable("shipping_classes", {
  id:              serial("id").primaryKey(),
  name:            text("name").notNull().unique(),
  description:     text("description"),
  extraPriceCents: integer("extra_price_cents").notNull().default(0),
  active:          boolean("active").notNull().default(true),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shippingMethodsTable = pgTable("shipping_methods", {
  id:                  serial("id").primaryKey(),
  name:                text("name").notNull(),
  description:         text("description"),
  estimatedDays:       text("estimated_days"),
  priceCents:          integer("price_cents").notNull().default(0),
  type:                text("type").notNull().default("flat_rate"), // flat_rate | free | free_threshold
  freeThresholdCents:  integer("free_threshold_cents"),
  active:              boolean("active").notNull().default(true),
  sortOrder:           integer("sort_order").notNull().default(0),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ShippingClass  = typeof shippingClassesTable.$inferSelect;
export type ShippingMethod = typeof shippingMethodsTable.$inferSelect;
