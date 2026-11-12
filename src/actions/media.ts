"use server";

import { db } from "@/db";
import { mediaAssets, type MediaAsset } from "@/db/schema/media";
import { user } from "@/db/schema/auth";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import { formatBengaliDate } from "@/lib/bengali-date";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  credit: string;
  fileSize: number;
  mimeType: string;
  date: string;
}

export async function getAllAdminMedia(): Promise<MediaItem[]> {
  try {
    const rows = await db
      .select({
        id: mediaAssets.id,
        filename: mediaAssets.filename,
        originalName: mediaAssets.originalName,
        mimeType: mediaAssets.mimeType,
        fileSize: mediaAssets.fileSize,
        publicUrl: mediaAssets.publicUrl,
        photographerCredit: mediaAssets.photographerCredit,
        createdAt: mediaAssets.createdAt,
      })
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt));

    return rows.map((r) => {
      let dateStr = "সম্প্রতি";
      try {
        if (r.createdAt) {
          dateStr = formatBengaliDate(new Date(r.createdAt));
        }
      } catch (e) {
        // fallback
      }

      return {
        id: r.id,
        url: r.publicUrl,
        filename: r.originalName || r.filename,
        credit: r.photographerCredit || "বাংলাদেশ বার্তা আর্কাইভ",
        fileSize: r.fileSize || 0,
        mimeType: r.mimeType || "image/jpeg",
        date: dateStr,
      };
    });
  } catch (error) {
    console.error("getAllAdminMedia error:", error);
    return [];
  }
}

export async function recordMediaAsset(data: {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  r2Key: string;
  publicUrl: string;
  photographerCredit?: string;
}): Promise<{ success: boolean; error?: string; media?: MediaItem }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "journalist")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সাংবাদিক বা স্টাফ মিডিয়া আপলোড করতে পারেন।" };
    }

    const userId = actor.id;

    const [inserted] = await db
      .insert(mediaAssets)
      .values({
        id: crypto.randomUUID(),
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        r2Key: data.r2Key,
        publicUrl: data.publicUrl,
        photographerCredit: data.photographerCredit || "নিজস্ব আলোকচিত্রী",
        uploadedBy: userId,
      })
      .returning();

    if (!inserted) {
      return { success: false, error: "মিডিয়া সংরক্ষণ করা যায়নি" };
    }

    revalidatePath("/admin/media");

    return {
      success: true,
      media: {
        id: inserted.id,
        url: inserted.publicUrl,
        filename: inserted.originalName,
        credit: inserted.photographerCredit || "নিজস্ব আলোকচিত্রী",
        fileSize: inserted.fileSize,
        mimeType: inserted.mimeType,
        date: "আজ",
      },
    };
  } catch (error) {
    console.error("recordMediaAsset error:", error);
    return { success: false, error: "মিডিয়া ডাটাবেজে রেকর্ড করা যায়নি" };
  }
}

export async function deleteAdminMedia(
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন মিডিয়া মুছতে পারেন।" };
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId));
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    console.error("deleteAdminMedia error:", error);
    return { success: false, error: "মিডিয়া মুছে ফেলা সম্ভব হয়নি" };
  }
}
