import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  sessionId: text("session_id").notNull(),
  page: text("page"),
  productId: integer("product_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
