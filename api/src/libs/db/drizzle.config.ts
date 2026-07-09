import { config } from "#/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/libs/db/schemas/*.ts",
    out: "./src/libs/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: config.DATABASE_URL,
    },
    verbose: true,
    strict: true
});