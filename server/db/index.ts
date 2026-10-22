import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

let pool: any = null;
let dbInstance: any = null;
let initDbFn: () => Promise<void>;

if (hasDatabaseUrl) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
  dbInstance = drizzle(pool, { schema });
  const { initCloudDatabase } = await import("./cloudDb");
  initDbFn = () => initCloudDatabase(pool);
} else {
  // Ultra-lightweight in-memory PostgreSQL engine (zero WASM overhead, zero OOM on Render Free tier)
  const { newDb } = await import("pg-mem");
  const { applyIntegrationsToPool } = await import("drizzle-pgmem");
  
  const mem = newDb();
  const { Pool } = mem.adapters.createPg();
  pool = new Pool();
  applyIntegrationsToPool(pool);

  dbInstance = drizzle(pool, { schema });
  const { initCloudDatabase } = await import("./cloudDb");
  initDbFn = () => initCloudDatabase(pool);
}

export const db = dbInstance;
export { pool, initDbFn as initDatabase };
