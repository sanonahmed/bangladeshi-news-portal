import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      banned: currentUser.user.banned ?? false,
    },
  });
}
