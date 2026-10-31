import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// site_settings
// ---------------------------------------------------------------------------
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  updater: one(user, {
    fields: [siteSettings.updatedBy],
    references: [user.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
