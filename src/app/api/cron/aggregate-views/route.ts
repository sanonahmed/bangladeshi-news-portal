import { NextRequest, NextResponse } from "next/server";
import { getBufferedViewCounts, clearBufferedViews } from "@/lib/redis";
import { db } from "@/db";
import { articleViewAggregates } from "@/db/schema/engagement";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim().length === 0) {
    return NextResponse.json({ error: "Cron authorization not configured on server" }, { status: 503 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const viewCounts = await getBufferedViewCounts();
  const articleIds = Object.keys(viewCounts);

  if (articleIds.length === 0) {
    return NextResponse.json({ flushed: 0 });
  }

  // Upsert view aggregates in Postgres
  for (const [articleId, count] of Object.entries(viewCounts)) {
    await db
      .insert(articleViewAggregates)
      .values({
        articleId,
        totalViews: count,
        last24h: count,
        last7d: count,
        last30d: count,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: articleViewAggregates.articleId,
        set: {
          totalViews: sql`${articleViewAggregates.totalViews} + ${count}`,
          last24h: sql`${articleViewAggregates.last24h} + ${count}`,
          last7d: sql`${articleViewAggregates.last7d} + ${count}`,
          last30d: sql`${articleViewAggregates.last30d} + ${count}`,
          updatedAt: new Date(),
        },
      });
  }

  await clearBufferedViews(articleIds);

  return NextResponse.json({ flushed: articleIds.length });
}
