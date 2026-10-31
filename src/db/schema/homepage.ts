import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const homepageSectionTypeEnum = pgEnum("homepage_section_type", [
  "lead",
  "latest",
  "popular",
  "category",
  "videos",
  "opinion",
  "photos",
  "ads",
  "custom",
]);

// ---------------------------------------------------------------------------
// homepage_sections
// ---------------------------------------------------------------------------
export const homepageSections = pgTable("homepage_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  sectionType: homepageSectionTypeEnum("section_type").notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const homepageSectionsRelations = relations(
  homepageSections,
  ({ one }) => ({
    category: one(categories, {
      fields: [homepageSections.categoryId],
      references: [categories.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type HomepageSection = typeof homepageSections.$inferSelect;
export type NewHomepageSection = typeof homepageSections.$inferInsert;
