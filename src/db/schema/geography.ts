import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { articles } from "./articles";

// ---------------------------------------------------------------------------
// divisions
// ---------------------------------------------------------------------------
export const divisions = pgTable("divisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const divisionsRelations = relations(divisions, ({ many }) => ({
  districts: many(districts),
  articleLocations: many(articleLocations),
}));

// ---------------------------------------------------------------------------
// districts
// ---------------------------------------------------------------------------
export const districts = pgTable("districts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  divisionId: text("division_id")
    .notNull()
    .references(() => divisions.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const districtsRelations = relations(districts, ({ one, many }) => ({
  division: one(divisions, {
    fields: [districts.divisionId],
    references: [divisions.id],
  }),
  articleLocations: many(articleLocations),
}));

// ---------------------------------------------------------------------------
// article_locations (junction)
// ---------------------------------------------------------------------------
export const articleLocations = pgTable(
  "article_locations",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    divisionId: text("division_id").references(() => divisions.id, {
      onDelete: "set null",
    }),
    districtId: text("district_id").references(() => districts.id, {
      onDelete: "set null",
    }),
  },
  (t) => [uniqueIndex("article_locations_pk").on(t.articleId)]
);

export const articleLocationsRelations = relations(
  articleLocations,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleLocations.articleId],
      references: [articles.id],
    }),
    division: one(divisions, {
      fields: [articleLocations.divisionId],
      references: [divisions.id],
    }),
    district: one(districts, {
      fields: [articleLocations.districtId],
      references: [districts.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Division = typeof divisions.$inferSelect;
export type NewDivision = typeof divisions.$inferInsert;
export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;
export type ArticleLocation = typeof articleLocations.$inferSelect;
export type NewArticleLocation = typeof articleLocations.$inferInsert;
