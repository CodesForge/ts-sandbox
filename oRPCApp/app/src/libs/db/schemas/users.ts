import {pgTable, timestamp, varchar} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(),
    username: varchar("username", { length: 20 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewDBUser = typeof users.$inferInsert;

export type DBUser = typeof users.$inferSelect;