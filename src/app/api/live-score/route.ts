import { NextResponse } from "next/server";
import { getLiveSportsMatches } from "@/lib/sports-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await getLiveSportsMatches();
    return NextResponse.json(matches, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch live scores" },
      { status: 500 }
    );
  }
}
