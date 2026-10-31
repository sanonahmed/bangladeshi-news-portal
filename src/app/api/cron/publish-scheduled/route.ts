import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema/articles";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { revalidateArticle } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all approved+scheduled articles whose scheduledAt <= now
  const toPublish = await db
    .select({ id: articles.id, slug: articles.slug })
    .from(articles)
    .where(
      and(
        eq(articles.status, "approved"),
        isNotNull(articles.scheduledAt),
        lte(articles.scheduledAt, now)
      )
    );

  let published = 0;
  for (const article of toPublish) {
    await db
      .update(articles)
      .set({ status: "published", publishedAt: now, updatedAt: now })
      .where(eq(articles.id, article.id));

    revalidateArticle(article.slug);
    published++;
  }

  return NextResponse.json({ published });
}
