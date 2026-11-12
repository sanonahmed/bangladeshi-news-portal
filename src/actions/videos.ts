"use server";

import { db } from "@/db";
import { videos, type Video } from "@/db/schema/videos";
import { eq, desc, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import { z } from "zod";
import {
  detectVideoPlatform,
  cleanFacebookUrl,
  cleanYouTubeUrl,
  extractYouTubeId,
  extractFacebookVideoId,
  getVideoThumbnail,
} from "@/lib/video-embed";

export async function getVideos(): Promise<Video[]> {
  try {
    const rows = await db
      .select()
      .from(videos)
      .where(eq(videos.isActive, true))
      .orderBy(desc(videos.isFeatured), asc(videos.sortOrder), desc(videos.createdAt));

    return rows;
  } catch (error) {
    console.error("Error fetching videos from DB:", error);
    return [];
  }
}

export async function getAllAdminVideos(): Promise<Video[]> {
  try {
    const rows = await db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt));

    return rows;
  } catch (error) {
    console.error("Error fetching admin videos:", error);
    return [];
  }
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  try {
    const [row] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.slug, slug), eq(videos.isActive, true)))
      .limit(1);

    return row || null;
  } catch (error) {
    console.error("Error fetching video by slug:", error);
    return null;
  }
}

const VideoSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক").max(300),
  youtubeUrl: z.string().min(1, "ভিডিও লিংক আবশ্যক"),
  description: z.string().optional(),
  duration: z.string().default("৩:৪৫"),
  category: z.string().default("জাতীয়"),
  isFeatured: z.boolean().default(false),
  customThumbnailUrl: z.string().optional(),
  slug: z.string().optional(),
});

export async function createVideo(data: z.infer<typeof VideoSchema>): Promise<{ success: boolean; error?: string; video?: Video }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন ভিডিও যোগ করতে পারেন।" };
    }

    const parsed = VideoSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { title, youtubeUrl, description, duration, category, isFeatured, customThumbnailUrl } = parsed.data;

    const rawUrl = youtubeUrl.trim();
    const platform = detectVideoPlatform(rawUrl);
    if (platform === "unknown") {
      return {
        success: false,
        error: "অনুগ্রহ করে একটি বৈধ ইউটিউব (YouTube) বা ফেসবুক (Facebook) ভিডিওর লিংক বা এম্বেড কোড দিন।",
      };
    }

    let finalVideoUrl = rawUrl;
    let videoId: string | null = null;

    if (platform === "youtube") {
      finalVideoUrl = cleanYouTubeUrl(rawUrl);
      videoId = extractYouTubeId(finalVideoUrl);
      if (!videoId) {
        return {
          success: false,
          error: "সঠিক ইউটিউব ভিডিও আইডি সনাক্ত করা যায়নি। লিংকটি পুনরায় পরীক্ষা করুন।",
        };
      }
    } else if (platform === "facebook") {
      finalVideoUrl = cleanFacebookUrl(rawUrl);
      videoId = extractFacebookVideoId(finalVideoUrl);
      if (!videoId) {
        videoId = `fb-${Date.now().toString(36)}`;
      }
    }

    // Determine thumbnail
    const thumbnailUrl = getVideoThumbnail(finalVideoUrl, customThumbnailUrl);

    // Generate unique slug
    let generatedSlug = parsed.data.slug?.trim();
    if (!generatedSlug) {
      generatedSlug = `video-${(videoId || "clip").toLowerCase()}-${Date.now().toString().slice(-4)}`;
    }

    // Check slug uniqueness
    const existing = await db.select({ id: videos.id }).from(videos).where(eq(videos.slug, generatedSlug)).limit(1);
    if (existing.length > 0) {
      generatedSlug = `video-${(videoId || "clip").toLowerCase()}-${Date.now()}`;
    }

    // If marked as featured, un-feature others
    if (isFeatured) {
      await db.update(videos).set({ isFeatured: false });
    }

    const [newVideo] = await db
      .insert(videos)
      .values({
        title,
        slug: generatedSlug,
        description: description || undefined,
        youtubeUrl: finalVideoUrl,
        youtubeVideoId: videoId || `video-${Date.now()}`,
        thumbnailUrl,
        duration: duration || "৩:৪৫",
        category: category || "জাতীয়",
        isFeatured,
        isActive: true,
      })
      .returning();

    revalidatePath("/videos");
    revalidatePath("/admin/videos");
    revalidatePath("/");

    return { success: true, video: newVideo };
  } catch (error: any) {
    console.error("createVideo error:", error);
    return { success: false, error: error?.message || "ভিডিও সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}

export async function deleteVideo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন ভিডিও মুছতে পারেন।" };
    }

    await db.delete(videos).where(eq(videos.id, id));

    revalidatePath("/videos");
    revalidatePath("/admin/videos");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("deleteVideo error:", error);
    return { success: false, error: "ভিডিও অপসারন ব্যর্থ হয়েছে" };
  }
}

export async function toggleVideoFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    if (isFeatured) {
      // Un-feature all first
      await db.update(videos).set({ isFeatured: false });
    }

    await db.update(videos).set({ isFeatured }).where(eq(videos.id, id));

    revalidatePath("/videos");
    revalidatePath("/admin/videos");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("toggleVideoFeatured error:", error);
    return { success: false, error: "সেটিংস আপডেট ব্যর্থ হয়েছে" };
  }
}
