import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiRatelimit } from "@/lib/redis";
import { db } from "@/db";
import { activeVisitors } from "@/db/schema";
import crypto from "crypto";
import { enforceRateLimit, getRequestIp } from "@/lib/request-security";
import { isValidArticleId, recordArticleView } from "@/lib/view-counter";

export const dynamic = "force-dynamic";
const viewInput = z.object({
  articleId: z.string().refine(isValidArticleId),
  sessionId: z.string().min(1).max(64).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = viewInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid view request" }, { status: 400 });
  }
  const rejection = await enforceRateLimit(apiRatelimit, request.headers, "views");
  if (rejection) return rejection;
  const { articleId, sessionId } = parsed.data;
  try {
    if (!await recordArticleView(articleId)) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 503 });
  }
  const hashedIp = crypto.createHash("sha256").update(getRequestIp(request.headers)).digest("hex").slice(0, 16);
  try {
    // Presence is best-effort; its failure must not prompt retrying a counted view.
    await db.insert(activeVisitors).values({ sessionId: sessionId ?? `anon-${hashedIp}`, articleId, lastSeenAt: new Date() })
      .onConflictDoUpdate({ target: activeVisitors.sessionId, set: { articleId, lastSeenAt: new Date() } });
  } catch {
    console.warn("Visitor presence update failed");
  }
  return NextResponse.json({ success: true });
}
