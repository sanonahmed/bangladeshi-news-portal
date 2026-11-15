/**
 * Upstash Redis client, rate limiters, and application caches.
 *
 * Required environment variables:
 *   UPSTASH_REDIS_REST_URL   – Upstash Redis REST endpoint
 *   UPSTASH_REDIS_REST_TOKEN – Upstash Redis REST token
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "https://mock-redis.upstash.io";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "mock_token";

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

// ---------------------------------------------------------------------------
// Rate limiters
// ---------------------------------------------------------------------------

// Authentication uses Better Auth's built-in limiter; see auth.ts.

/**
 * General API rate limiter: 100 requests per minute per identifier (IP).
 * Use with apiRatelimit.limit(ip).
 */
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: false,
  prefix: "rl:api",
});

/**
 * Search rate limiter: 30 requests per minute per identifier.
 * Prevents scraping of the search endpoint.
 */
export const searchRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: false,
  prefix: "rl:search",
});

// ---------------------------------------------------------------------------
// Breaking-news cache
// ---------------------------------------------------------------------------

const BREAKING_NEWS_KEY = "cache:breaking_news";
const BREAKING_NEWS_TTL = 300; // 5 minutes

/**
 * Returns cached breaking-news items, or null if the cache has expired.
 */
export async function getCachedBreakingNews(): Promise<unknown[] | null> {
  return redis.get<unknown[]>(BREAKING_NEWS_KEY);
}

/**
 * Stores breaking-news items in Redis with a 5-minute TTL.
 */
export async function setCachedBreakingNews(data: unknown[]): Promise<void> {
  await redis.setex(BREAKING_NEWS_KEY, BREAKING_NEWS_TTL, JSON.stringify(data));
}

/**
 * Immediately invalidates the breaking-news cache.
 * Call after creating, updating, or deleting a breaking-news item.
 */
export async function clearBreakingNewsCache(): Promise<void> {
  await redis.del(BREAKING_NEWS_KEY);
}

// ---------------------------------------------------------------------------
// Generic cache helpers
// ---------------------------------------------------------------------------

/**
 * Gets a cached JSON value by key, or null on miss.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

/**
 * Sets a cached JSON value with an explicit TTL (seconds).
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

/**
 * Deletes one or more cache keys.
 */
export async function deleteCached(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

// ---------------------------------------------------------------------------
// Session / token helpers
// ---------------------------------------------------------------------------

const EMAIL_VERIFY_PREFIX = "email_verify:";
const PASSWORD_RESET_PREFIX = "password_reset:";

/**
 * Stores an email-verification token in Redis (expires after 24 hours).
 */
export async function storeEmailVerificationToken(
  userId: string,
  token: string
): Promise<void> {
  await redis.setex(`${EMAIL_VERIFY_PREFIX}${token}`, 86_400, userId);
}

/**
 * Retrieves and deletes the userId associated with an email-verification token.
 * Returns null if the token is invalid or expired.
 */
export async function consumeEmailVerificationToken(
  token: string
): Promise<string | null> {
  const key = `${EMAIL_VERIFY_PREFIX}${token}`;
  const userId = await redis.get<string>(key);
  if (userId) {
    await redis.del(key);
  }
  return userId ?? null;
}

/**
 * Stores a password-reset token in Redis (expires after 1 hour).
 */
export async function storePasswordResetToken(
  userId: string,
  token: string
): Promise<void> {
  await redis.setex(`${PASSWORD_RESET_PREFIX}${token}`, 3_600, userId);
}

/**
 * Retrieves and deletes the userId associated with a password-reset token.
 * Returns null if the token is invalid or expired.
 */
export async function consumePasswordResetToken(
  token: string
): Promise<string | null> {
  const key = `${PASSWORD_RESET_PREFIX}${token}`;
  const userId = await redis.get<string>(key);
  if (userId) {
    await redis.del(key);
  }
  return userId ?? null;
}
