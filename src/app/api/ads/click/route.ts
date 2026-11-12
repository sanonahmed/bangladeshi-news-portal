import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { advertisements } from "@/db/schema/advertisements";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const [ad] = await db
      .select({ id: advertisements.id, destinationUrl: advertisements.destinationUrl })
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);

    if (ad) {
      // Increment clicks asynchronously
      await db
        .update(advertisements)
        .set({
          clicks: sql`${advertisements.clicks} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(advertisements.id, id));

      if (ad.destinationUrl) {
        try {
          const dest = new URL(ad.destinationUrl, request.url);
          if (dest.protocol === "http:" || dest.protocol === "https:") {
            return NextResponse.redirect(dest.toString());
          }
        } catch {
          // In case destination URL is malformed
        }
      }
    }
  } catch (error) {
    console.error("Ad click tracking error:", error);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
