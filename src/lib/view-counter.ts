import { db } from "@/db";
import { sql } from "drizzle-orm";

export function isValidArticleId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,36}$/.test(value);
}

/** One SQL statement atomically updates both lifetime counters. No Redis replay. */
export async function recordArticleView(articleId: string): Promise<boolean> {
  if (!isValidArticleId(articleId)) throw new Error("Invalid article ID");
  const result = await db.execute(sql`
    WITH viewed AS (
      UPDATE articles SET view_count = view_count + 1
      WHERE id = ${articleId} AND status = 'published'
      RETURNING id, view_count
    )
    INSERT INTO article_view_aggregates (article_id, total_views, updated_at)
    SELECT id, view_count, NOW() FROM viewed
    ON CONFLICT (article_id) DO UPDATE
      SET total_views = EXCLUDED.total_views, updated_at = EXCLUDED.updated_at
    RETURNING article_id
  `);
  return result.rows.length > 0;
}
