"use server";

import { db } from "@/db";
import { comments, type Comment } from "@/db/schema/comments";
import { articles } from "@/db/schema/articles";
import { user } from "@/db/schema/auth";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import { z } from "zod";

export interface ArticleCommentWithArticle extends Comment {
  articleTitle?: string | null;
  articleSlug?: string | null;
}

export async function getArticleComments(articleId: string): Promise<Comment[]> {
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.status, "approved")))
      .orderBy(desc(comments.createdAt));

    return rows;
  } catch (error) {
    console.error("Error fetching article comments:", error);
    return [];
  }
}

const SubmitCommentSchema = z.object({
  articleId: z.string().min(1, "আর্টিকেল আইডি আবশ্যক"),
  userName: z.string().min(2, "আপনার নাম লিখুন (কমপক্ষে ২ অক্ষর)").max(60),
  userEmail: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional().or(z.literal("")),
  content: z.string().min(3, "মন্তব্য কমপক্ষে ৩ অক্ষরের হতে হবে").max(1000, "মন্তব্য ১০০০ অক্ষরের মধ্যে রাখুন"),
  parentCommentId: z.string().optional(),
});

export async function submitComment(data: z.infer<typeof SubmitCommentSchema>): Promise<{
  success: boolean;
  error?: string;
  comment?: Comment;
}> {
  try {
    const parsed = SubmitCommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { articleId, userName, userEmail, content, parentCommentId } = parsed.data;

    // Check if user is logged in
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id || null;
    const finalUserName = session?.user?.name || userName.trim();
    const finalUserEmail = session?.user?.email || userEmail?.trim() || null;

    // Enhanced profanity / spam and malicious link check
    const spamKeywords = [
      "viagra", "casino", "free crypto", "telegram.me", "whatsapp me for money",
      "bit.ly", "t.me", "tinyurl.com", "crypto giveaway", "http://", "https://"
    ];
    const isSpam = spamKeywords.some((word) => content.toLowerCase().includes(word));
    const initialStatus = isSpam ? "spam" : "approved";

    const [newComment] = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        articleId,
        userId,
        userName: finalUserName,
        userEmail: finalUserEmail,
        content: content.trim(),
        status: initialStatus,
        parentCommentId: parentCommentId || null,
        likesCount: 0,
        dislikesCount: 0,
      })
      .returning();

    // Revalidate public page
    revalidatePath("/news/[slug]", "page");
    revalidatePath("/admin/comments");

    return {
      success: true,
      comment: newComment,
    };
  } catch (error: any) {
    console.error("submitComment error:", error);
    return { success: false, error: error?.message || "মন্তব্য প্রকাশে সমস্যা হয়েছে" };
  }
}

export async function likeComment(commentId: string): Promise<{ success: boolean; likes?: number }> {
  try {
    const [updated] = await db
      .update(comments)
      .set({
        likesCount: sql`${comments.likesCount} + 1`,
      })
      .where(eq(comments.id, commentId))
      .returning({ likesCount: comments.likesCount });

    return { success: true, likes: updated?.likesCount ?? 0 };
  } catch (error) {
    console.error("likeComment error:", error);
    return { success: false };
  }
}

export async function getAllAdminComments(filter?: {
  status?: string;
  search?: string;
}): Promise<ArticleCommentWithArticle[]> {
  try {
    const baseQuery = db
      .select({
        id: comments.id,
        articleId: comments.articleId,
        userId: comments.userId,
        userName: comments.userName,
        userEmail: comments.userEmail,
        content: comments.content,
        status: comments.status,
        likesCount: comments.likesCount,
        dislikesCount: comments.dislikesCount,
        parentCommentId: comments.parentCommentId,
        moderatedBy: comments.moderatedBy,
        moderatedAt: comments.moderatedAt,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        articleTitle: articles.title,
        articleSlug: articles.slug,
      })
      .from(comments)
      .leftJoin(articles, eq(comments.articleId, articles.id))
      .orderBy(desc(comments.createdAt));

    const rows = await baseQuery;

    let filtered = rows;
    if (filter?.status && filter.status !== "all") {
      filtered = filtered.filter((r) => r.status === filter.status);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          (r.articleTitle && r.articleTitle.toLowerCase().includes(q))
      );
    }

    return filtered;
  } catch (error) {
    console.error("getAllAdminComments error:", error);
    return [];
  }
}

export async function updateCommentStatus(
  commentId: string,
  status: "approved" | "rejected" | "spam" | "pending"
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন মন্তব্য মডারেশন করতে পারেন।" };
    }

    const modId = actor.id;

    await db
      .update(comments)
      .set({
        status,
        moderatedBy: modId,
        moderatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    revalidatePath("/news/[slug]", "page");
    revalidatePath("/admin/comments");

    return { success: true };
  } catch (error: any) {
    console.error("updateCommentStatus error:", error);
    return { success: false, error: error?.message || "মডারেশন ব্যর্থ হয়েছে" };
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    revalidatePath("/news/[slug]", "page");
    revalidatePath("/admin/comments");

    return { success: true };
  } catch (error: any) {
    console.error("deleteComment error:", error);
    return { success: false, error: "মন্তব্য মুছে ফেলা ব্যর্থ হয়েছে" };
  }
}

export async function bulkUpdateCommentStatus(
  commentIds: string[],
  action: "approved" | "rejected" | "spam" | "delete"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!commentIds || commentIds.length === 0) {
      return { success: false, error: "কোনো মন্তব্য নির্বাচন করা হয়নি" };
    }

    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    if (action === "delete") {
      await db.delete(comments).where(inArray(comments.id, commentIds));
    } else {
      const modId = actor.id;

      await db
        .update(comments)
        .set({
          status: action,
          moderatedBy: modId,
          moderatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(comments.id, commentIds));
    }

    revalidatePath("/news/[slug]", "page");
    revalidatePath("/admin/comments");

    return { success: true };
  } catch (error: any) {
    console.error("bulkUpdateCommentStatus error:", error);
    return { success: false, error: "বাল্ক অপারেশন ব্যর্থ হয়েছে" };
  }
}
