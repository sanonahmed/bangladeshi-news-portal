import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

// ---------------------------------------------------------------------------
// navigation_items
// ---------------------------------------------------------------------------
export const navigationItems = pgTable("navigation_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull(),
  labelEn: text("label_en"),
  href: text("href").notNull(),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  openInNewTab: boolean("open_in_new_tab").notNull().default(false),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  iconName: text("icon_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const navigationItemsRelations = relations(
  navigationItems,
  ({ one, many }) => ({
    parent: one(navigationItems, {
      fields: [navigationItems.parentId],
      references: [navigationItems.id],
      relationName: "navItemChildren",
    }),
    children: many(navigationItems, { relationName: "navItemChildren" }),
    category: one(categories, {
      fields: [navigationItems.categoryId],
      references: [categories.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type NavigationItem = typeof navigationItems.$inferSelect;
export type NewNavigationItem = typeof navigationItems.$inferInsert;
