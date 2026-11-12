"use server";

import { db } from "@/db";
import { authorProfiles, user as usersTable, articles, auditLogs, account as accountTable } from "@/db/schema";
import { eq, and, count, ne } from "drizzle-orm";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { verifyPassword, hashPassword } from "@better-auth/utils/password";

export interface MyProfileData {
  id: string;
  userId: string;
  userRole: string;
  systemEmail: string;
  accountName: string;
  nameBangla: string;
  nameEnglish: string | null;
  slug: string;
  designation: string;
  department: string;
  bureau: string | null;
  isBureauChief: boolean;
  isStaff: boolean;
  bio: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  email: string | null;
  phone: string | null;
  totalArticles: number;
  joinedAt: string;
}

const ProfileUpdateSchema = z.object({
  nameBangla: z.string().min(2, "বাংলা নাম আবশ্যক (কমপক্ষে ২ অক্ষর)").max(150),
  nameEnglish: z.string().max(150).optional().nullable(),
  slug: z
    .string()
    .min(2, "প্রোফাইল স্লাগ আবশ্যক")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "স্লাগে শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহার করা যাবে"),
  designation: z.string().min(2, "পদবি আবশ্যক").max(150),
  department: z.string().min(2, "বিভাগ/ডেস্ক আবশ্যক").max(150),
  bureau: z.string().max(150).optional().nullable(),
  bio: z.string().max(2000, "বায়ো সর্বোচ্চ ২০০০ অক্ষরের মধ্যে হতে হবে").optional().nullable(),
  avatarUrl: z.string().url("সঠিক ইমেজ লিঙ্ক দিন").or(z.literal("")).optional().nullable(),
  twitterHandle: z.string().max(100).optional().nullable(),
  facebookUrl: z.string().url("সঠিক ফেসবুক প্রোফাইল লিঙ্ক দিন").or(z.literal("")).optional().nullable(),
  linkedinUrl: z.string().url("সঠিক লিঙ্কডইন প্রোফাইল লিঙ্ক দিন").or(z.literal("")).optional().nullable(),
  email: z.string().email("সঠিক ইমেইল ফরম্যাট দিন").or(z.literal("")).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
});

/**
 * Record audit log helper
 */
async function recordAudit(
  actorId: string,
  action: string,
  entityId: string,
  metadata?: Record<string, any>
) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "Admin Console";

    await db.insert(auditLogs).values({
      userId: actorId,
      action,
      entityType: "author_profile",
      entityId,
      metadata: metadata || {},
      ipAddress: ip,
      userAgent: userAgent.slice(0, 255),
    });
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
}

/**
 * Retrieve author profile for the current logged-in admin / journalist
 */
export async function getMyAuthorProfile(): Promise<MyProfileData | null> {
  try {
    const currentUser = await getCurrentAdminUser();
    if (!currentUser) {
      return null;
    }

    // 1. Find existing author profile or auto-initialize one
    let profiles = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.userId, currentUser.id))
      .limit(1);

    let profile = profiles[0];

    if (!profile) {
      const cleanSlug =
        currentUser.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `author-${Date.now().toString(36)}`;

      const [newProfile] = await db
        .insert(authorProfiles)
        .values({
          userId: currentUser.id,
          slug: cleanSlug,
          nameBangla: currentUser.name,
          nameEnglish: currentUser.name,
          designation:
            currentUser.role === "super_admin"
              ? "প্রধান বার্তা সম্পাদক ও প্রকাশক"
              : currentUser.role === "editor"
              ? "বার্তা সম্পাদক"
              : currentUser.role === "admin"
              ? "প্রশাসনিক সম্পাদক"
              : "প্রতিবেদক ও সাংবাদিক",
          department: "কেন্দ্রীয় বার্তা বিভাগ",
          bureau: "কেন্দ্রীয় বার্তা কক্ষ, ঢাকা",
          isBureauChief: currentUser.role === "super_admin",
          isStaff: true,
          email: currentUser.email,
        })
        .returning();

      profile = newProfile;
    }

    if (!profile) {
      return null;
    }

    // 2. Count total published articles written by this author
    const articleCountRows = await db
      .select({ count: count(articles.id) })
      .from(articles)
      .where(eq(articles.authorId, currentUser.id));

    const totalArticles = Number(articleCountRows[0]?.count) || 0;

    return {
      id: profile.id,
      userId: currentUser.id,
      userRole: currentUser.role,
      systemEmail: currentUser.email,
      accountName: currentUser.name,
      nameBangla: profile.nameBangla,
      nameEnglish: profile.nameEnglish,
      slug: profile.slug,
      designation: profile.designation,
      department: profile.department,
      bureau: profile.bureau,
      isBureauChief: profile.isBureauChief,
      isStaff: profile.isStaff,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl || currentUser.user?.image || null,
      twitterHandle: profile.twitterHandle,
      facebookUrl: profile.facebookUrl,
      linkedinUrl: profile.linkedinUrl,
      email: profile.email || currentUser.email,
      phone: profile.phone,
      totalArticles,
      joinedAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("getMyAuthorProfile error:", error);
    return null;
  }
}

/**
 * Update author profile for current logged-in admin / journalist
 */
export async function updateMyAuthorProfile(
  rawInput: z.infer<typeof ProfileUpdateSchema>
): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const currentUser = await getCurrentAdminUser();
    if (!currentUser) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
    }

    const parsed = ProfileUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const data = parsed.data;

    // Check if slug is used by another author
    const slugCollision = await db
      .select({ id: authorProfiles.id })
      .from(authorProfiles)
      .where(
        and(
          eq(authorProfiles.slug, data.slug),
          ne(authorProfiles.userId, currentUser.id)
        )
      )
      .limit(1);

    if (slugCollision.length > 0) {
      return {
        success: false,
        error: "এই স্লাগটি (URL) ইতোমধ্যে অন্য লেখকের জন্য নির্ধারিত। অনুগ্রহ করে ভিন্ন একটি স্লাগ দিন।",
      };
    }

    // Update authorProfiles record
    await db
      .update(authorProfiles)
      .set({
        nameBangla: data.nameBangla.trim(),
        nameEnglish: data.nameEnglish?.trim() || null,
        slug: data.slug.trim().toLowerCase(),
        designation: data.designation.trim(),
        department: data.department.trim(),
        bureau: data.bureau?.trim() || null,
        bio: data.bio?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        twitterHandle: data.twitterHandle?.trim() || null,
        facebookUrl: data.facebookUrl?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        email: data.email?.trim() || currentUser.email,
        phone: data.phone?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(authorProfiles.userId, currentUser.id));

    // Also sync user name and image in users table
    await db
      .update(usersTable)
      .set({
        name: data.nameBangla.trim(),
        image: data.avatarUrl?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, currentUser.id));

    await recordAudit(currentUser.id, "PROFILE_UPDATED", currentUser.id, {
      name: data.nameBangla,
      slug: data.slug,
      designation: data.designation,
    });

    revalidatePath("/admin/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/author/${data.slug}`);
    revalidatePath("/authors");

    return { success: true, slug: data.slug };
  } catch (error: any) {
    console.error("updateMyAuthorProfile error:", error);
    return { success: false, error: error?.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" };
  }
}

/**
 * Change current user password
 */
export async function changeMyPassword(data: {
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentAdminUser();
    if (!currentUser) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার। অনুগ্রহ করে লগইন করুন।" };
    }

    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      return { success: false, error: "বর্তমান ও নতুন উভয় পাসওয়ার্ড আবশ্যক।" };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।" };
    }

    // Find account row
    const [account] = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, currentUser.id),
          eq(accountTable.providerId, "credential")
        )
      )
      .limit(1);

    if (!account || !account.password) {
      return { success: false, error: "এই অ্যাকাউন্টের কোনো পাসওয়ার্ড রেকর্ড পাওয়া যায়নি।" };
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(account.password, currentPassword);
    if (!isCurrentValid) {
      return { success: false, error: "বর্তমান পাসওয়ার্ড সঠিক নয়।" };
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password in account table
    await db
      .update(accountTable)
      .set({
        password: newHash,
        updatedAt: new Date(),
      })
      .where(eq(accountTable.id, account.id));

    await recordAudit(currentUser.id, "PASSWORD_CHANGED", currentUser.id, {
      email: currentUser.email,
    });

    return { success: true };
  } catch (error: any) {
    console.error("changeMyPassword error:", error);
    return { success: false, error: error?.message || "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।" };
  }
}
