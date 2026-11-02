"use server";

import { db } from "@/db";
import { factChecks, factCheckSubmissions, type FactCheck } from "@/db/schema/fact-checks";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { FALLBACK_FACT_CHECKS, FALLBACK_SUBMISSIONS, type FactCheckItem, type FactCheckSubmissionItem } from "@/types/fact-check";

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

export interface FactCheckInput {
  title: string;
  slug?: string;
  claim: string;
  claimant: string;
  verdict: "false" | "misleading" | "partially_true" | "true" | "altered_media";
  verdictSummary: string;
  context?: string;
  investigationDetails?: string;
  factConclusion?: string;
  originalMediaUrl?: string;
  debunkedMediaUrl?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export async function createFactCheck(
  data: FactCheckInput
): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const rawSlug =
      data.slug?.trim() ||
      data.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
    const finalSlug = rawSlug || `factcheck-${Date.now()}`;

    await db.insert(factChecks).values({
      id: crypto.randomUUID(),
      title: data.title.trim(),
      slug: finalSlug,
      claim: data.claim.trim(),
      claimant: data.claimant.trim(),
      verdict: data.verdict,
      verdictSummary: data.verdictSummary.trim(),
      context: data.context?.trim() || null,
      investigationDetails: data.investigationDetails?.trim() || null,
      factConclusion: data.factConclusion?.trim() || null,
      originalMediaUrl: data.originalMediaUrl?.trim() || null,
      debunkedMediaUrl: data.debunkedMediaUrl?.trim() || null,
      category: data.category?.trim() || "সাধারণ",
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? false,
      viewCount: 0,
      shareCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/fact-check");
    revalidatePath(`/fact-check/${finalSlug}`);
    revalidatePath("/admin/fact-checks");

    return { success: true, slug: finalSlug };
  } catch (err: any) {
    console.error("createFactCheck error:", err);
    return { success: false, error: err?.message || "ফ্যাক্ট-চেক তৈরি করতে সমস্যা হয়েছে" };
  }
}

export async function updateFactCheck(
  id: string,
  data: Partial<FactCheckInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(factChecks).where(eq(factChecks.id, id)).limit(1);
    if (!existing) {
      return { success: false, error: "ফ্যাক্ট-চেক রেকর্ড পাওয়া যায়নি" };
    }

    await db
      .update(factChecks)
      .set({
        title: data.title !== undefined ? data.title.trim() : existing.title,
        claim: data.claim !== undefined ? data.claim.trim() : existing.claim,
        claimant: data.claimant !== undefined ? data.claimant.trim() : existing.claimant,
        verdict: data.verdict || existing.verdict,
        verdictSummary: data.verdictSummary !== undefined ? data.verdictSummary.trim() : existing.verdictSummary,
        context: data.context !== undefined ? data.context?.trim() || null : existing.context,
        investigationDetails:
          data.investigationDetails !== undefined
            ? data.investigationDetails?.trim() || null
            : existing.investigationDetails,
        factConclusion: data.factConclusion !== undefined ? data.factConclusion?.trim() || null : existing.factConclusion,
        originalMediaUrl:
          data.originalMediaUrl !== undefined ? data.originalMediaUrl?.trim() || null : existing.originalMediaUrl,
        debunkedMediaUrl:
          data.debunkedMediaUrl !== undefined ? data.debunkedMediaUrl?.trim() || null : existing.debunkedMediaUrl,
        category: data.category !== undefined ? data.category?.trim() || "সাধারণ" : existing.category,
        tags: data.tags !== undefined ? data.tags : existing.tags,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(factChecks.id, id));

    revalidatePath("/fact-check");
    revalidatePath(`/fact-check/${existing.slug}`);
    revalidatePath("/admin/fact-checks");

    return { success: true };
  } catch (err: any) {
    console.error("updateFactCheck error:", err);
    return { success: false, error: err?.message || "হালনাগাদ ব্যর্থ হয়েছে" };
  }
}

export async function deleteFactCheck(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db.select().from(factChecks).where(eq(factChecks.id, id)).limit(1);
    await db.delete(factChecks).where(eq(factChecks.id, id));

    revalidatePath("/fact-check");
    if (existing) revalidatePath(`/fact-check/${existing.slug}`);
    revalidatePath("/admin/fact-checks");

    return { success: true };
  } catch (err: any) {
    console.error("deleteFactCheck error:", err);
    return { success: false, error: "মুছে ফেলা সম্ভব হয়নি" };
  }
}

export async function toggleFactCheckFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean }> {
  try {
    await db.update(factChecks).set({ isFeatured }).where(eq(factChecks.id, id));
    revalidatePath("/fact-check");
    revalidatePath("/admin/fact-checks");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getFactCheckSubmissions(): Promise<FactCheckSubmissionItem[]> {
  try {
    const records = await db
      .select()
      .from(factCheckSubmissions)
      .orderBy(desc(factCheckSubmissions.createdAt));

    if (!records || records.length === 0) {
      return FALLBACK_SUBMISSIONS;
    }

    return records.map((r) => ({
      id: r.id,
      titleOrClaim: r.titleOrClaim,
      sourceUrl: r.sourceUrl,
      description: r.description,
      submitterName: r.submitterName,
      submitterEmail: r.submitterEmail,
      status: r.status as any,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("getFactCheckSubmissions DB error, using fallbacks:", err);
    return FALLBACK_SUBMISSIONS;
  }
}

export async function updateSubmissionStatus(
  id: string,
  status: "pending" | "reviewing" | "published" | "dismissed"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(factCheckSubmissions)
      .set({ status })
      .where(eq(factCheckSubmissions.id, id));

    revalidatePath("/admin/fact-checks");
    return { success: true };
  } catch (err: any) {
    console.error("updateSubmissionStatus error:", err);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন সম্ভব হয়নি" };
  }
}

export async function deleteSubmission(id: string): Promise<{ success: boolean }> {
  try {
    await db.delete(factCheckSubmissions).where(eq(factCheckSubmissions.id, id));
    revalidatePath("/admin/fact-checks");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}
