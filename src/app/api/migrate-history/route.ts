import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { HISTORICAL_EVENTS_SEED, LIBERATION_SECTORS, SEVEN_BIR_SRESHTHO } from "@/types/history";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET || "bootstrap_secret_bangladesh_barta_2026";

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(connectionString);

    // 1. Create historical_events table
    await sql`
      CREATE TABLE IF NOT EXISTS historical_events (
        id TEXT PRIMARY KEY,
        day INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'জাতীয়',
        description TEXT NOT NULL,
        significance TEXT,
        image_url TEXT,
        image_caption TEXT,
        is_1971_related BOOLEAN NOT NULL DEFAULT false,
        tags JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS hist_events_day_month_idx ON historical_events(day, month);`;
    await sql`CREATE INDEX IF NOT EXISTS hist_events_year_idx ON historical_events(year);`;
    await sql`CREATE INDEX IF NOT EXISTS hist_events_1971_idx ON historical_events(is_1971_related);`;

    // 2. Create liberation_war_sectors table
    await sql`
      CREATE TABLE IF NOT EXISTS liberation_war_sectors (
        id TEXT PRIMARY KEY,
        sector_number INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        commanders TEXT NOT NULL,
        headquarters TEXT NOT NULL,
        area TEXT NOT NULL,
        key_operations TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS sectors_number_idx ON liberation_war_sectors(sector_number);`;

    // 3. Create bir_sreshtho_heroes table
    await sql`
      CREATE TABLE IF NOT EXISTS bir_sreshtho_heroes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rank TEXT NOT NULL,
        sector TEXT NOT NULL,
        martyrdom_date TEXT NOT NULL,
        martyrdom_place TEXT NOT NULL,
        heroic_deed TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    // 4. Seed historical events
    for (const h of HISTORICAL_EVENTS_SEED) {
      const exists = await sql`SELECT id FROM historical_events WHERE id = ${h.id} LIMIT 1;`;
      if (exists.length === 0) {
        await sql`
          INSERT INTO historical_events (
            id, day, month, year, title, category, description, significance,
            image_url, image_caption, is_1971_related, tags, created_at
          ) VALUES (
            ${h.id}, ${h.day}, ${h.month}, ${h.year}, ${h.title}, ${h.category},
            ${h.description}, ${h.significance}, ${h.imageUrl}, ${h.imageCaption},
            ${h.is1971Related}, ${JSON.stringify(h.tags)}::jsonb, NOW()
          );
        `;
      }
    }

    // 5. Seed 11 sectors
    for (const s of LIBERATION_SECTORS) {
      const sId = `sector-${s.sectorNumber}`;
      const exists = await sql`SELECT id FROM liberation_war_sectors WHERE sector_number = ${s.sectorNumber} LIMIT 1;`;
      if (exists.length === 0) {
        await sql`
          INSERT INTO liberation_war_sectors (
            id, sector_number, title, commanders, headquarters, area, key_operations, created_at
          ) VALUES (
            ${sId}, ${s.sectorNumber}, ${s.title}, ${s.commanders}, ${s.headquarters},
            ${s.area}, ${s.keyOperations}, NOW()
          );
        `;
      }
    }

    // 6. Seed 7 Bir Sreshtho
    for (const b of SEVEN_BIR_SRESHTHO) {
      const exists = await sql`SELECT id FROM bir_sreshtho_heroes WHERE id = ${b.id} LIMIT 1;`;
      if (exists.length === 0) {
        await sql`
          INSERT INTO bir_sreshtho_heroes (
            id, name, rank, sector, martyrdom_date, martyrdom_place, heroic_deed, image_url, created_at
          ) VALUES (
            ${b.id}, ${b.name}, ${b.rank}, ${b.sector}, ${b.martyrdomDate},
            ${b.martyrdomPlace}, ${b.heroicDeed}, ${b.imageUrl}, NOW()
          );
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "History and 1971 Liberation War archive tables migrated and seeded successfully on Neon DB!",
    });
  } catch (error: any) {
    console.error("History migration endpoint error:", error);
    return NextResponse.json(
      { error: error?.message || "Migration failed" },
      { status: 500 }
    );
  }
}
