import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { articles } from "./articles";

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------
export const tags = pgTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

// ---------------------------------------------------------------------------
// article_tags (junction)
// ---------------------------------------------------------------------------
export const articleTags = pgTable(
  "article_tags",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("article_tags_pk").on(t.articleId, t.tagId)]
);

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ArticleTag = typeof articleTags.$inferSelect;
export type NewArticleTag = typeof articleTags.$inferInsert;
