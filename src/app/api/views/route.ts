import { NextRequest, NextResponse } from "next/server";
import { incrementArticleView, apiRatelimit } from "@/lib/redis";
import { db } from "@/db";
import { articles, articleViewAggregates, activeVisitors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate limit: prevents abuse if Redis is reachable
  try {
    const { success } = await apiRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  } catch {
    // If Redis is not configured or fails, gracefully proceed
  }

  const body = (await request.json().catch(() => ({}))) as {
    articleId?: string;
    sessionId?: string;
  };
  const { articleId, sessionId } = body;

  if (!articleId || typeof articleId !== "string" || articleId.length > 36) {
    return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });
  }

  const hashedIp = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const effectiveSessionId =
    sessionId && typeof sessionId === "string" && sessionId.length <= 64
      ? sessionId
      : `anon-${hashedIp}`;

  try {
    // 1. Increment authentic view count directly in Postgres articles table
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, articleId));

    // 2. Upsert view count in articleViewAggregates table
    await db
      .insert(articleViewAggregates)
      .values({
        articleId,
        totalViews: 1,
        last24h: 1,
        last7d: 1,
        last30d: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: articleViewAggregates.articleId,
        set: {
          totalViews: sql`${articleViewAggregates.totalViews} + 1`,
          last24h: sql`${articleViewAggregates.last24h} + 1`,
          last7d: sql`${articleViewAggregates.last7d} + 1`,
          last30d: sql`${articleViewAggregates.last30d} + 1`,
          updatedAt: new Date(),
        },
      });

    // 3. Register real-time active reader presence for this specific article
    await db
      .insert(activeVisitors)
      .values({
        sessionId: effectiveSessionId,
        articleId,
        pathname: `/news/${articleId}`,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: activeVisitors.sessionId,
        set: {
          articleId,
          pathname: `/news/${articleId}`,
          lastSeenAt: new Date(),
        },
      });

    // 4. Safely buffer in Redis if available
    try {
      await incrementArticleView(articleId);
    } catch {
      // Redis buffer failure does not impede authentic DB write
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View increment error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
