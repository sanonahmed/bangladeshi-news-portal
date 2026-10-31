import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { articles } from "./articles";

// ---------------------------------------------------------------------------
// article_view_aggregates
// ---------------------------------------------------------------------------
export const articleViewAggregates = pgTable("article_view_aggregates", {
  articleId: text("article_id")
    .primaryKey()
    .references(() => articles.id, { onDelete: "cascade" }),
  totalViews: integer("total_views").notNull().default(0),
  last24h: integer("last_24h").notNull().default(0),
  last7d: integer("last_7d").notNull().default(0),
  last30d: integer("last_30d").notNull().default(0),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const articleViewAggregatesRelations = relations(
  articleViewAggregates,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleViewAggregates.articleId],
      references: [articles.id],
    }),
  })
);

// ---------------------------------------------------------------------------
// bookmarks
// ---------------------------------------------------------------------------
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("bookmarks_user_article_idx").on(t.userId, t.articleId)]
);

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
  article: one(articles, {
    fields: [bookmarks.articleId],
    references: [articles.id],
  }),
}));

// ---------------------------------------------------------------------------
// newsletter_subscribers
// ---------------------------------------------------------------------------
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ArticleViewAggregate = typeof articleViewAggregates.$inferSelect;
export type NewArticleViewAggregate =
  typeof articleViewAggregates.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber =
  typeof newsletterSubscribers.$inferInsert;
