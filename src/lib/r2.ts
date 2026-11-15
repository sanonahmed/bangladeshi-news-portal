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
import path from "path";

// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Media storage is not configured: ${name} is required.`);
  return value;
}

// Read configuration on use so build-time collection never supplies fake credentials.
export function getR2Configuration() {
  const bucket = requiredEnv("R2_BUCKET_NAME");
  const publicUrl = new URL(requiredEnv("R2_PUBLIC_URL"));
  if (publicUrl.protocol !== "https:" || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash) {
    throw new Error("R2_PUBLIC_URL must use HTTPS and contain no credentials, query, or fragment.");
  }
  return {
    accountId: requiredEnv("R2_ACCOUNT_ID"),
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    bucket,
    publicUrl: publicUrl.href.replace(/\/$/, ""),
    publicHostname: publicUrl.hostname,
  };
}

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

const EXTENSIONS: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function isAllowedMimeType(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

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
 * Validates the filename against its image MIME type and returns a canonical extension.
 */
function safeExtension(filename: string, mimeType: AllowedMimeType): string {
  if (filename.includes("/") || filename.includes("\\")) {
    throw new Error("Only a filename, not a path, is allowed.");
  }
  const ext = path.extname(filename).slice(1).toLowerCase();
  const allowedExtensions: Record<AllowedMimeType, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
    "image/avif": ["avif"],
  };
  if (!allowedExtensions[mimeType].includes(ext)) {
    throw new Error("The filename extension does not match its image MIME type.");
  }
  return EXTENSIONS[mimeType];
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
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`Unsupported image MIME type: ${mimeType}`);
  }

  const ext = safeExtension(filename, mimeType);
  const r2Key = `${folder}/${randomUUID()}.${ext}`;

  const config = getR2Configuration();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: r2Key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGNED_EXPIRES_IN,
  });

  const publicUrl = `${config.publicUrl}/${r2Key}`;

  return { uploadUrl, r2Key, publicUrl, expiresIn: PRESIGNED_EXPIRES_IN };
}

/**
 * Deletes an object from R2 by its key.
 * Resolves silently even if the object does not exist.
 */
export async function deleteR2Object(r2Key: string): Promise<void> {
  const config = getR2Configuration();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: r2Key,
  });
  await client.send(command);
}

/**
 * Returns the publicly accessible URL for a stored R2 key.
 */
export function getPublicUrl(r2Key: string): string {
  return `${getR2Configuration().publicUrl}/${r2Key}`;
}

/**
 * Returns true if the object exists in R2 (performs a HEAD request).
 * Returns false for any error (including 404 / 403).
 */
export async function r2ObjectExists(r2Key: string): Promise<boolean> {
  try {
    const config = getR2Configuration();
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: r2Key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/** Builds an opaque R2 key. Browser uploads must use createPresignedUpload instead. */
export function buildR2Key(
  folder: "articles" | "avatars" | "uploads" | "thumbnails",
): string {
  return `${folder}/${randomUUID()}`;
}
