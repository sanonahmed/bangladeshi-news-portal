const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_5UR2YsILmoSE@ep-proud-mountain-b3kkn4fs-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('Migrating articles table for SEO and Headline A/B Testing...');
  
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS focus_keyword text;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS headline_b text;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_status text NOT NULL DEFAULT 'none';`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_started_at timestamp with time zone;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_duration_minutes integer DEFAULT 30;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_impressions_a integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_impressions_b integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_clicks_a integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS ab_test_clicks_b integer NOT NULL DEFAULT 0;`;

  console.log('Migration successful! Verifying updated columns...');
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'articles'`;
  console.log('Columns:', cols.map(c => c.column_name).join(', '));
}

main().catch(console.error);
