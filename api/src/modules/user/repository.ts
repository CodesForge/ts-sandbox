import type { DBSchema } from "#/libs/db";
import { users, type DBUser, type NewDBUser } from "#/libs/db/schemas";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class UserRepository {
    constructor(private db: NodePgDatabase<DBSchema>) {}

    async create(user: NewDBUser): Promise<DBUser> {
        const [created] = await this.db.insert(users).values(user).returning();
        return created!;
    }

    async findByEmail(email: string): Promise<DBUser | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user ?? null;
    }

    async findById(id: string): Promise<DBUser | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user ?? null;
    }
}