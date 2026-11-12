import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { createPresignedUpload, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/r2";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  // Auth check
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = currentUser.role;
  if (!hasPermission(role as any, "media:upload")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    filename?: string;
    mimeType?: string;
    fileSize?: number;
  };
  const { filename, mimeType, fileSize } = body;

  if (!filename || !mimeType) {
    return NextResponse.json(
      { error: "filename and mimeType are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  try {
    const result = await createPresignedUpload(filename, mimeType as any, "uploads");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
