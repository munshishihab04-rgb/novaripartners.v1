import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id:                    text("id").primaryKey(),
  sessionId:             text("session_id").notNull(),
  customerName:          text("customer_name").notNull(),
  customerEmail:         text("customer_email").notNull(),
  amountCents:           integer("amount_cents").notNull(),
  currency:              text("currency").notNull().default("EUR"),
  status:                text("status").notNull().default("pending"),
  nexiSecurityToken:     text("nexi_security_token"),
  nexiPaymentId:         text("nexi_payment_id"),
  userId:                integer("user_id"),
  shippingMethodId:      integer("shipping_method_id"),
  shippingMethodName:    text("shipping_method_name"),
  shippingAmountCents:   integer("shipping_amount_cents").notNull().default(0),
  itemsJson:             text("items_json"),
  couponCode:            text("coupon_code"),
  couponDiscountCents:   integer("coupon_discount_cents").notNull().default(0),
  subtotalCents:         integer("subtotal_cents").notNull().default(0),
  volumeDiscountCents:   integer("volume_discount_cents").notNull().default(0),
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
