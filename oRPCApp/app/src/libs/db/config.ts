import {Pool} from "pg";
import {config} from "../config/config.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import * as UserSchemas from "../db/schemas/users.ts";
import * as TaskSchemas from "../db/schemas/tasks.ts";

export const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
    connectionTimeoutMillis: config.DB_POOL_CONNECTION_TIMEOUT,
    idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT,
});

const schema = {
    ...UserSchemas,
    ...TaskSchemas,
};

export const db = drizzle(pool, { schema });

export type DBSchema = typeof schema;