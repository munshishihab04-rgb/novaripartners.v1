import { pgTable, serial, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const couponsTable = pgTable("coupons", {
  id:             serial("id").primaryKey(),
  code:           text("code").notNull().unique(),
  type:           text("type").notNull().default("fixed"), // "fixed" | "percent"
  value:          numeric("value", { precision: 10, scale: 2 }).notNull(),
  active:         boolean("active").notNull().default(true),
  minAmountCents: integer("min_amount_cents").notNull().default(0),
  expiresAt:      timestamp("expires_at", { withTimezone: true }),
  usageLimit:     integer("usage_limit"),
  usageCount:     integer("usage_count").notNull().default(0),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Coupon = typeof couponsTable.$inferSelect;
