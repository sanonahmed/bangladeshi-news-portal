import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const adPlacementEnum = pgEnum("ad_placement", [
  "header_banner",
  "homepage_leaderboard",
  "sidebar",
  "between_sections",
  "article_inline",
  "mobile_slot",
  "footer",
]);

export const adTypeEnum = pgEnum("ad_type", [
  "adsense",
  "direct_image",
  "sponsored",
]);

export const adDeviceTargetEnum = pgEnum("ad_device_target", [
  "all",
  "desktop",
  "mobile",
]);

// ---------------------------------------------------------------------------
// advertisements
// ---------------------------------------------------------------------------
export const advertisements = pgTable("advertisements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  placement: adPlacementEnum("placement").notNull(),
  type: adTypeEnum("type").notNull(),
  imageUrl: text("image_url"),
  destinationUrl: text("destination_url"),
  adCode: text("ad_code"),
  altText: text("alt_text"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  deviceTarget: adDeviceTargetEnum("device_target").notNull().default("all"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const advertisementsRelations = relations(advertisements, ({ one }) => ({
  creator: one(user, {
    fields: [advertisements.createdBy],
    references: [user.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AdPlacement = (typeof adPlacementEnum.enumValues)[number];
export type AdType = (typeof adTypeEnum.enumValues)[number];
export type AdDeviceTarget = (typeof adDeviceTargetEnum.enumValues)[number];
export type Advertisement = typeof advertisements.$inferSelect;
export type NewAdvertisement = typeof advertisements.$inferInsert;
