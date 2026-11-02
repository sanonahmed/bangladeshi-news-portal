import { NextRequest, NextResponse } from "next/server";
import { getDivisionWeatherPrayer, getAllDivisionsWeatherSummary } from "@/actions/weather-prayer";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Live real-time response, no stale caching

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get("division");
  const all = searchParams.get("all");

  try {
    if (all === "true") {
      const summary = await getAllDivisionsWeatherSummary();
      return NextResponse.json({ success: true, data: summary });
    }

    const data = await getDivisionWeatherPrayer(division || "dhaka");
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API /api/weather-prayer error:", error);
    return NextResponse.json(
      { success: false, error: "আবহাওয়া ও নামাজের তথ্য লোড করা যায়নি" },
      { status: 500 }
    );
  }
}
