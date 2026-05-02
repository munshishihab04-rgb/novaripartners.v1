import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("pending"),
  nexiSecurityToken: text("nexi_security_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
