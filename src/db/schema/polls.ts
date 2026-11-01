import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const polls = pgTable(
  "polls",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    question: text("question").notNull(),
    description: text("description"),
    category: text("category").notNull().default("জাতীয়"),
    options: jsonb("options").$type<string[]>().notNull(),
    votes: jsonb("votes").$type<number[]>().notNull(),
    totalVotes: integer("total_votes").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("polls_is_active_idx").on(table.isActive),
    index("polls_is_featured_idx").on(table.isFeatured),
  ]
);

export const pollVotes = pgTable(
  "poll_votes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionIndex: integer("option_index").notNull(),
    ipHash: text("ip_hash"),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("poll_votes_poll_id_idx").on(table.pollId)]
);

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(user, {
    fields: [polls.createdBy],
    references: [user.id],
  }),
  votesList: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  user: one(user, {
    fields: [pollVotes.userId],
    references: [user.id],
  }),
}));

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type PollVote = typeof pollVotes.$inferSelect;
export type NewPollVote = typeof pollVotes.$inferInsert;
