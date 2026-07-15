import { defineConfig } from "drizzle-kit";
import {config} from "../config/config.ts";

export default defineConfig({
    out: "./src/libs/db/migrations",
    schema: "./src/libs/db/schemas/*.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: config.DATABASE_URL,
    },
    strict: true,
    verbose: true,
});