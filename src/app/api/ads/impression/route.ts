import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { advertisements } from "@/db/schema/advertisements";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
  }

  try {
    await db
      .update(advertisements)
      .set({
        impressions: sql`${advertisements.impressions} + 1`,
      })
      .where(eq(advertisements.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad impression tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
