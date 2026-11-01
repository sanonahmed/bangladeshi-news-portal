import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { articles } from "./articles";

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    userName: text("user_name").notNull(),
    userEmail: text("user_email"),
    content: text("content").notNull(),
    status: text("status").notNull().default("approved"), // "pending" | "approved" | "rejected" | "spam"
    likesCount: integer("likes_count").notNull().default(0),
    dislikesCount: integer("dislikes_count").notNull().default(0),
    parentCommentId: text("parent_comment_id"),
    moderatedBy: text("moderated_by").references(() => user.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderated_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("comments_article_id_idx").on(table.articleId),
    index("comments_status_idx").on(table.status),
    index("comments_created_at_idx").on(table.createdAt),
  ]
);

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  moderator: one(user, {
    fields: [comments.moderatedBy],
    references: [user.id],
  }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
