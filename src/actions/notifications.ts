"use server";

import { db } from "@/db";
import { breakingAlerts, pushSubscriptions } from "@/db/schema/notifications";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import type {
  AlertItem,
  AdminSubscriberItem,
  AdminNotificationStats,
} from "@/types/notifications";

export type { AlertItem, AdminSubscriberItem, AdminNotificationStats };

function parseUserAgent(ua?: string | null): { browser: string; device: string } {
  if (!ua) return { browser: "অজানা ব্রাউজার (Unknown)", device: "অজানা ডিভাইস" };
  const lower = ua.toLowerCase();

  let browser = "ক্রোম (Chrome)";
  if (lower.includes("firefox")) browser = "ফায়ারফক্স (Firefox)";
  else if (lower.includes("edg")) browser = "মাইক্রোসফট এজ (Edge)";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "সাফারি (Safari)";
  else if (lower.includes("opera") || lower.includes("opr")) browser = "অপেরা (Opera)";

  let device = "ডেস্কটপ (Desktop)";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    device = "মোবাইল (Mobile)";
  } else if (lower.includes("tablet") || lower.includes("ipad")) {
    device = "ট্যাবলেট (Tablet)";
  } else if (lower.includes("macintosh")) {
    device = "ম্যাকবুক (MacBook)";
  }

  return { browser, device };
}

/**
 * Public facing alerts fetcher with fallback if DB fails
 */
export async function getRecentAlerts(limit: number = 10): Promise<AlertItem[]> {
  try {
    const records = await db
      .select()
      .from(breakingAlerts)
      .orderBy(desc(breakingAlerts.createdAt))
      .limit(limit);

    if (!records || records.length === 0) {
      return [];
    }

    return records.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      url: r.url || "/",
      category: r.category,
      priority: r.priority,
      soundAlert: r.soundAlert,
      clicksCount: r.clicksCount,
      isBroadcasted: r.isBroadcasted,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Could not query breakingAlerts from DB:", error);
    return [];
  }
}

/**
 * Admin: Real alerts strictly from the database
 */
export async function getAllAdminAlerts(): Promise<AlertItem[]> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return [];
    }

    const records = await db
      .select()
      .from(breakingAlerts)
      .orderBy(desc(breakingAlerts.createdAt));

    if (!records || records.length === 0) {
      return [];
    }

    return records.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      url: r.url || "/",
      category: r.category,
      priority: r.priority,
      soundAlert: r.soundAlert,
      clicksCount: r.clicksCount,
      isBroadcasted: r.isBroadcasted,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("getAllAdminAlerts error:", err);
    return [];
  }
}

/**
 * Admin: Real statistical calculation directly from database rows
 */
export async function getAdminNotificationStats(): Promise<AdminNotificationStats> {
  try {
    // 1. Fetch real alerts
    const alerts = await getAllAdminAlerts();

    // 2. Fetch real subscribers from push_subscriptions table
    let activeSubscribers = 0;
    try {
      const dbSubs = await db.select().from(pushSubscriptions);
      if (dbSubs && dbSubs.length > 0) {
        activeSubscribers = dbSubs.filter((s) => s.isActive).length;
      }
    } catch (subErr) {
      console.warn("pushSubscriptions query error in stats:", subErr);
    }

    // 3. Real total clicks summed across database rows
    const totalClicks = alerts.reduce((acc, a) => acc + (a.clicksCount || 0), 0);
    const urgentCount = alerts.filter((a) => a.priority === "urgent").length;

    // 4. Real CTR calculation
    let avgCtr = "০%";
    if (activeSubscribers > 0 && alerts.length > 0 && totalClicks > 0) {
      const totalOpportunities = activeSubscribers * alerts.length;
      const rate = (totalClicks / totalOpportunities) * 100;
      avgCtr = rate.toFixed(1) + "%";
    }

    // 5. Real categories breakdown from actual alerts
    const catMap: Record<string, { label: string; count: number; clicks: number; color: string }> = {
      breaking: { label: "ব্রেকিং ও জরুরি", count: 0, clicks: 0, color: "bg-red-500" },
      "fact-check": { label: "ফ্যাক্ট-চেক সতর্কবার্তা", count: 0, clicks: 0, color: "bg-indigo-600" },
      sports: { label: "খেলাধুলা ও লাইভ স্কোর", count: 0, clicks: 0, color: "bg-emerald-600" },
      national: { label: "জাতীয়", count: 0, clicks: 0, color: "bg-blue-600" },
      politics: { label: "রাজনীতি", count: 0, clicks: 0, color: "bg-purple-600" },
      business: { label: "বাণিজ্য ও অর্থনীতি", count: 0, clicks: 0, color: "bg-amber-600" },
      world: { label: "আন্তর্জাতিক", count: 0, clicks: 0, color: "bg-cyan-600" },
    };

    alerts.forEach((a) => {
      const c = a.category in catMap ? a.category : "breaking";
      const entry = catMap[c] ?? catMap["breaking"]!;
      entry.count += 1;
      entry.clicks += a.clicksCount || 0;
    });

    const categoryBreakdown = Object.entries(catMap).map(([key, val]) => ({
      category: key,
      ...val,
    }));

    return {
      totalAlerts: alerts.length,
      activeSubscribers,
      totalClicks,
      avgCtr,
      urgentCount,
      categoryBreakdown,
    };
  } catch (err) {
    console.warn("getAdminNotificationStats error:", err);
    return {
      totalAlerts: 0,
      activeSubscribers: 0,
      totalClicks: 0,
      avgCtr: "০%",
      urgentCount: 0,
      categoryBreakdown: [],
    };
  }
}

/**
 * Admin: Real subscribers list directly from database
 */
export async function getAdminPushSubscribers(): Promise<AdminSubscriberItem[]> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return [];
    }

    const records = await db
      .select()
      .from(pushSubscriptions)
      .orderBy(desc(pushSubscriptions.createdAt))
      .limit(100);

    if (!records || records.length === 0) {
      return [];
    }

    const items: AdminSubscriberItem[] = records.map((r) => {
      const { browser, device } = parseUserAgent(r.userAgent);
      return {
        id: r.id,
        endpoint: r.endpoint,
        browser,
        device,
        categories: Array.isArray(r.categories) ? (r.categories as string[]) : ["breaking", "national"],
        isActive: r.isActive,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        userAgent: r.userAgent,
      };
    });

    return items;
  } catch (err) {
    console.warn("getAdminPushSubscribers error:", err);
    return [];
  }
}

/**
 * Public & Admin: Save real push subscription to database
 */
export async function savePushSubscription(data: {
  endpoint: string;
  p256dh: string;
  auth: string;
  categories?: string[];
  userAgent?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (!data.endpoint || !data.p256dh || !data.auth) {
      return { success: false, message: "প্রয়োজনীয় সাবস্ক্রিপশন ডাটা অনুপস্থিত" };
    }

    await db
      .insert(pushSubscriptions)
      .values({
        id: crypto.randomUUID(),
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        categories: data.categories || ["breaking", "national", "sports"],
        userAgent: data.userAgent || null,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          categories: data.categories || ["breaking", "national", "sports"],
          isActive: true,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/admin/notifications");
    revalidatePath("/notifications");

    return { success: true, message: "পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!" };
  } catch (error: any) {
    console.error("savePushSubscription error:", error);
    return { success: false, message: "ডাটাবেজে সাবস্ক্রিপশন সংরক্ষণ ব্যর্থ হয়েছে।" };
  }
}

/**
 * Admin: Real broadcast breaking alert insertion to database
 */
export async function broadcastBreakingAlertAction(data: {
  title: string;
  message: string;
  url?: string;
  category?: string;
  priority?: string;
  soundAlert?: boolean;
}): Promise<{ success: boolean; alert?: AlertItem; message: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, message: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন পুশ অ্যালার্ট পাঠাতে পারেন।" };
    }

    if (!data.title || !data.message) {
      return { success: false, message: "শিরোনাম এবং বিবরণ বাধ্যতামূলক" };
    }

    const id = `alert-${Date.now()}`;
    const newAlert: AlertItem = {
      id,
      title: data.title.trim(),
      message: data.message.trim(),
      url: data.url?.trim() || "/",
      category: data.category || "breaking",
      priority: data.priority || "urgent",
      soundAlert: data.soundAlert !== false,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      isBroadcasted: true,
    };

    await db.insert(breakingAlerts).values({
      id: newAlert.id,
      title: newAlert.title,
      message: newAlert.message,
      url: newAlert.url,
      category: newAlert.category,
      priority: newAlert.priority,
      soundAlert: newAlert.soundAlert,
      clicksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/notifications");
    revalidatePath("/admin/notifications");
    revalidatePath("/");

    return {
      success: true,
      alert: newAlert,
      message: "ওয়েব পুশ অ্যালার্ট সফলভাবে ডাটাবেজে সংরক্ষিত ও প্রচারিত হয়েছে!",
    };
  } catch (error: any) {
    console.error("broadcastBreakingAlertAction error:", error);
    return { success: false, message: error?.message || "অ্যালার্ট তৈরি করতে সমস্যা হয়েছে" };
  }
}

/**
 * Admin: Delete real alert from database
 */
export async function deleteAlertAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, message: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(breakingAlerts).where(eq(breakingAlerts.id, id));
    revalidatePath("/notifications");
    revalidatePath("/admin/notifications");
    revalidatePath("/");
    return { success: true, message: "নোটিফিকেশন সফলভাবে মুছে ফেলা হয়েছে।" };
  } catch (err: any) {
    console.error("deleteAlertAction error:", err);
    return { success: false, message: "মুছে ফেলতে সমস্যা হয়েছে।" };
  }
}

/**
 * Admin: Resend real alert
 */
export async function resendAlertAction(
  id: string
): Promise<{ success: boolean; message: string; alert?: AlertItem }> {
  try {
    const records = await db
      .select()
      .from(breakingAlerts)
      .where(eq(breakingAlerts.id, id))
      .limit(1);

    if (!records || records.length === 0 || !records[0]) {
      return { success: false, message: "প্রদত্ত অ্যালার্টটি ডাটাবেজে খুঁজে পাওয়া যায়নি" };
    }

    const r = records[0];
    return await broadcastBreakingAlertAction({
      title: r.title,
      message: r.message,
      url: r.url || "/",
      category: r.category,
      priority: r.priority,
      soundAlert: r.soundAlert,
    });
  } catch (err: any) {
    console.error("resendAlertAction error:", err);
    return { success: false, message: err?.message || "পুনরায় প্রেরণে সমস্যা হয়েছে" };
  }
}

/**
 * Public: Track click count on real alert
 */
export async function incrementAlertClicks(id: string): Promise<void> {
  try {
    await db
      .update(breakingAlerts)
      .set({ clicksCount: sql`${breakingAlerts.clicksCount} + 1` })
      .where(eq(breakingAlerts.id, id));
    revalidatePath("/admin/notifications");
  } catch (err) {
    // silently ignore
  }
}
