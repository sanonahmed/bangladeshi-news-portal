import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://mock_user:mock_pass@mock_host.neon.tech/mock_db?sslmode=require";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export type DB = typeof db;
