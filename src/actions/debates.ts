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
      return [];
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
    return [];
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

    if (rows.length === 0 || !rows[0]) return null;

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
