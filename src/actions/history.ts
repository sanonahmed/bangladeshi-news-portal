"use server";

import { db } from "@/db";
import {
  historicalEvents,
  liberationWarSectors,
  birSreshthoHeroes,
} from "@/db/schema/history";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  HISTORICAL_EVENTS_SEED,
  LIBERATION_SECTORS,
  SEVEN_BIR_SRESHTHO,
  type HistoricalEventItem,
  type SectorItem,
  type BirSreshthoItem,
} from "@/types/history";

export async function getEventsForDate(
  day: number,
  month: number
): Promise<HistoricalEventItem[]> {
  try {
    const rows = await db
      .select()
      .from(historicalEvents)
      .where(and(eq(historicalEvents.day, day), eq(historicalEvents.month, month)))
      .orderBy(desc(historicalEvents.year));

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        day: r.day,
        month: r.month,
        year: r.year,
        title: r.title,
        category: r.category as any,
        description: r.description,
        significance: r.significance,
        imageUrl: r.imageUrl,
        imageCaption: r.imageCaption,
        is1971Related: r.is1971Related,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
      }));
    }

    // Fallback: check seed
    const seedMatches = HISTORICAL_EVENTS_SEED.filter(
      (h) => h.day === day && h.month === month
    );
    if (seedMatches.length > 0) {
      return seedMatches;
    }

    // If no exact match for this day, return top notable events
    return HISTORICAL_EVENTS_SEED.filter((h) => h.month === month).slice(0, 3);
  } catch (err) {
    console.warn("getEventsForDate error, using seed:", err);
    const matches = HISTORICAL_EVENTS_SEED.filter(
      (h) => h.day === day && h.month === month
    );
    return matches.length > 0
      ? matches
      : HISTORICAL_EVENTS_SEED.filter((h) => h.month === month);
  }
}

export async function get1971Timeline(): Promise<HistoricalEventItem[]> {
  try {
    const rows = await db
      .select()
      .from(historicalEvents)
      .where(eq(historicalEvents.is1971Related, true))
      .orderBy(asc(historicalEvents.month), asc(historicalEvents.day));

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        day: r.day,
        month: r.month,
        year: r.year,
        title: r.title,
        category: r.category as any,
        description: r.description,
        significance: r.significance,
        imageUrl: r.imageUrl,
        imageCaption: r.imageCaption,
        is1971Related: r.is1971Related,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
      }));
    }

    return HISTORICAL_EVENTS_SEED.filter((h) => h.is1971Related);
  } catch (err) {
    console.warn("get1971Timeline error, using seed:", err);
    return HISTORICAL_EVENTS_SEED.filter((h) => h.is1971Related);
  }
}

export async function getLiberationSectors(): Promise<SectorItem[]> {
  try {
    const rows = await db
      .select()
      .from(liberationWarSectors)
      .orderBy(asc(liberationWarSectors.sectorNumber));

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        sectorNumber: r.sectorNumber,
        title: r.title,
        commanders: r.commanders,
        headquarters: r.headquarters,
        area: r.area,
        keyOperations: r.keyOperations || "",
      }));
    }

    return LIBERATION_SECTORS;
  } catch (err) {
    console.warn("getLiberationSectors error, using seed:", err);
    return LIBERATION_SECTORS;
  }
}

export async function getBirSreshthoHeroes(): Promise<BirSreshthoItem[]> {
  try {
    const rows = await db
      .select()
      .from(birSreshthoHeroes)
      .orderBy(asc(birSreshthoHeroes.name));

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        rank: r.rank,
        sector: r.sector,
        martyrdomDate: r.martyrdomDate,
        martyrdomPlace: r.martyrdomPlace,
        heroicDeed: r.heroicDeed,
        imageUrl: r.imageUrl || "",
      }));
    }

    return SEVEN_BIR_SRESHTHO;
  } catch (err) {
    console.warn("getBirSreshthoHeroes error, using seed:", err);
    return SEVEN_BIR_SRESHTHO;
  }
}
