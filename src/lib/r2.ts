/**
 * Cloudflare R2 client, presigned upload URL generation, and object helpers.
 *
 * Required environment variables:
 *   R2_ACCOUNT_ID          – Cloudflare account ID
 *   R2_ACCESS_KEY_ID       – R2 access key
 *   R2_SECRET_ACCESS_KEY   – R2 secret key
 *   R2_BUCKET_NAME         – Bucket name
 *   R2_PUBLIC_URL          – Public base URL (e.g. https://media.example.com)
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID || "mock-account"}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "mock_key",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "mock_secret",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "news-media";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://media.localhost";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Maximum upload size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Presigned URL validity window in seconds (5 minutes). */
const PRESIGNED_EXPIRES_IN = 300;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresignedUploadResult {
  /** PUT URL the browser should upload to directly. */
  uploadUrl: string;
  /** Object key in the R2 bucket. Store this in the DB. */
  r2Key: string;
  /** Publicly accessible URL for the uploaded object. */
  publicUrl: string;
  /** Seconds until the presigned URL expires. */
  expiresIn: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a safe file extension from a filename.
 * Falls back to "bin" for unknown extensions.
 */
function safeExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "bin";
  return (parts.pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a presigned PUT URL that the browser can use to upload a file
 * directly to R2 without routing through the Next.js server.
 *
 * @param filename  Original filename (used only to derive the extension).
 * @param mimeType  MIME type; must be in ALLOWED_MIME_TYPES.
 * @param folder    R2 key prefix / folder (default: "uploads").
 */
export async function createPresignedUpload(
  filename: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<PresignedUploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  const ext = safeExtension(filename);
  const r2Key = `${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_EXPIRES_IN,
  });

  const publicUrl = getPublicUrl(r2Key);

  return { uploadUrl, r2Key, publicUrl, expiresIn: PRESIGNED_EXPIRES_IN };
}

/**
 * Deletes an object from R2 by its key.
 * Resolves silently even if the object does not exist.
 */
export async function deleteR2Object(r2Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
  });
  await r2Client.send(command);
}

/**
 * Returns the publicly accessible URL for a stored R2 key.
 */
export function getPublicUrl(r2Key: string): string {
  return `${PUBLIC_URL}/${r2Key}`;
}

/**
 * Returns true if the object exists in R2 (performs a HEAD request).
 * Returns false for any error (including 404 / 403).
 */
export async function r2ObjectExists(r2Key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a folder-scoped R2 key for a given use-case.
 * Useful for organising uploads by article, thumbnail, avatar, etc.
 */
export function buildR2Key(
  folder: "articles" | "avatars" | "uploads" | "thumbnails",
  filename: string
): string {
  const ext = safeExtension(filename);
  return `${folder}/${randomUUID()}.${ext}`;
}
