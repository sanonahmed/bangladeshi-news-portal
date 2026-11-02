import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// historical_events (This Day in History & Timeline Archive)
// ---------------------------------------------------------------------------
export const historicalEvents = pgTable("historical_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  day: integer("day").notNull(), // 1 to 31
  month: integer("month").notNull(), // 1 to 12
  year: integer("year").notNull(), // e.g. 1971, 1975, 1952
  title: text("title").notNull(),
  category: text("category").notNull().default("জাতীয়"), // মুক্তিযুদ্ধ, জাতীয়, আন্তর্জাতিক, সংস্কৃতি, ইতিহাস
  description: text("description").notNull(),
  significance: text("significance"),
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  is1971Related: boolean("is_1971_related").notNull().default(false),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// liberation_war_sectors (1971 Sectors & Commanders)
// ---------------------------------------------------------------------------
export const liberationWarSectors = pgTable("liberation_war_sectors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectorNumber: integer("sector_number").notNull().unique(),
  title: text("title").notNull(),
  commanders: text("commanders").notNull(),
  headquarters: text("headquarters").notNull(),
  area: text("area").notNull(),
  keyOperations: text("key_operations"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// bir_sreshtho_heroes (7 Highest Gallantry Award Recipients)
// ---------------------------------------------------------------------------
export const birSreshthoHeroes = pgTable("bir_sreshtho_heroes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  rank: text("rank").notNull(),
  sector: text("sector").notNull(),
  martyrdomDate: text("martyrdom_date").notNull(),
  martyrdomPlace: text("martyrdom_place").notNull(),
  heroicDeed: text("heroic_deed").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type HistoricalEvent = typeof historicalEvents.$inferSelect;
export type NewHistoricalEvent = typeof historicalEvents.$inferInsert;
export type LiberationWarSector = typeof liberationWarSectors.$inferSelect;
export type NewLiberationWarSector = typeof liberationWarSectors.$inferInsert;
export type BirSreshthoHero = typeof birSreshthoHeroes.$inferSelect;
export type NewBirSreshthoHero = typeof birSreshthoHeroes.$inferInsert;
