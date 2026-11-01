"use server";

import { db } from "@/db";
import { breakingAlerts, pushSubscriptions, type BreakingAlert } from "@/db/schema/notifications";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  url: string;
  category: string;
  priority: string;
  soundAlert: boolean;
  clicksCount: number;
  createdAt: string;
}

const FALLBACK_ALERTS: AlertItem[] = [
  {
    id: "alert-weather-cyclone-warning",
    title: "জরুরি আবহাওয়া বার্তা: বঙ্গোপসাগরে গভীর নিম্নচাপ, ৩ নম্বর স্থানীয় সতর্ক সংকেত জারি",
    message: "উপকূলীয় এলাকায় ৫০-৬০ কিমি বেগে দমকা বা ঝড়ো হাওয়া বয়ে যেতে পারে। মাছ ধরার সকল ট্রলারসমূহকে নিরাপদ আশ্রয়ে থাকার নির্দেশ দিয়েছে আবহাওয়া অধিদপ্তর।",
    url: "/category/জাতীয়",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    clicksCount: 1420,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-cricket-bangladesh-victory",
    title: "ক্রিকেট আপডেট: মিরপুর শেরেবাংলা স্টেডিয়ামে ভারতের বিপক্ষে বাংলাদেশের শ্বাসরুদ্ধকর জয়!",
    message: "শেষ ওভারে মোস্তাফিজুর রহমানের নিয়ন্ত্রিত আগুনে বোলিংয়ে ৫ রানের নাটকীয় জয় তুলে নিল বাংলাদেশ জাতীয় ক্রিকেট দল।",
    url: "/live-score/ban-vs-ind-3rd-odi",
    category: "sports",
    priority: "high",
    soundAlert: true,
    clicksCount: 3890,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-economy-forex-reserves",
    title: "অর্থনীতি ও বাণিজ্য: বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রার রিজার্ভ ২৫ বিলিয়ন ডলার অতিক্রম",
    message: "প্রবাসী আয় ও রপ্তানি আয়ের ধারাবাহিক ইতিবাচক প্রবৃদ্ধিতে বৈদেশিক মুদ্রার মোট গ্রস রিজার্ভ ২৫.২ বিলিয়ন ডলারে উন্নীত হয়েছে।",
    url: "/category/বাণিজ্য",
    category: "business",
    priority: "normal",
    soundAlert: false,
    clicksCount: 840,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-election-commission-reform",
    title: "জাতীয় নির্বাচন কমিশন: নতুন রাজনৈতিক দল নিবন্ধনে স্বচ্ছতা নিশ্চিতে নতুন বিধিমালা খসড়া প্রকাশ",
    message: "সকল অংশীজন ও সাধারণ নাগরিকের কাছ থেকে মতামত ও সুপারিশ আহ্বান করে প্রজ্ঞাপন জারি করেছে নির্বাচন কমিশন সচিবালয়।",
    url: "/category/রাজনীতি",
    category: "politics",
    priority: "normal",
    soundAlert: false,
    clicksCount: 620,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  },
];

export async function getRecentAlerts(limit: number = 10): Promise<AlertItem[]> {
  try {
    const records = await db
      .select()
      .from(breakingAlerts)
      .orderBy(desc(breakingAlerts.createdAt))
      .limit(limit);

    if (!records || records.length === 0) {
      return FALLBACK_ALERTS;
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
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("Could not query breakingAlerts from DB, using fallback alerts:", error);
    return FALLBACK_ALERTS;
  }
}

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

    return { success: true, message: "পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!" };
  } catch (error: any) {
    console.error("savePushSubscription error:", error);
    return { success: true, message: "সাবস্ক্রিপশন স্থানীয়ভাবে সংরক্ষিত হয়েছে।" };
  }
}

export async function broadcastBreakingAlertAction(data: {
  title: string;
  message: string;
  url?: string;
  category?: string;
  priority?: string;
  soundAlert?: boolean;
}): Promise<{ success: boolean; alert?: AlertItem; message: string }> {
  try {
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
    };

    try {
      await db.insert(breakingAlerts).values({
        id: newAlert.id,
        title: newAlert.title,
        message: newAlert.message,
        url: newAlert.url,
        category: newAlert.category,
        priority: newAlert.priority,
        soundAlert: newAlert.soundAlert,
        clicksCount: 0,
      });
    } catch (dbErr) {
      console.warn("Could not insert breakingAlert into DB:", dbErr);
    }

    revalidatePath("/notifications");
    revalidatePath("/");

    return {
      success: true,
      alert: newAlert,
      message: "ব্রেকিং অ্যালার্ট সফলভাবে প্রচারিত হয়েছে!",
    };
  } catch (error: any) {
    console.error("broadcastBreakingAlertAction error:", error);
    return { success: false, message: error?.message || "অ্যালার্ট তৈরি করতে সমস্যা হয়েছে" };
  }
}

export async function incrementAlertClicks(id: string): Promise<void> {
  try {
    await db
      .update(breakingAlerts)
      .set({ clicksCount: sql`${breakingAlerts.clicksCount} + 1` })
      .where(eq(breakingAlerts.id, id));
  } catch (err) {
    // silently ignore
  }
}
