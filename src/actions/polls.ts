"use server";

import { db } from "@/db";
import { polls, pollVotes, type Poll } from "@/db/schema/polls";
import { user } from "@/db/schema/auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import crypto from "crypto";
import { z } from "zod";

export async function getActivePoll(): Promise<Poll | null> {
  try {
    // Prefer featured active poll first, else most recent active poll
    const rows = await db
      .select()
      .from(polls)
      .where(eq(polls.isActive, true))
      .orderBy(desc(polls.isFeatured), desc(polls.createdAt))
      .limit(1);

    return rows[0] || null;
  } catch (error) {
    console.error("getActivePoll error:", error);
    return null;
  }
}

export async function getAllPolls(): Promise<Poll[]> {
  try {
    const rows = await db
      .select()
      .from(polls)
      .orderBy(desc(polls.createdAt));

    return rows;
  } catch (error) {
    console.error("getAllPolls error:", error);
    return [];
  }
}

export async function getAllAdminPolls(): Promise<Poll[]> {
  try {
    const rows = await db
      .select()
      .from(polls)
      .orderBy(desc(polls.createdAt));

    return rows;
  } catch (error) {
    console.error("getAllAdminPolls error:", error);
    return [];
  }
}

export async function castVote(
  pollId: string,
  optionIndex: number
): Promise<{ success: boolean; error?: string; poll?: Poll }> {
  try {
    const cookieStore = await cookies();
    const cookieName = `has_voted_poll_${pollId}`;

    if (cookieStore.get(cookieName)?.value === "true") {
      return { success: false, error: "আপনি ইতিমধ্যে এই জরিপে ভোট প্রদান করেছেন!" };
    }

    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
    if (!poll) {
      return { success: false, error: "জরিপ পাওয়া যায়নি" };
    }
    if (!poll.isActive) {
      return { success: false, error: "এই জরিপটি বর্তমানে বন্ধ রয়েছে" };
    }

    const currentOptions = poll.options as string[];
    const currentVotes = (poll.votes as number[]) || new Array(currentOptions.length).fill(0);

    if (optionIndex < 0 || optionIndex >= currentOptions.length) {
      return { success: false, error: "অকার্যকর অপশন নির্বাচন" };
    }

    // Clone & increment chosen option
    const updatedVotes = [...currentVotes];
    updatedVotes[optionIndex] = (updatedVotes[optionIndex] || 0) + 1;
    const newTotalVotes = (poll.totalVotes || 0) + 1;

    // Optional user or IP info
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id || null;
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Update poll
    const [updatedPoll] = await db
      .update(polls)
      .set({
        votes: updatedVotes,
        totalVotes: newTotalVotes,
        updatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
      .returning();

    // Insert vote record
    const hashedIp = crypto.createHash("sha256").update(ip).digest("hex");
    await db.insert(pollVotes).values({
      id: crypto.randomUUID(),
      pollId,
      optionIndex,
      ipHash: hashedIp,
      userId,
    });

    // Set cookie for 30 days
    cookieStore.set(cookieName, "true", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: false,
    });

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath("/admin/polls");

    return { success: true, poll: updatedPoll };
  } catch (error: any) {
    console.error("castVote error:", error);
    return { success: false, error: error?.message || "ভোট গ্রহণে সমস্যা হয়েছে" };
  }
}

const CreatePollSchema = z.object({
  question: z.string().min(5, "জরিপের প্রশ্ন কমপক্ষে ৫ অক্ষরের হতে হবে").max(300),
  description: z.string().optional(),
  category: z.string().default("জাতীয়"),
  options: z.array(z.string().min(1, "বিকল্প খালি রাখা যাবে না")).min(2, "কমপক্ষে ২টি বিকল্প দিন"),
  isFeatured: z.boolean().default(false),
});

export async function createPoll(
  data: z.infer<typeof CreatePollSchema>
): Promise<{ success: boolean; error?: string; poll?: Poll }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার: কেবলমাত্র সম্পাদক বা অ্যাডমিন জরিপ তৈরি করতে পারেন।" };
    }

    const parsed = CreatePollSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { question, description, category, options, isFeatured } = parsed.data;
    const userId = actor.id;

    // If marked featured, un-feature others
    if (isFeatured) {
      await db.update(polls).set({ isFeatured: false });
    }

    const initialVotes = new Array(options.length).fill(0);

    const [newPoll] = await db
      .insert(polls)
      .values({
        id: crypto.randomUUID(),
        question: question.trim(),
        description: description?.trim() || null,
        category,
        options,
        votes: initialVotes,
        totalVotes: 0,
        isActive: true,
        isFeatured,
        createdBy: userId,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath("/admin/polls");

    return { success: true, poll: newPoll };
  } catch (error: any) {
    console.error("createPoll error:", error);
    return { success: false, error: error?.message || "জরিপ তৈরি ব্যর্থ হয়েছে" };
  }
}

export async function togglePollFeatured(
  pollId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    if (isFeatured) {
      await db.update(polls).set({ isFeatured: false });
    }

    await db.update(polls).set({ isFeatured, updatedAt: new Date() }).where(eq(polls.id, pollId));

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath("/admin/polls");

    return { success: true };
  } catch (error: any) {
    console.error("togglePollFeatured error:", error);
    return { success: false, error: "সেটিংস আপডেট ব্যর্থ হয়েছে" };
  }
}

export async function togglePollStatus(
  pollId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.update(polls).set({ isActive, updatedAt: new Date() }).where(eq(polls.id, pollId));

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath("/admin/polls");

    return { success: true };
  } catch (error: any) {
    console.error("togglePollStatus error:", error);
    return { success: false, error: "অবস্থা পরিবর্তন ব্যর্থ হয়েছে" };
  }
}

export async function deletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentAdminUser();
    if (!actor || !isRoleAtLeast(actor.role, "editor")) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(polls).where(eq(polls.id, pollId));

    revalidatePath("/");
    revalidatePath("/polls");
    revalidatePath("/admin/polls");

    return { success: true };
  } catch (error: any) {
    console.error("deletePoll error:", error);
    return { success: false, error: "জরিপ মুছে ফেলা যায়নি" };
  }
}
