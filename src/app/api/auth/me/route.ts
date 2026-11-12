import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { db } from "@/db";
import { authorProfiles } from "@/db/schema/authors";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let avatarUrl: string | null = currentUser.user?.image || null;
  let displayName = currentUser.name;

  try {
    const profile = await db.query.authorProfiles.findFirst({
      where: eq(authorProfiles.userId, currentUser.id),
    });
    if (profile) {
      if (profile.avatarUrl) avatarUrl = profile.avatarUrl;
      if (profile.nameBangla) displayName = profile.nameBangla;
    }
  } catch (err) {
    console.error("Failed to query author profile in /api/auth/me:", err);
  }

  return NextResponse.json({
    user: {
      id: currentUser.id,
      name: displayName,
      email: currentUser.email,
      role: currentUser.role,
      image: avatarUrl,
      banned: currentUser.user?.banned ?? false,
    },
  });
}
