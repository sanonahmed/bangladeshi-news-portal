"use server";

import { db } from "@/db";
import { user as usersTable } from "@/db/schema/auth";
import { authorProfiles } from "@/db/schema/authors";
import { auditLogs } from "@/db/schema/security";
import { articles } from "@/db/schema/articles";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason?: string | null;
  createdAt: string;
  slug?: string | null;
  designation?: string | null;
  department?: string | null;
  bureau?: string | null;
  isBureauChief: boolean;
  totalArticles: number;
}

/**
 * Log audit trail helper
 */
async function recordAudit(
  actorId: string | null,
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
      entityType: "user",
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
 * Fetch all users with profile data and article counts
 */
export async function getAdminUsersList(): Promise<AdminUserItem[]> {
  try {
    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        banned: usersTable.banned,
        banReason: usersTable.banReason,
        createdAt: usersTable.createdAt,
        slug: authorProfiles.slug,
        designation: authorProfiles.designation,
        department: authorProfiles.department,
        bureau: authorProfiles.bureau,
        isBureauChief: authorProfiles.isBureauChief,
      })
      .from(usersTable)
      .leftJoin(authorProfiles, eq(usersTable.id, authorProfiles.userId))
      .orderBy(desc(usersTable.createdAt));

    // Get article counts per author
    const articleCounts = await db
      .select({
        authorId: articles.authorId,
        count: count(articles.id),
      })
      .from(articles)
      .groupBy(articles.authorId);

    const countMap = new Map<string, number>();
    for (const c of articleCounts) {
      if (c.authorId) {
        countMap.set(c.authorId, Number(c.count) || 0);
      }
    }

    return rows.map((r) => ({
      ...r,
      isBureauChief: Boolean(r.isBureauChief),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      totalArticles: countMap.get(r.id) || 0,
    }));
  } catch (error) {
    console.error("getAdminUsersList error:", error);
    return [];
  }
}

/**
 * Update user role (super_admin, admin, editor, journalist, reader)
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized: Please sign in" };
    }

    const actor = session.user as any;
    const actorRole = actor.role || "reader";

    // Only super_admin or admin can change roles
    if (actorRole !== "super_admin" && actorRole !== "admin") {
      return { success: false, error: "Permission denied: Only administrators can update roles" };
    }

    // Only super_admin can grant or revoke super_admin role
    if ((newRole === "super_admin" || actorRole !== "super_admin") && newRole === "super_admin") {
      if (actorRole !== "super_admin") {
        return { success: false, error: "Only a Super Admin can promote someone to Super Admin" };
      }
    }

    // Check target user
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1);

    const target = targetUser[0];
    if (!target) {
      return { success: false, error: "User not found" };
    }

    const oldRole = target.role;

    // Prevent demoting the only super_admin
    if (oldRole === "super_admin" && newRole !== "super_admin") {
      const superAdmins = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.role, "super_admin"));

      if (superAdmins.length <= 1) {
        return { success: false, error: "Cannot demote the only remaining Super Admin in the system" };
      }
    }

    await db
      .update(usersTable)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(usersTable.id, targetUserId));

    // Audit log
    await recordAudit(actor.id, "USER_ROLE_UPDATED", targetUserId, {
      targetEmail: target.email,
      targetName: target.name,
      oldRole,
      newRole,
      actorName: actor.name,
      actorRole,
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/roles");
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (error: any) {
    console.error("updateUserRole error:", error);
    return { success: false, error: error?.message || "Failed to update role" };
  }
}

/**
 * Toggle user ban / suspension
 */
export async function toggleUserBan(
  targetUserId: string,
  banReason?: string
): Promise<{ success: boolean; error?: string; isBanned?: boolean }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const actor = session.user as any;
    const actorRole = actor.role || "reader";

    if (actorRole !== "super_admin" && actorRole !== "admin") {
      return { success: false, error: "Permission denied: Only administrators can ban/unban users" };
    }

    // Cannot ban yourself
    if (actor.id === targetUserId) {
      return { success: false, error: "You cannot suspend your own account" };
    }

    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1);

    const target = targetUser[0];
    if (!target) {
      return { success: false, error: "User not found" };
    }

    // Cannot ban a super_admin unless you are super_admin
    if (target.role === "super_admin" && actorRole !== "super_admin") {
      return { success: false, error: "Only a Super Admin can suspend another Super Admin" };
    }

    const nextBanned = !target.banned;

    await db
      .update(usersTable)
      .set({
        banned: nextBanned,
        banReason: nextBanned ? banReason || "Administrative policy enforcement" : null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, targetUserId));

    // Audit log
    await recordAudit(
      actor.id,
      nextBanned ? "USER_BANNED" : "USER_UNBANNED",
      targetUserId,
      {
        targetEmail: target.email,
        targetName: target.name,
        targetRole: target.role,
        reason: banReason,
        actorName: actor.name,
      }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/audit-logs");

    return { success: true, isBanned: nextBanned };
  } catch (error: any) {
    console.error("toggleUserBan error:", error);
    return { success: false, error: error?.message || "Failed to update account status" };
  }
}

/**
 * Update staff / journalist profile details (Bureau, Designation, Chief status)
 */
export async function updateStaffProfile(
  targetUserId: string,
  profile: {
    designation: string;
    department?: string;
    bureau?: string;
    isBureauChief: boolean;
    bio?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const actor = session.user as any;
    if (actor.role !== "super_admin" && actor.role !== "admin" && actor.role !== "editor") {
      return { success: false, error: "Permission denied" };
    }

    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1);

    const target = targetUser[0];
    if (!target) {
      return { success: false, error: "User not found" };
    }

    const existing = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.userId, targetUserId))
      .limit(1);

    const existingProfile = existing[0];
    if (existingProfile) {
      await db
        .update(authorProfiles)
        .set({
          designation: profile.designation.trim(),
          department: profile.department?.trim() || "বার্তা বিভাগ",
          bureau: profile.bureau?.trim() || null,
          isBureauChief: profile.isBureauChief,
          bio: profile.bio?.trim() || existingProfile.bio,
          updatedAt: new Date(),
        })
        .where(eq(authorProfiles.userId, targetUserId));
    } else {
      const cleanSlug = target.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `journalist-${Date.now().toString(36)}`;

      await db.insert(authorProfiles).values({
        userId: targetUserId,
        slug: cleanSlug,
        nameBangla: target.name,
        nameEnglish: target.name,
        designation: profile.designation.trim(),
        department: profile.department?.trim() || "বার্তা বিভাগ",
        bureau: profile.bureau?.trim() || null,
        isBureauChief: profile.isBureauChief,
        isStaff: true,
        email: target.email,
      });
    }

    await recordAudit(actor.id, "STAFF_PROFILE_UPDATED", targetUserId, {
      targetEmail: target.email,
      targetName: target.name,
      designation: profile.designation,
      bureau: profile.bureau,
      isBureauChief: profile.isBureauChief,
      actorName: actor.name,
    });

    revalidatePath("/admin/users");
    revalidatePath("/authors");

    return { success: true };
  } catch (error: any) {
    console.error("updateStaffProfile error:", error);
    return { success: false, error: error?.message || "Failed to update journalist profile" };
  }
}

/**
 * Onboard and create a new newsroom staff member
 */
export async function createStaffMember(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  designation: string;
  department?: string;
  bureau?: string;
  isBureauChief: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const actor = session.user as any;
    if (actor.role !== "super_admin" && actor.role !== "admin") {
      return { success: false, error: "Permission denied: Only administrators can create staff accounts" };
    }

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (!name || !email || !password) {
      return { success: false, error: "Name, email, and password are required" };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" };
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create via Better Auth API
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Elevate role and assign details
    const assignedRole = ["super_admin", "admin", "editor", "journalist", "reader"].includes(data.role)
      ? data.role
      : "journalist";

    await db
      .update(usersTable)
      .set({ role: assignedRole, updatedAt: new Date() })
      .where(eq(usersTable.email, email));

    // Get newly created user ID
    const newlyCreated = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    const newUser = newlyCreated[0];
    if (newUser) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `staff-${Date.now().toString(36)}`;

      await db.insert(authorProfiles).values({
        userId: newUser.id,
        slug: `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        nameBangla: name,
        nameEnglish: name,
        designation: data.designation.trim() || "প্রতিবেদক",
        department: data.department?.trim() || "বার্তা বিভাগ",
        bureau: data.bureau?.trim() || "কেন্দ্রীয় বার্তা কক্ষ",
        isBureauChief: Boolean(data.isBureauChief),
        isStaff: true,
        email,
      });

      await recordAudit(actor.id, "STAFF_ACCOUNT_CREATED", newUser.id, {
        email,
        name,
        role: assignedRole,
        designation: data.designation,
        bureau: data.bureau,
        actorName: actor.name,
      });
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/roles");
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (error: any) {
    console.error("createStaffMember error:", error);
    return { success: false, error: error?.message || "Failed to create staff member" };
  }
}
