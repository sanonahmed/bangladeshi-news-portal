import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// breaking_news
// ---------------------------------------------------------------------------
export const breakingNews = pgTable("breaking_news", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  headline: text("headline").notNull(),
  headlineEn: text("headline_en"),
  url: text("url"),
  isExternal: boolean("is_external").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const breakingNewsRelations = relations(breakingNews, ({ one }) => ({
  creator: one(user, {
    fields: [breakingNews.createdBy],
    references: [user.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BreakingNews = typeof breakingNews.$inferSelect;
export type NewBreakingNews = typeof breakingNews.$inferInsert;
