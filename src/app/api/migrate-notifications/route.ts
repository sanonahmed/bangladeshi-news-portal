import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET || "bootstrap_secret_bangladesh_barta_2026";
    
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(connectionString);

    // 1. Create push_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        categories JSONB DEFAULT '["breaking", "national", "sports"]'::jsonb,
        user_agent TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS push_subs_endpoint_idx ON push_subscriptions(endpoint);`;

    // 2. Create breaking_alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS breaking_alerts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        url TEXT DEFAULT '/',
        category TEXT NOT NULL DEFAULT 'breaking',
        priority TEXT NOT NULL DEFAULT 'urgent',
        sound_alert BOOLEAN NOT NULL DEFAULT true,
        is_broadcasted BOOLEAN NOT NULL DEFAULT true,
        clicks_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS breaking_alerts_category_idx ON breaking_alerts(category);`;
    await sql`CREATE INDEX IF NOT EXISTS breaking_alerts_priority_idx ON breaking_alerts(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS breaking_alerts_created_at_idx ON breaking_alerts(created_at);`;

    // 3. Seed initial breaking alerts if empty
    const seedAlerts = [
      {
        id: "alert-weather-cyclone-warning",
        title: "জরুরি আবহাওয়া বার্তা: বঙ্গোপসাগরে গভীর নিম্নচাপ, ৩ নম্বর স্থানীয় সতর্ক সংকেত জারি",
        message: "উপকূলীয় এলাকায় ৫০-৬০ কিমি বেগে দমকা বা ঝড়ো হাওয়া বয়ে যেতে পারে। মাছ ধরার সকল ট্রলারসমূহকে নিরাপদ আশ্রয়ে থাকার নির্দেশ দিয়েছে আবহাওয়া অধিদপ্তর।",
        url: "/category/জাতীয়",
        category: "breaking",
        priority: "urgent",
        soundAlert: true,
      },
      {
        id: "alert-cricket-bangladesh-victory",
        title: "ক্রিকেট আপডেট: মিরপুর শেরেবাংলা স্টেডিয়ামে ভারতের বিপক্ষে বাংলাদেশের শ্বাসরুদ্ধকর জয়!",
        message: "শেষ ওভারে মোস্তাফিজুর রহমানের নিয়ন্ত্রিত আগুনে বোলিংয়ে ৫ রানের নাটকীয় জয় তুলে নিল বাংলাদেশ জাতীয় ক্রিকেট দল।",
        url: "/live-score/ban-vs-ind-3rd-odi",
        category: "sports",
        priority: "high",
        soundAlert: true,
      },
      {
        id: "alert-economy-forex-reserves",
        title: "অর্থনীতি ও বাণিজ্য: বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রার রিজার্ভ ২৫ বিলিয়ন ডলার অতিক্রম",
        message: "প্রবাসী আয় ও রপ্তানি আয়ের ধারাবাহিক ইতিবাচক প্রবৃদ্ধিতে বৈদেশিক মুদ্রার মোট গ্রস রিজার্ভ ২৫.২ বিলিয়ন ডলারে উন্নীত হয়েছে।",
        url: "/category/বাণিজ্য",
        category: "business",
        priority: "normal",
        soundAlert: false,
      },
      {
        id: "alert-election-commission-reform",
        title: "জাতীয় নির্বাচন কমিশন: নতুন রাজনৈতিক দল নিবন্ধনে স্বচ্ছতা নিশ্চিতে নতুন বিধিমালা খসড়া প্রকাশ",
        message: "সকল অংশীজন ও সাধারণ নাগরিকের কাছ থেকে মতামত ও সুপারিশ আহ্বান করে প্রজ্ঞাপন জারি করেছে নির্বাচন কমিশন সচিবালয়।",
        url: "/category/রাজনীতি",
        category: "politics",
        priority: "normal",
        soundAlert: false,
      },
    ];

    for (const a of seedAlerts) {
      const exists = await sql`SELECT id FROM breaking_alerts WHERE id = ${a.id} LIMIT 1;`;
      if (exists.length === 0) {
        await sql`
          INSERT INTO breaking_alerts (
            id, title, message, url, category, priority, sound_alert, is_broadcasted, created_at
          ) VALUES (
            ${a.id}, ${a.title}, ${a.message}, ${a.url}, ${a.category}, ${a.priority}, ${a.soundAlert}, true, NOW()
          );
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Push notifications and breaking alerts tables migrated and seeded successfully!",
    });
  } catch (error: any) {
    console.error("Migration endpoint error:", error);
    return NextResponse.json(
      { error: error?.message || "Migration failed" },
      { status: 500 }
    );
  }
}
