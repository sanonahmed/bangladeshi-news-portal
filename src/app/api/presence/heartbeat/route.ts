import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activeVisitors } from "@/db/schema/engagement";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: string;
      pathname?: string;
      articleId?: string;
    };

    const sessionId =
      body.sessionId && typeof body.sessionId === "string" && body.sessionId.length <= 64
        ? body.sessionId
        : `anon-${request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"}`;

    const pathname =
      typeof body.pathname === "string" ? body.pathname.slice(0, 200) : "/";
    const articleId =
      typeof body.articleId === "string" && body.articleId.length <= 36
        ? body.articleId
        : null;

    // Upsert active visitor record in Postgres
    await db
      .insert(activeVisitors)
      .values({
        sessionId,
        articleId,
        pathname,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: activeVisitors.sessionId,
        set: {
          articleId,
          pathname,
          lastSeenAt: new Date(),
        },
      });

    // Probabilistic cleanup of stale records older than 10 minutes (1 in 10 requests)
    if (Math.random() < 0.1) {
      await db.execute(
        sql`DELETE FROM active_visitors WHERE last_seen_at < NOW() - INTERVAL '10 minutes';`
      );
    }

    // Return the current active readers count (within last 2 minutes)
    const activeResult = await db.execute(
      sql`SELECT count(*)::int AS count FROM active_visitors WHERE last_seen_at >= NOW() - INTERVAL '2 minutes';`
    );
    const activeReaders = Number(activeResult.rows[0]?.count || 0);

    return NextResponse.json({
      success: true,
      activeReaders,
    });
  } catch (error) {
    console.error("Presence heartbeat error:", error);
    return NextResponse.json({ success: false, activeReaders: 0 }, { status: 500 });
  }
}
