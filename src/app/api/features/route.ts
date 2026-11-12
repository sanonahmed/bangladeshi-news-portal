import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/actions/features";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flags = await getFeatureFlags();
    return NextResponse.json(flags, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API /api/features error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
