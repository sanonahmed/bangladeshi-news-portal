import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categories } from "./categories";
import { mediaAssets } from "./media";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "pending_review",
  "approved",
  "published",
  "unpublished",
  "archived",
  "rejected",
]);

export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];

export const articleAuthorRoleEnum = pgEnum("article_author_role", [
  "primary",
  "co_author",
]);

export const editorialReviewStatusEnum = pgEnum("editorial_review_status", [
  "pending",
  "approved",
  "rejected",
]);

// ---------------------------------------------------------------------------
// articles
// ---------------------------------------------------------------------------
export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    titleEn: text("title_en"),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featuredImageId: text("featured_image_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" }
    ),
    featuredImageAlt: text("featured_image_alt"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: articleStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    socialImageId: text("social_image_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBreaking: boolean("is_breaking").notNull().default(false),
    featuredOrder: integer("featured_order"),
    viewCount: integer("view_count").notNull().default(0),
    newsLocation: text("news_location"),
    correctionNote: text("correction_note"),
    correctionAt: timestamp("correction_at"),
    language: text("language").notNull().default("bn"),
  },
  (t) => [
    index("articles_slug_idx").on(t.slug),
    index("articles_status_idx").on(t.status),
    index("articles_published_at_idx").on(t.publishedAt),
    index("articles_author_id_idx").on(t.authorId),
    index("articles_is_breaking_idx").on(t.isBreaking),
    index("articles_language_idx").on(t.language),
  ]
);

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(user, { fields: [articles.authorId], references: [user.id] }),
  featuredImage: one(mediaAssets, {
    fields: [articles.featuredImageId],
    references: [mediaAssets.id],
    relationName: "articleFeaturedImage",
  }),
  socialImage: one(mediaAssets, {
    fields: [articles.socialImageId],
    references: [mediaAssets.id],
    relationName: "articleSocialImage",
  }),
  revisions: many(articleRevisions),
  articleAuthors: many(articleAuthors),
  articleCategories: many(articleCategories),
  editorialReviews: many(editorialReviews),
  articleTags: many(articleTags),
}));

// ---------------------------------------------------------------------------
// article_revisions
// ---------------------------------------------------------------------------
export const articleRevisions = pgTable("article_revisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  title: text("title").notNull(),
  editedBy: text("edited_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  editedAt: timestamp("edited_at").notNull().defaultNow(),
  revisionNote: text("revision_note"),
});

export const articleRevisionsRelations = relations(
  articleRevisions,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleRevisions.articleId],
      references: [articles.id],
    }),
    editor: one(user, {
      fields: [articleRevisions.editedBy],
      references: [user.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// article_authors (junction)
// ---------------------------------------------------------------------------
export const articleAuthors = pgTable(
  "article_authors",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: articleAuthorRoleEnum("role").notNull().default("primary"),
  },
  (t) => [uniqueIndex("article_authors_pk").on(t.articleId, t.userId)]
);

export const articleAuthorsRelations = relations(articleAuthors, ({ one }) => ({
  article: one(articles, {
    fields: [articleAuthors.articleId],
    references: [articles.id],
  }),
  user: one(user, {
    fields: [articleAuthors.userId],
    references: [user.id],
  }),
}));

// ---------------------------------------------------------------------------
// article_categories (junction)
// ---------------------------------------------------------------------------
export const articleCategories = pgTable(
  "article_categories",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("article_categories_pk").on(t.articleId, t.categoryId)]
);

export const articleCategoriesRelations = relations(
  articleCategories,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleCategories.articleId],
      references: [articles.id],
    }),
    category: one(categories, {
      fields: [articleCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// editorial_reviews
// ---------------------------------------------------------------------------
export const editorialReviews = pgTable("editorial_reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  status: editorialReviewStatusEnum("status").notNull().default("pending"),
  comment: text("comment"),
  reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),
});

export const editorialReviewsRelations = relations(
  editorialReviews,
  ({ one }) => ({
    article: one(articles, {
      fields: [editorialReviews.articleId],
      references: [articles.id],
    }),
    reviewer: one(user, {
      fields: [editorialReviews.reviewerId],
      references: [user.id],
    }),
  })
);

// Re-export from tags for relation wiring
import { articleTags } from "./tags";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type ArticleRevision = typeof articleRevisions.$inferSelect;
export type NewArticleRevision = typeof articleRevisions.$inferInsert;
export type ArticleAuthor = typeof articleAuthors.$inferSelect;
export type NewArticleAuthor = typeof articleAuthors.$inferInsert;
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type NewArticleCategory = typeof articleCategories.$inferInsert;
export type EditorialReview = typeof editorialReviews.$inferSelect;
export type NewEditorialReview = typeof editorialReviews.$inferInsert;
