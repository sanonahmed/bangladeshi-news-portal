import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Compatibility endpoint. Legacy Redis views were already counted by requests. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  if (request.headers.get("Authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ retired: true, message: "Views are persisted at request time. Remove this cron job." });
}
