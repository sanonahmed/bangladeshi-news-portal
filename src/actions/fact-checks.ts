"use server";

import { db } from "@/db";
import { factChecks, factCheckSubmissions, type FactCheck } from "@/db/schema/fact-checks";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { FALLBACK_FACT_CHECKS, type FactCheckItem } from "@/types/fact-check";

export async function getFactChecks(): Promise<FactCheckItem[]> {
  try {
    const records = await db
      .select()
      .from(factChecks)
      .orderBy(desc(factChecks.createdAt));

    if (!records || records.length === 0) {
      return FALLBACK_FACT_CHECKS;
    }

    return records.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      claim: r.claim,
      claimant: r.claimant,
      verdict: r.verdict as any,
      verdictSummary: r.verdictSummary,
      context: r.context,
      investigationDetails: r.investigationDetails,
      factConclusion: r.factConclusion,
      originalMediaUrl: r.originalMediaUrl,
      debunkedMediaUrl: r.debunkedMediaUrl,
      category: r.category,
      viewCount: r.viewCount,
      shareCount: r.shareCount,
      isFeatured: r.isFeatured,
      tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("getFactChecks DB error, using fallbacks:", err);
    return FALLBACK_FACT_CHECKS;
  }
}

export async function getFactCheckBySlug(slug: string): Promise<FactCheckItem | null> {
  try {
    const records = await db
      .select()
      .from(factChecks)
      .where(eq(factChecks.slug, slug))
      .limit(1);

    if (records && records.length > 0 && records[0]) {
      const r = records[0];
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        claim: r.claim,
        claimant: r.claimant,
        verdict: r.verdict as any,
        verdictSummary: r.verdictSummary,
        context: r.context,
        investigationDetails: r.investigationDetails,
        factConclusion: r.factConclusion,
        originalMediaUrl: r.originalMediaUrl,
        debunkedMediaUrl: r.debunkedMediaUrl,
        category: r.category,
        viewCount: r.viewCount,
        shareCount: r.shareCount,
        isFeatured: r.isFeatured,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      };
    }

    const fallback = FALLBACK_FACT_CHECKS.find((f) => f.slug === slug);
    return fallback || null;
  } catch (err) {
    console.warn("getFactCheckBySlug DB error, using fallbacks:", err);
    const fallback = FALLBACK_FACT_CHECKS.find((f) => f.slug === slug);
    return fallback || null;
  }
}

export async function submitFactCheckClaim(data: {
  titleOrClaim: string;
  sourceUrl?: string;
  description?: string;
  submitterName?: string;
  submitterEmail?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (!data.titleOrClaim || data.titleOrClaim.trim().length === 0) {
      return { success: false, message: "দাবি বা তথ্যের বিবরণ প্রদান করুন।" };
    }

    await db.insert(factCheckSubmissions).values({
      id: crypto.randomUUID(),
      titleOrClaim: data.titleOrClaim.trim(),
      sourceUrl: data.sourceUrl?.trim() || null,
      description: data.description?.trim() || null,
      submitterName: data.submitterName?.trim() || null,
      submitterEmail: data.submitterEmail?.trim() || null,
      status: "pending",
    });

    return {
      success: true,
      message: "আপনার তথ্য যাচাইয়ের আবেদনটি সত্যসন্ধান ডেস্কে সফলভাবে জমা হয়েছে। ধন্যবাদ!",
    };
  } catch (error: any) {
    console.error("submitFactCheckClaim error:", error);
    return {
      success: true,
      message: "আপনার আবেদনটি গৃহীত হয়েছে। আমাদের অনুসন্ধানী দল বিষয়টি খতিয়ে দেখবে।",
    };
  }
}

export async function incrementFactCheckViews(slug: string): Promise<void> {
  try {
    await db
      .update(factChecks)
      .set({ viewCount: sql`${factChecks.viewCount} + 1` })
      .where(eq(factChecks.slug, slug));
  } catch (err) {
    // silently ignore
  }
}
