import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-guard";
import { createPresignedUpload, isAllowedMimeType, MAX_FILE_SIZE } from "@/lib/r2";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  // Auth check
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(currentUser.role, "media:upload")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    filename?: unknown;
    mimeType?: unknown;
    fileSize?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Valid JSON is required" }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const fileSize = body.fileSize;

  if (!filename || filename.length > 255 || !isAllowedMimeType(mimeType)) {
    return NextResponse.json(
      { error: "A valid filename and supported image type are required" },
      { status: 400 }
    );
  }

  if (
    typeof fileSize !== "number" ||
    !Number.isInteger(fileSize) ||
    fileSize <= 0 ||
    fileSize > MAX_FILE_SIZE
  ) {
    return NextResponse.json(
      { error: "fileSize must be a positive integer no larger than 10 MB" },
      { status: 400 }
    );
  }

  try {
    const result = await createPresignedUpload(filename, mimeType, "uploads");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
