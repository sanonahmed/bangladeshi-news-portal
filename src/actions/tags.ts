"use server";

import { db } from "@/db";
import { tags, articleTags, type Tag } from "@/db/schema/tags";
import { desc, eq, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";

export interface TagWithArticleCount {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  count: number;
  createdAt: Date;
}

export async function getAllAdminTags(): Promise<TagWithArticleCount[]> {
  try {
    const rows = await db
      .select({
        id: tags.id,
        name: tags.name,
        nameEn: tags.nameEn,
        slug: tags.slug,
        createdAt: tags.createdAt,
        articleCount: count(articleTags.articleId),
      })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .groupBy(tags.id, tags.name, tags.nameEn, tags.slug, tags.createdAt)
      .orderBy(desc(count(articleTags.articleId)), tags.name);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      nameEn: r.nameEn,
      slug: r.slug,
      count: Number(r.articleCount || 0),
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("getAllAdminTags error:", error);
    return [];
  }
}

const CreateTagSchema = z.object({
  name: z.string().min(2, "ট্যাগের নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(80),
  nameEn: z.string().optional(),
  slug: z.string().optional(),
});

export async function createAdminTag(
  data: z.infer<typeof CreateTagSchema>
): Promise<{ success: boolean; error?: string; tag?: Tag }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("demo_admin_session")?.value === "true";

    if (!session && !isDemo) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    const parsed = CreateTagSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const name = parsed.data.name.trim();
    const nameEn = parsed.data.nameEn?.trim() || null;
    let slug = parsed.data.slug?.trim();

    if (!slug) {
      slug = (nameEn || name)
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9\u0980-\u09FF-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (!slug) {
      slug = `tag-${Date.now()}`;
    }

    const [inserted] = await db
      .insert(tags)
      .values({
        id: crypto.randomUUID(),
        name,
        nameEn,
        slug,
      })
      .returning();

    revalidatePath("/admin/tags");
    return { success: true, tag: inserted };
  } catch (error: any) {
    console.error("createAdminTag error:", error);
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      return { success: false, error: "এই নামের ট্যাগ বা স্লাগ ইতোমধ্যে বিদ্যমান রয়েছে" };
    }
    return { success: false, error: "ট্যাগ সংরক্ষণ করতে সমস্যা হয়েছে" };
  }
}

export async function deleteAdminTag(
  tagId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const cookieStore = await cookies();
    const isDemo = cookieStore.get("demo_admin_session")?.value === "true";

    if (!session && !isDemo) {
      return { success: false, error: "অননুমোদিত প্রবেশাধিকার" };
    }

    await db.delete(tags).where(eq(tags.id, tagId));
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error) {
    console.error("deleteAdminTag error:", error);
    return { success: false, error: "ট্যাগ মুছে ফেলতে সমস্যা হয়েছে" };
  }
}
