import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { PgDialect } from "drizzle-orm/pg-core";
import { isValidArticleId, recordArticleView } from "@/lib/view-counter";
import { POST } from "@/app/api/views/route";
import { GET } from "@/app/api/cron/aggregate-views/route";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ execute: vi.fn(), insert: vi.fn(), limit: vi.fn() }));
vi.mock("@/db", () => ({ db: { execute: mocks.execute, insert: mocks.insert } }));
vi.mock("@/lib/redis", () => ({ apiRatelimit: { limit: mocks.limit } }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  mocks.execute.mockResolvedValue({ rows: [{ article_id: "article-1" }] });
  mocks.insert.mockReturnValue({ values: () => ({ onConflictDoUpdate: async () => {} }) });
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it("rejects invalid identifiers before database access", async () => {
  for (const id of [null, {}, "", "../bad", "a".repeat(37)]) expect(isValidArticleId(id)).toBe(false);
  await expect(recordArticleView("../bad")).rejects.toThrow("Invalid article ID");
  expect(mocks.execute).not.toHaveBeenCalled();
});

it("updates both counters with one parameterized statement", async () => {
  expect(await recordArticleView("article-1")).toBe(true);
  expect(mocks.execute).toHaveBeenCalledTimes(1);
  const query = new PgDialect().sqlToQuery(mocks.execute.mock.calls[0]![0]);
  expect(query.sql).toContain("WITH viewed AS");
  expect(query.sql).toContain("status = 'published'");
  expect(query.sql).toContain("ON CONFLICT");
  expect(query.params).toEqual(["article-1"]);
});

it("reports missing or unpublished articles without recording presence", async () => {
  mocks.execute.mockResolvedValue({ rows: [] });
  const response = await POST(new NextRequest("https://example.com/api/views", {
    method: "POST", body: JSON.stringify({ articleId: "article-1" }),
  }));
  expect(response.status).toBe(404);
  expect(mocks.insert).not.toHaveBeenCalled();
});

it("does not report a failed presence write as a failed counted view", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.insert.mockImplementation(() => { throw new Error("presence unavailable"); });
  const response = await POST(new NextRequest("https://example.com/api/views", {
    method: "POST", body: JSON.stringify({ articleId: "article-1" }),
  }));
  expect(response.status).toBe(200);
  expect(mocks.execute).toHaveBeenCalledTimes(1);
});

it("rejects invalid JSON bodies and failed database writes", async () => {
  for (const body of ["null", "{", '{"articleId":1}']) {
    expect((await POST(new NextRequest("https://example.com/api/views", { method: "POST", body }))).status).toBe(400);
  }
  expect(mocks.execute).not.toHaveBeenCalled();
  mocks.execute.mockRejectedValue(new Error("database unavailable"));
  expect((await POST(new NextRequest("https://example.com/api/views", {
    method: "POST", body: '{"articleId":"article-1"}',
  }))).status).toBe(503);
});

it("never replays legacy buffers when old cron schedules fire", async () => {
  vi.stubEnv("CRON_SECRET", "cron-secret");
  expect((await GET(new NextRequest("https://example.com/api/cron/aggregate-views"))).status).toBe(401);
  const result = await GET(new NextRequest("https://example.com/api/cron/aggregate-views", {
    headers: { Authorization: "Bearer cron-secret" },
  }));
  expect(await result.json()).toMatchObject({ retired: true });
  expect(mocks.execute).not.toHaveBeenCalled();
});
