import { NextResponse } from "next/server";
import { getTrendingArticlesWithVelocity } from "@/actions/articles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTrendingArticlesWithVelocity();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Realtime analytics route error:", error);
    return NextResponse.json(
      {
        activeReaders: 0,
        trafficVelocityRating: "steady",
        trafficMultiplier: 1.0,
        todayTotalViews: 0,
        todayPublishedCount: 0,
        trendingStories: [],
      },
      { status: 500 }
    );
  }
}
