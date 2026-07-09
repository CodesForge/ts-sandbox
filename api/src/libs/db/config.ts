import { config } from "#/config";
import { Pool } from "pg";
import * as UserSchema from "#/libs/db/schemas";
import { drizzle } from "drizzle-orm/node-postgres";

export const pool = new Pool({
    connectionString: config.DATABASE_URL,
    idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT,
    max: config.DB_POOL_MAX,
    connectionTimeoutMillis: config.DB_POOL_CONNECTION_TIMEOUT,
})

const schema = {
    ...UserSchema
}

export const db = drizzle(pool, { schema });

export type DBSchema = typeof schema;

export async function closeDb(): Promise<void> {
    await pool.end();
}