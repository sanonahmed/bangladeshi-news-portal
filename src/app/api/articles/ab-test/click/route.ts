import { NextRequest, NextResponse } from "next/server";
import { recordAbTestClick } from "@/actions/articles";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { articleId?: string; variant?: "a" | "b" };
    const { articleId, variant } = body;

    if (!articleId || (variant !== "a" && variant !== "b")) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await recordAbTestClick(articleId, variant);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
