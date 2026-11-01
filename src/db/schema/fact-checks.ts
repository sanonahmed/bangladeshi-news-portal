import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// fact_checks
// ---------------------------------------------------------------------------
export const factChecks = pgTable("fact_checks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  claim: text("claim").notNull(),
  claimant: text("claimant").notNull(),
  verdict: text("verdict").notNull(), // 'false' | 'misleading' | 'partially_true' | 'true' | 'altered_media'
  verdictSummary: text("verdict_summary").notNull(),
  context: text("context"),
  investigationDetails: text("investigation_details"),
  factConclusion: text("fact_conclusion"),
  originalMediaUrl: text("original_media_url"),
  debunkedMediaUrl: text("debunked_media_url"),
  category: text("category").notNull().default("সাধারণ"),
  viewCount: integer("view_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  claimDate: timestamp("claim_date"),
  tags: jsonb("tags").$type<string[]>().default([]),
  authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const factChecksRelations = relations(factChecks, ({ one }) => ({
  author: one(user, {
    fields: [factChecks.authorId],
    references: [user.id],
  }),
}));

// ---------------------------------------------------------------------------
// fact_check_submissions (Reader reported rumors)
// ---------------------------------------------------------------------------
export const factCheckSubmissions = pgTable("fact_check_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  titleOrClaim: text("title_or_claim").notNull(),
  sourceUrl: text("source_url"),
  description: text("description"),
  submitterName: text("submitter_name"),
  submitterEmail: text("submitter_email"),
  status: text("status").notNull().default("pending"), // 'pending' | 'reviewing' | 'published' | 'dismissed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FactCheck = typeof factChecks.$inferSelect;
export type NewFactCheck = typeof factChecks.$inferInsert;
export type FactCheckSubmission = typeof factCheckSubmissions.$inferSelect;
export type NewFactCheckSubmission = typeof factCheckSubmissions.$inferInsert;
