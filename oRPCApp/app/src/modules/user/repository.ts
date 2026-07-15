import {NodePgDatabase} from "drizzle-orm/node-postgres";
import type {DBSchema} from "../../libs/db/config.ts";
import {type DBUser, type NewDBUser, users} from "../../libs/db/schemas/users.ts";
import {eq} from "drizzle-orm";
import {type DBTask, type NewDBTask, tasks} from "../../libs/db/schemas/tasks.ts";

export class UserRepository {
    constructor(private db: NodePgDatabase<DBSchema>) {}

    async Create(user: NewDBUser): Promise<DBUser> {
        const [created] = await this.db.insert(users).values(user).returning();
        return created!;
    }

    async GetAll(offset?: number, limit?: number): Promise<DBUser[] | null> {
        const result = await this.db
            .select()
            .from(users)
            .offset(offset || 0)
            .limit(limit || 10);
        return result ?? null;
    }

    async FindByUsername(username: string): Promise<DBUser | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
        return user ?? null;
    }

    async FindById(id: string): Promise<DBUser | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return user ?? null;
    }
}

export class TaskRepository {
    constructor(private db: NodePgDatabase<DBSchema>) {}

    async Create(task: NewDBTask): Promise<DBTask> {
        const [created] = await this.db.insert(tasks).values(task).returning();
        return created!;
    }

    async GetAllTasks(id: string): Promise<DBTask[]> {
        const result = await this.db
            .select()
            .from(tasks)
            .where(eq(tasks.user_id, id));
        return result;
    }

    async DeleteTask(task_id: string): Promise<void> {
        await this.db
            .delete(tasks)
            .where(eq(tasks.task_id, task_id));
    }
}