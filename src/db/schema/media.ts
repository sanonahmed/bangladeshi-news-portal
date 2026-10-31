import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// media_assets
// ---------------------------------------------------------------------------
export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  r2Key: text("r2_key").notNull(),
  publicUrl: text("public_url").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  caption: text("caption"),
  photographerCredit: text("photographer_credit"),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  uploader: one(user, {
    fields: [mediaAssets.uploadedBy],
    references: [user.id],
  }),
  galleryImages: many(galleryImages),
}));

// ---------------------------------------------------------------------------
// media_galleries
// ---------------------------------------------------------------------------
export const mediaGalleries = pgTable("media_galleries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImageId: text("cover_image_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mediaGalleriesRelations = relations(
  mediaGalleries,
  ({ one, many }) => ({
    coverImage: one(mediaAssets, {
      fields: [mediaGalleries.coverImageId],
      references: [mediaAssets.id],
    }),
    galleryImages: many(galleryImages),
  })
);

// ---------------------------------------------------------------------------
// gallery_images (junction)
// ---------------------------------------------------------------------------
export const galleryImages = pgTable(
  "gallery_images",
  {
    galleryId: text("gallery_id")
      .notNull()
      .references(() => mediaGalleries.id, { onDelete: "cascade" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    caption: text("caption"),
  },
  (t) => [uniqueIndex("gallery_images_pk").on(t.galleryId, t.mediaAssetId)]
);

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(mediaGalleries, {
    fields: [galleryImages.galleryId],
    references: [mediaGalleries.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [galleryImages.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
export type MediaGallery = typeof mediaGalleries.$inferSelect;
export type NewMediaGallery = typeof mediaGalleries.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
