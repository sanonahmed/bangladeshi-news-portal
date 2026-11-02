"use server";

import { db } from "@/db";
import { articles } from "@/db/schema/articles";
import { categories } from "@/db/schema/categories";
import { user } from "@/db/schema/auth";
import { mediaAssets } from "@/db/schema/media";
import { articleCategories } from "@/db/schema/articles";
import { authorProfiles } from "@/db/schema/authors";
import { desc, eq, and } from "drizzle-orm";
import { cleanHtmlToText, estimateAudioDuration } from "@/lib/tts-extractor";

export interface AudioNewsTrack {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  featuredImageUrl: string | null;
  estimatedDuration: string;
  durationSeconds: number;
}

const FALLBACK_TRACKS: AudioNewsTrack[] = [
  {
    id: "audio-lead-1",
    title: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে ১০ দফা রূপরেখা ঘোষণা সরকারের",
    slug: "economic-stability-roadmap-announced",
    excerpt: "মুদ্রাস্ফীতি নিয়ন্ত্রণ, ব্যাংক খাতের সুশাসন ও বৈদেশিক মুদ্রার রিজার্ভ সুরক্ষায় কার্যকর পদক্ষেপ নেওয়ার ঘোষণা দেওয়া হয়েছে।",
    content: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে ১০ দফা রূপরেখা ঘোষণা করেছে অর্থ মন্ত্রণালয়। মুদ্রাস্ফীতি নিয়ন্ত্রণ, ব্যাংক খাতের সুশাসন ও বৈদেশিক মুদ্রার রিজার্ভ সুরক্ষায় কার্যকর পদক্ষেপ নেওয়ার কথা জানিয়েছেন দায়িত্বশীলরা। নিত্যপণ্যের সরবরাহ চেইন স্বাভাবিক রাখতে জেলা পর্যায়ে বিশেষ টাস্কফোর্স গঠনের নির্দেশ দেওয়া হয়েছে।",
    category: "অর্থনীতি",
    author: "মাহমুদুর রহমান",
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    featuredImageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    estimatedDuration: "২ মিনিট",
    durationSeconds: 120,
  },
  {
    id: "audio-lead-2",
    title: "মিরপুর স্টেডিয়ামে টানটান উত্তেজনার ম্যাচে ভারতের বিপক্ষে বাংলাদেশের নাটকীয় জয়",
    slug: "ban-vs-ind-3rd-odi-match-summary",
    excerpt: "শেষ ওভারের রোমাঞ্চে ৫ রানের জয় তুলে নিয়ে তিন ম্যাচ ওয়ানডে সিরিজে অনন্য গৌরব অর্জন করল টাইগাররা।",
    content: "মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে টানটান উত্তেজনার ম্যাচে ভারতকে ৫ রানে পরাজিত করেছে বাংলাদেশ। শেষ ওভারে ভারতের জয়ের জন্য প্রয়োজন ছিল ১২ রান। দুর্দান্ত ডেথ বোলিং প্রদর্শন করে টাইগার বোলাররা দলকে জয়ের বন্দরে পৌঁছে দেন। ম্যান অব দ্য ম্যাচ নির্বাচিত হয়েছেন অলরাউন্ড নৈপুণ্য দেখানো সাকিব আল হাসান।",
    category: "খেলাধুলা",
    author: "রাকিবুল হাসান",
    publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    featuredImageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
    estimatedDuration: "১ মিনিট ৫০ সেকেন্ড",
    durationSeconds: 110,
  },
  {
    id: "audio-lead-3",
    title: "বঙ্গোপসাগরে সৃষ্ট গভীর নিম্নচাপের প্রভাবে উপকূলীয় এলাকায় ৩ নম্বর সতর্কতা সংকেত",
    slug: "cyclone-depression-warning-bay-of-bengal",
    excerpt: "মাছ ধরার ট্রলারসমূহকে পরবর্তী নির্দেশ না দেওয়া পর্যন্ত উপকূলের কাছাকাছি নিরাপদ আশ্রয়ে থাকতে বলা হয়েছে।",
    content: "উত্তর বঙ্গোপসাগর ও তৎসংলগ্ন এলাকায় অবস্থানরত গভীর নিম্নচাপটি ঘনীভূত হয়ে উত্তর-পশ্চিম দিকে অগ্রসর হচ্ছে। এর প্রভাবে চট্টগ্রাম, কক্সবাজার, মোংলা ও পায়রা সমুদ্রবন্দরকে ৩ নম্বর স্থানীয় সতর্ক সংকেত দেখিয়ে যেতে বলা হয়েছে। উপকূলীয় নিম্নাঞ্চল স্বাভাবিকের চেয়ে ২ থেকে ৩ ফুট অধিক উচ্চতার বায়ুতাড়িত জলোচ্ছ্বাসে প্লাবিত হতে পারে।",
    category: "জাতীয়",
    author: "সানজিদা আক্তার",
    publishedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    featuredImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    estimatedDuration: "১ মিনিট ৪০ সেকেন্ড",
    durationSeconds: 100,
  },
  {
    id: "audio-lead-4",
    title: "তথ্যপ্রযুক্তি খাতে রপ্তানি আয় ১০০ কোটি ডলার অতিক্রম, ফ্রিল্যান্সারদের জন্য বিশেষ প্রণোদনা",
    slug: "ict-export-crosses-billion-dollar-incentives",
    excerpt: "সফটওয়্যার ও আইটি এনাবলড সার্ভিসেস খাতে বৈশ্বিক বাজারে বাংলাদেশি তরুণদের ক্রমবর্ধমান সাফল্য উদযাপন।",
    content: "তথ্যপ্রযুক্তি ও সফটওয়্যার রপ্তানিতে নতুন মাইলফলক স্পর্শ করেছে বাংলাদেশ। চলতি অর্থবছরে এ খাতের রপ্তানি আয় ১০০ কোটি ডলার বা ১ বিলিয়ন ডলার ছাড়িয়েছে। তরুণ ফ্রিল্যান্সারদের ব্যাংকিং চ্যানেলে রেমিট্যান্স প্রেরণে নগদ সহায়তা ৪ শতাংশে উন্নীত করার প্রস্তাব অনুমোদন দিয়েছে অর্থ বিভাগ।",
    category: "প্রযুক্তি",
    author: "তানভীর আহমেদ",
    publishedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    featuredImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    estimatedDuration: "১ মিনিট ৪৫ সেকেন্ড",
    durationSeconds: 105,
  },
  {
    id: "audio-lead-5",
    title: "গাজা ও মধ্যপ্রাচ্য সংকট নিরসনে জাতিসংঘ নিরাপত্তা পরিষদের জরুরি বৈঠক আহ্বান",
    slug: "un-security-council-emergency-meeting-middle-east",
    excerpt: "যুদ্ধবিরতি কার্যকর ও আন্তর্জাতিক মানবিক সহায়তা নির্বিঘ্ন করার তাগিদ বিশ্বনেতাদের।",
    content: "মধ্যপ্রাচ্যের যুদ্ধ পরিস্থিতি এবং সাধারণ বেসামরিক নাগরিকদের ওপর আক্রমণ অবিলম্বে বন্ধের দাবিতে জাতিসংঘ নিরাপত্তা পরিষদের জরুরি অধিবেশন আহ্বান করা হয়েছে। মানবিক করিডোর উন্মুক্ত করে খাদ্য ও ওষুধ সরবরাহের বিষয়ে আন্তর্জাতিক ঐকমত্যের ওপর জোর দেওয়া হয়েছে।",
    category: "আন্তর্জাতিক",
    author: "ফারহানা কবীর",
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    featuredImageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
    estimatedDuration: "১ মিনিট ৩০ সেকেন্ড",
    durationSeconds: 90,
  },
];

export async function getAudioNewsPlaylist(): Promise<AudioNewsTrack[]> {
  try {
    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        publishedAt: articles.publishedAt,
        featuredImageUrl: mediaAssets.publicUrl,
        categoryName: categories.name,
        authorName: user.name,
      })
      .from(articles)
      .leftJoin(mediaAssets, eq(articles.featuredImageId, mediaAssets.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(10);

    if (!rows || rows.length === 0) {
      return FALLBACK_TRACKS;
    }

    return rows.map((r) => {
      const cleanContent = cleanHtmlToText(r.content || r.excerpt || "");
      const { totalSeconds, formatted } = estimateAudioDuration(cleanContent);
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt || "",
        content: r.content || "",
        category: r.categoryName || "সংবাদ",
        author: r.authorName || "নিজস্ব প্রতিবেদক",
        publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : new Date().toISOString(),
        featuredImageUrl: r.featuredImageUrl,
        estimatedDuration: formatted,
        durationSeconds: totalSeconds,
      };
    });
  } catch (error) {
    console.warn("getAudioNewsPlaylist DB error, using fallbacks:", error);
    return FALLBACK_TRACKS;
  }
}
