import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: text("parent_id"),
  color: text("color"),
  iconName: text("icon_name"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  showInNav: boolean("show_in_nav").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryChildren",
  }),
  children: many(categories, { relationName: "categoryChildren" }),
  // articleCategories relation is declared in articles.ts to avoid circular dep
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
