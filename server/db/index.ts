import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { pgliteDb, initDatabase } from "./initDb";

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db: any = pool
  ? drizzle(pool, { schema })
  : pgliteDb;

export { initDatabase };
