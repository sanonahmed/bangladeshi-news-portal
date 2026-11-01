import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// push_subscriptions
// ---------------------------------------------------------------------------
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  categories: jsonb("categories").$type<string[]>().default(["breaking", "national", "sports"]),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// breaking_alerts (web push & in-app alerts history)
// ---------------------------------------------------------------------------
export const breakingAlerts = pgTable("breaking_alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  message: text("message").notNull(),
  url: text("url").default("/"),
  category: text("category").notNull().default("breaking"), // breaking, national, sports, politics, world, business
  priority: text("priority").notNull().default("urgent"), // urgent, high, normal
  soundAlert: boolean("sound_alert").notNull().default(true),
  isBroadcasted: boolean("is_broadcasted").notNull().default(true),
  clicksCount: integer("clicks_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const breakingAlertsRelations = relations(breakingAlerts, ({ one }) => ({
  creator: one(user, {
    fields: [breakingAlerts.createdBy],
    references: [user.id],
  }),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type BreakingAlert = typeof breakingAlerts.$inferSelect;
export type NewBreakingAlert = typeof breakingAlerts.$inferInsert;
