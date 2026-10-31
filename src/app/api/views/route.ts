import { NextRequest, NextResponse } from "next/server";
import { incrementArticleView, apiRatelimit } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate limit: prevents abuse
  const { success } = await apiRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as { articleId?: string };
  const { articleId } = body;

  if (!articleId || typeof articleId !== "string" || articleId.length > 36) {
    return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });
  }

  await incrementArticleView(articleId);
  return NextResponse.json({ success: true });
}
