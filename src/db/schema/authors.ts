import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const authorProfiles = pgTable("author_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  slug: text("slug").notNull().unique(),
  nameBangla: text("name_bangla").notNull(),
  nameEnglish: text("name_english"),
  designation: text("designation").notNull(),
  department: text("department").notNull().default("বার্তা বিভাগ"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bureau: text("bureau"), // e.g. "চট্টগ্রাম ব্যুরো", "সিলেট ব্যুরো", "রাজশাহী ব্যুরো", "কেন্দ্রীয় বার্তা কক্ষ"
  isBureauChief: boolean("is_bureau_chief").notNull().default(false),
  isStaff: boolean("is_staff").notNull().default(true),
  twitterHandle: text("twitter_handle"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  email: text("email"),
  phone: text("phone"),
  featuredOrder: integer("featured_order").notNull().default(0),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const authorProfilesRelations = relations(authorProfiles, ({ one }) => ({
  user: one(user, {
    fields: [authorProfiles.userId],
    references: [user.id],
  }),
}));

export type AuthorProfile = typeof authorProfiles.$inferSelect;
export type NewAuthorProfile = typeof authorProfiles.$inferInsert;
