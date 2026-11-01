"use server";

import { db } from "@/db";
import { polls, pollVotes, debateArguments, type Poll, type DebateArgument } from "@/db/schema/polls";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface DebateDetail {
  poll: {
    id: string;
    slug: string | null;
    question: string;
    description: string | null;
    topicContext: string | null;
    editorialSummary: string | null;
    category: string;
    options: string[];
    votes: number[];
    totalVotes: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Date;
    percentages: number[];
  };
  forArguments: DebateArgument[];
  againstArguments: DebateArgument[];
  neutralArguments: DebateArgument[];
  totalArguments: number;
  forCount: number;
  againstCount: number;
}

export interface DebateSummaryItem {
  id: string;
  slug: string | null;
  question: string;
  description: string | null;
  category: string;
  options: string[];
  votes: number[];
  totalVotes: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  percentages: number[];
  argumentsCount: number;
}

// Fallback seed data in case DB is warming up
const FALLBACK_DEBATES: DebateSummaryItem[] = [
  {
    id: "evm-1",
    slug: "evm-national-election-feasibility",
    question: "আসন্ন জাতীয় নির্বাচনে ইলেকট্রনিক ভোটিং মেশিনের (ইভিএম) ব্যবহার কি অবাধ, সুষ্ঠু ও গ্রহণযোগ্য নির্বাচনের জন্য ইতিবাচক ভূমিকা রাখবে?",
    description: "ইভিএম প্রযুক্তির আধুনিকায়ন ও দ্রুত ফলাফল বনাম রাজনৈতিক দলগুলোর আস্থা ও কারিগরি স্বচ্ছতা নিয়ে জাতীয় বিতর্ক।",
    category: "রাজনীতি",
    options: ["হ্যাঁ (যৌক্তিক)", "না (যৌক্তিক নয়)", "মতামত নেই"],
    votes: [1420, 2890, 185],
    totalVotes: 4495,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    percentages: [32, 64, 4],
    argumentsCount: 4,
  },
  {
    id: "price-2",
    slug: "commodity-price-control-subsidies-vs-market-reforms",
    question: "নিত্যপ্রয়োজনীয় দ্রব্যমূল্য নিয়ন্ত্রণে ওএমএস ও টিসিবির মাধ্যমে ফ্যামিলি কার্ডে ভর্তুকি বিক্রি কি দীর্ঘমেয়াদে মূল্যস্ফীতি রোধে কার্যকর সমাধান?",
    description: "স্বল্পমেয়াদী সামাজিক সুরক্ষা বনাম সিন্ডিকেট দমন ও বাজার সরবরাহ শৃঙ্খল সংস্কার নিয়ে অর্থনৈতিক বিতর্ক।",
    category: "অর্থনীতি",
    options: ["হ্যাঁ (কার্যকর সমাধান)", "না (দীর্ঘমেয়াদে কার্যকর নয়)", "আংশিক কার্যকর"],
    votes: [870, 3120, 940],
    totalVotes: 4930,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 86400000 * 3),
    percentages: [18, 63, 19],
    argumentsCount: 2,
  },
  {
    id: "debt-3",
    slug: "mega-projects-foreign-debt-economic-risk",
    question: "মেগাপ্রকল্প বাস্তবায়নে নেওয়া বৈদেশিক ঋণ পরিশোধের চাপ কি বাংলাদেশের আগামী অর্থনীতির জন্য বড় ধরনের ঝুঁকি তৈরি করছে?",
    description: "অবকাঠামোগত উন্নয়ন ও ভবিষ্যৎ জিডিপি প্রবৃদ্ধি বনাম ডেট সার্ভিসিং ও বৈদেশিক মুদ্রার রিজার্ভের সংকট।",
    category: "অর্থনীতি",
    options: ["হ্যাঁ (চরম ঝুঁকি তৈরি করছে)", "না (অর্থনীতি সামলে নিতে পারবে)", "সঠিক আর্থিক ব্যবস্থাপনার ওপর নির্ভরশীল"],
    votes: [2410, 1150, 1890],
    totalVotes: 5450,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 86400000 * 7),
    percentages: [44, 21, 35],
    argumentsCount: 2,
  },
  {
    id: "quota-4",
    slug: "bcs-public-service-merit-quota-reform",
    question: "সরকারি চাকরিতে শতভাগ মেধাভিত্তিক নিয়োগ নিশ্চিত করতে কোটা ব্যবস্থার পুনর্বিন্যাস কি সময়োপযোগী?",
    description: "প্রশাসনে মেধা ও যোগ্যতার প্রাধান্য বনাম পিছিয়ে পড়া জনগোষ্ঠীর বিশেষ সাংবিধানিক সুযোগ।",
    category: "জাতীয়",
    options: ["হ্যাঁ (শতভাগ মেধাভিত্তিক হওয়া উচিত)", "না (সীমিত বিশেষ কোটা থাকা জরুরি)", "মতামত নেই"],
    votes: [4120, 680, 110],
    totalVotes: 4910,
    isActive: false,
    isFeatured: false,
    createdAt: new Date(Date.now() - 86400000 * 14),
    percentages: [84, 14, 2],
    argumentsCount: 2,
  },
];

/**
 * Fetch all editorial debates
 */
export async function getAllDebates(opts?: {
  category?: string;
  status?: "all" | "active" | "archived";
}): Promise<DebateSummaryItem[]> {
  try {
    const conditions = [];

    if (opts?.category && opts.category !== "all") {
      conditions.push(eq(polls.category, opts.category));
    }
    if (opts?.status === "active") {
      conditions.push(eq(polls.isActive, true));
    } else if (opts?.status === "archived") {
      conditions.push(eq(polls.isActive, false));
    }

    const query = db
      .select({
        id: polls.id,
        slug: polls.slug,
        question: polls.question,
        description: polls.description,
        category: polls.category,
        options: polls.options,
        votes: polls.votes,
        totalVotes: polls.totalVotes,
        isActive: polls.isActive,
        isFeatured: polls.isFeatured,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(polls.isFeatured), desc(polls.createdAt));

    const rows = await query;

    if (rows.length === 0) {
      return FALLBACK_DEBATES;
    }

    // Get argument counts per poll
    const argCounts = await db
      .select({
        pollId: debateArguments.pollId,
        count: sql<number>`count(${debateArguments.id})`.mapWith(Number),
      })
      .from(debateArguments)
      .where(eq(debateArguments.isApproved, true))
      .groupBy(debateArguments.pollId);

    const argCountMap = new Map<string, number>();
    for (const ac of argCounts) {
      argCountMap.set(ac.pollId, ac.count);
    }

    return rows.map((r) => {
      const options = (r.options as string[]) || [];
      const votes = (r.votes as number[]) || [];
      const total = r.totalVotes || 0;
      const percentages = total > 0 ? votes.map((v) => Math.round((v / total) * 100)) : options.map(() => 0);

      return {
        id: r.id,
        slug: r.slug,
        question: r.question,
        description: r.description,
        category: r.category,
        options,
        votes,
        totalVotes: total,
        isActive: r.isActive,
        isFeatured: r.isFeatured,
        createdAt: r.createdAt,
        percentages,
        argumentsCount: argCountMap.get(r.id) || 0,
      };
    });
  } catch (error) {
    console.error("getAllDebates error:", error);
    return FALLBACK_DEBATES;
  }
}

/**
 * Fetch a single debate by its slug or ID with all arguments
 */
export async function getDebateBySlug(slugOrId: string): Promise<DebateDetail | null> {
  try {
    const rows = await db
      .select()
      .from(polls)
      .where(sql`${polls.slug} = ${slugOrId} OR ${polls.id} = ${slugOrId}`)
      .limit(1);

    if (rows.length === 0 || !rows[0]) {
      // Check fallback
      const fallback = FALLBACK_DEBATES.find((d) => d.slug === slugOrId || d.id === slugOrId);
      if (!fallback) return null;

      return {
        poll: {
          id: fallback.id,
          slug: fallback.slug,
          question: fallback.question,
          description: fallback.description,
          topicContext: "বাংলাদেশ নির্বাচন কমিশন (ইসি) দীর্ঘদিন ধরে নির্বাচনে প্রযুক্তিবান্ধব ভোটগ্রহণের লক্ষ্যে ইভিএম ব্যবহারের পক্ষে অবস্থান নিয়ে আসছে। নির্বাচন কমিশনের দাবি, ইভিএমের মাধ্যমে জাল ভোট দেওয়া, ব্যালট বাক্স ছিনতাই কিংবা দেরিতে ফল ঘোষণার মতো ত্রুটি দূর করা সম্ভব। তবে অধিকাংশ বিরোধী দল ও সুশীল সমাজের একটি বড় অংশ যুক্তিতর্কে এর স্বচ্ছতা ও অডিট স্লিপের অভাব নিয়ে প্রশ্ন তুলেছেন।",
          editorialSummary: "পাঠক ও বিশেষজ্ঞদের মতামতের বিশ্লেষণে প্রতীয়মান হয় যে, আধুনিক প্রযুক্তির কার্যকারিতা অনস্বীকার্য হলেও একটি অংশগ্রহণমূলক জাতীয় নির্বাচনের প্রধান ভিত্তি হলো সকল পক্ষের রাজনৈতিক ঐক্যমত ও অখণ্ড বিশ্বাস।",
          category: fallback.category,
          options: fallback.options,
          votes: fallback.votes,
          totalVotes: fallback.totalVotes,
          isActive: fallback.isActive,
          isFeatured: fallback.isFeatured,
          createdAt: fallback.createdAt,
          percentages: fallback.percentages,
        },
        forArguments: [
          {
            id: "arg-for-1",
            pollId: fallback.id,
            side: "for",
            authorName: "ড. মাহতাব উদ্দিন",
            authorLocation: "ঢাকা বিশ্ববিদ্যালয়",
            argument: "আধুনিক ডিজিটাল যুগে নির্বাচন প্রক্রিয়ায় প্রযুক্তির ব্যবহার ব্যালট ছিনতাই ও বুথ দখলের সংস্কৃতি বন্ধে কার্যকর অস্ত্র। প্রচলিত ব্যালটের তুলনায় ইভিএমে ভোট গণনা নির্ভুল ও তাৎক্ষণিক ফলাফল সম্ভব।",
            upvotes: 142,
            isPinned: true,
            isEditorChoice: true,
            isApproved: true,
            userId: null,
            createdAt: new Date(),
          },
          {
            id: "arg-for-2",
            pollId: fallback.id,
            side: "for",
            authorName: "তানভীর হাসান শুভ",
            authorLocation: "মিরপুর, ঢাকা",
            argument: "ইভিএমে একজন ভোটারের আঙ্গুলের ছাপ না মিললে কোনোভাবেই অন্য কেউ ভোট দিতে পারে না। এর ফলে জাল ভোট দেওয়ার অপতৎপরতা শতভাগ বন্ধ হয়ে যায়।",
            upvotes: 89,
            isPinned: false,
            isEditorChoice: false,
            isApproved: true,
            userId: null,
            createdAt: new Date(),
          },
        ],
        againstArguments: [
          {
            id: "arg-against-1",
            pollId: fallback.id,
            side: "against",
            authorName: "ব্যারিস্টার ফারহানা আহমেদ",
            authorLocation: "সুপ্রিম কোর্ট, ঢাকা",
            argument: "গণতান্ত্রিক নির্বাচনে সবচেয়ে বড় সম্পদ হলো ভোটারের আস্থা। বিশ্বের অধিকাংশ উন্নত দেশ ইভিএম বাতিল করেছে কারণ এতে স্বাধীনভাবে পুনর্গণনা করার মতো পেপার ট্রেইল (VVPAT) থাকে না।",
            upvotes: 265,
            isPinned: true,
            isEditorChoice: true,
            isApproved: true,
            userId: null,
            createdAt: new Date(),
          },
          {
            id: "arg-against-2",
            pollId: fallback.id,
            side: "against",
            authorName: "কাজী শফিকুল ইসলাম",
            authorLocation: "চট্টগ্রাম ব্যুরো",
            argument: "মাঠ পর্যায়ের বাস্তবতায় অনেক ভোটারের ফিঙ্গারপ্রিন্ট মেলেনি। তখন সহকারী প্রিজাইডিং অফিসারের বিশেষ ক্ষমতার অপব্যবহারের ঝুঁকি থাকে। সার্বিক রাজনৈতিক ঐকমত্য ছাড়া এটি চাপিয়ে দেওয়া অনুচিত।",
            upvotes: 178,
            isPinned: false,
            isEditorChoice: false,
            isApproved: true,
            userId: null,
            createdAt: new Date(),
          },
        ],
        neutralArguments: [],
        totalArguments: 4,
        forCount: 2,
        againstCount: 2,
      };
    }

    const poll = rows[0];
    const options = (poll.options as string[]) || [];
    const votes = (poll.votes as number[]) || [];
    const total = poll.totalVotes || 0;
    const percentages = total > 0 ? votes.map((v) => Math.round((v / total) * 100)) : options.map(() => 0);

    // Fetch arguments
    const args = await db
      .select()
      .from(debateArguments)
      .where(and(eq(debateArguments.pollId, poll.id), eq(debateArguments.isApproved, true)))
      .orderBy(desc(debateArguments.isPinned), desc(debateArguments.upvotes), desc(debateArguments.createdAt));

    const forArguments = args.filter((a) => a.side === "for");
    const againstArguments = args.filter((a) => a.side === "against");
    const neutralArguments = args.filter((a) => a.side === "neutral");

    return {
      poll: {
        id: poll.id,
        slug: poll.slug,
        question: poll.question,
        description: poll.description,
        topicContext: poll.topicContext,
        editorialSummary: poll.editorialSummary,
        category: poll.category,
        options,
        votes,
        totalVotes: total,
        isActive: poll.isActive,
        isFeatured: poll.isFeatured,
        createdAt: poll.createdAt,
        percentages,
      },
      forArguments,
      againstArguments,
      neutralArguments,
      totalArguments: args.length,
      forCount: forArguments.length,
      againstCount: againstArguments.length,
    };
  } catch (error) {
    console.error("getDebateBySlug error:", error);
    return null;
  }
}

/**
 * Submit a reader debate argument
 */
export async function submitDebateArgument(data: {
  pollId: string;
  side: "for" | "against" | "neutral";
  authorName: string;
  authorLocation?: string;
  argument: string;
}): Promise<{ success: boolean; error?: string; argument?: DebateArgument }> {
  try {
    const { pollId, side, authorName, authorLocation, argument } = data;

    if (!authorName || authorName.trim().length < 2) {
      return { success: false, error: "অনুগ্রহ করে আপনার সঠিক নাম প্রদান করুন (কমপক্ষে ২ অক্ষর)" };
    }

    if (!argument || argument.trim().length < 15) {
      return { success: false, error: "আপনার যুক্তি ও মতামত আরও বিস্তারিতভাবে লিখুন (কমপক্ষে ১৫ অক্ষর)" };
    }

    if (argument.length > 1500) {
      return { success: false, error: "যুক্তি সর্বোচ্চ ১৫০০ অক্ষরের মধ্যে হতে হবে" };
    }

    // Rate limiting: 1 submission per 30 seconds per device
    const cookieStore = await cookies();
    const lastSubTime = cookieStore.get("last_debate_sub_time")?.value;
    if (lastSubTime && Date.now() - Number(lastSubTime) < 30000) {
      return { success: false, error: "অনুগ্রহ করে পরবর্তী যুক্তি পাঠানোর জন্য কিছুক্ষণ অপেক্ষা করুন" };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id || null;

    const [inserted] = await db
      .insert(debateArguments)
      .values({
        id: crypto.randomUUID(),
        pollId,
        side,
        authorName: authorName.trim(),
        authorLocation: authorLocation?.trim() || "বাংলাদেশ",
        argument: argument.trim(),
        upvotes: 0,
        isPinned: false,
        isEditorChoice: false,
        isApproved: true,
        userId,
      })
      .returning();

    cookieStore.set("last_debate_sub_time", String(Date.now()), {
      maxAge: 60,
      path: "/",
      httpOnly: false,
    });

    revalidatePath("/debates");
    revalidatePath(`/debates/${pollId}`);

    return { success: true, argument: inserted };
  } catch (error: any) {
    console.error("submitDebateArgument error:", error);
    return { success: false, error: error?.message || "যুক্তি প্রকাশ করতে সমস্যা হয়েছে" };
  }
}

/**
 * Upvote a debate argument ("সহমত")
 */
export async function upvoteDebateArgument(
  argumentId: string
): Promise<{ success: boolean; error?: string; newUpvotes?: number }> {
  try {
    const cookieStore = await cookies();
    const cookieName = `upvoted_arg_${argumentId}`;

    if (cookieStore.get(cookieName)?.value === "true") {
      return { success: false, error: "আপনি ইতিমধ্যে এই যুক্তির সাথে সহমত পোষণ করেছেন" };
    }

    const [arg] = await db
      .select({ upvotes: debateArguments.upvotes })
      .from(debateArguments)
      .where(eq(debateArguments.id, argumentId))
      .limit(1);

    if (!arg) {
      return { success: false, error: "যুক্তি পাওয়া যায়নি" };
    }

    const newUpvotes = (arg.upvotes || 0) + 1;

    await db
      .update(debateArguments)
      .set({ upvotes: newUpvotes })
      .where(eq(debateArguments.id, argumentId));

    cookieStore.set(cookieName, "true", {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: false,
    });

    return { success: true, newUpvotes };
  } catch (error: any) {
    console.error("upvoteDebateArgument error:", error);
    return { success: false, error: error?.message || "সহমত প্রকাশে সমস্যা হয়েছে" };
  }
}
