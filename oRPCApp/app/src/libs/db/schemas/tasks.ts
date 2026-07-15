import {pgTable, timestamp, varchar} from "drizzle-orm/pg-core";
import {users} from "./users.ts";

export const tasks = pgTable("tasks", {
    task_id: varchar("task_id").primaryKey().notNull(),
    user_id: varchar("user_id").notNull().references(() => users.id, {
        onDelete: "cascade",
    }),
    title: varchar("title", { length: 30 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewDBTask = typeof tasks.$inferInsert;

export type DBTask = typeof  tasks.$inferSelect;