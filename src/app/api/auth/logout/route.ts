import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { session as sessionsTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const AUTH_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth.dont_remember",
  "__Secure-better-auth.dont_remember",
];

async function purgeSessionAndCookies(reqHeaders: Headers) {
  try {
    const cookieStore = await cookies();

    // 1. Delete session from PostgreSQL
    for (const name of ["better-auth.session_token", "__Secure-better-auth.session_token"]) {
      const c = cookieStore.get(name);
      if (c?.value) {
        const rawToken = c.value.includes(".") ? c.value.split(".")[0] : c.value;
        if (rawToken) {
          try {
            await db
              .delete(sessionsTable)
              .where(eq(sessionsTable.token, rawToken));
          } catch (e) {
            console.error("DB session delete error during logout:", e);
          }
        }
      }
    }

    // 2. Trigger better-auth internal signOut
    try {
      await auth.api.signOut({ headers: reqHeaders });
    } catch {}
  } catch (err) {
    console.error("Logout handler error:", err);
  }
}

export async function POST(request: NextRequest) {
  await purgeSessionAndCookies(request.headers);

  const response = NextResponse.json({
    success: true,
    redirect: "/login",
  });

  // Expire all cookies across all domains and paths
  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  await purgeSessionAndCookies(request.headers);

  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
