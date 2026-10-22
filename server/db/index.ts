import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const pool = hasDatabaseUrl
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

let dbInstance: any = null;
let initDbFn: () => Promise<void>;

if (pool) {
  dbInstance = drizzle(pool, { schema });
  const { initCloudDatabase } = await import("./cloudDb");
  initDbFn = () => initCloudDatabase(pool);
} else {
  // Only import PGlite in local offline dev environment
  const { pgliteDb, initDatabase: initLocalDb } = await import("./initDb");
  dbInstance = pgliteDb;
  initDbFn = initLocalDb;
}

export const db = dbInstance;
export const initDatabase = initDbFn;
