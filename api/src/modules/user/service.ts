import type { DBUser, NewDBUser } from "#/libs/db/schemas";
import type { RedisClient } from "bun";
import type { UserRepository } from "./repository";
import type { TokenService } from "#/libs/secure";
import { UserAlreadyExists, InvalidCredentials } from "#/libs/errors";

export interface AuthServiceResultDTO {
    user: DBUser;
    accessToken: string;
    refreshToken: string;
};

export interface GetUserSessionsDTO {
    refreshToken: string;
    ip: string;
    userAgent: string;
    createdAt: string;
};

export class AuthService {
    constructor(
        private repo: UserRepository,
        private redis: RedisClient,
        private jwt: TokenService,
    ) {}

    async register(user: NewDBUser, ip: string, userAgent: string): Promise<AuthServiceResultDTO> {
        const existing = await this.repo.findByEmail(user.email);
        if (existing) {
            throw new UserAlreadyExists();
        }

        const hashPassword = await Bun.password.hash(user.passwordHash);

        const result = await this.repo.create({
            name: user.name,
            email: user.email,
            passwordHash: hashPassword,
        });

        const access = (await this.jwt.signAccess(result.id)).toString();
        const refresh = crypto.randomUUID();

        await this.redis.hset(`session:${refresh}`, {
            userid: result.id,
            ip: ip,
            userAgent: userAgent,
            createdAt: new Date().toISOString(),
        });
        await this.redis.expire(`session:${refresh}`, 60 * 60 * 24 * 30);
        await this.redis.sadd(`user:sessions:${result.id}`, refresh);

        return {
            user: result,
            accessToken: access,
            refreshToken: refresh,
        };
    }

    async login(email: string, password: string, ip: string, userAgent: string): Promise<AuthServiceResultDTO> {
        const user = await this.repo.findByEmail(email);
        if (!user) {
            throw new InvalidCredentials();
        }

        const valid = await Bun.password.verify(password, user.passwordHash);
        if (!valid) {
            throw new InvalidCredentials();
        }

        const access = (await this.jwt.signAccess(user.id)).toString();
        const refresh = crypto.randomUUID();

        await this.redis.hset(`session:${refresh}`, {
            userid: user.id,
            ip: ip,
            userAgent: userAgent,
            createdAt: new Date().toISOString(),
        });
        await this.redis.expire(`session:${refresh}`, 60 * 60 * 24 * 30);
        await this.redis.sadd(`user:sessions:${user.id}`, refresh);

        return {
            user: user,
            accessToken: access,
            refreshToken: refresh,
        };
    }

    async getMe(userId: string): Promise<DBUser | null> {
        return this.repo.findById(userId);
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        await this.redis.del(`session:${refreshToken}`);
        await this.redis.srem(`user:sessions:${userId}`, refreshToken);
    }

    async getUserSessions(userId: string): Promise<GetUserSessionsDTO[]> {
        const tokens = await this.redis.smembers(`user:sessions:${userId}`);
        const sessions = [];

        for (const token of tokens) {
            const data = await this.redis.hgetall(`session:${token}`);
            if (data && Object.keys(data).length > 0) {
                sessions.push({
                    refreshToken: token,
                    userId: data.userid ?? "",
                    ip: data.ip ?? "",
                    userAgent: data.userAgent ?? "",
                    createdAt: data.createdAt ?? "",
                });
            }
        }

        return sessions;
    } 
}

// UserService 

import { ORPCError } from "@orpc/client";
import type { DBUser } from "../../libs/db/schemas";
import type { UserRepository } from "./repository";
import type { JWTService } from "../../libs/secure/jwt";

export interface UserResponseDTO {
    success: boolean;
    user: DBUser;
    tokens: {
        access_token: string;
        refresh_token: string;
    };
};

export interface UserRequestDTO {
    name: string;
    email: string;
    password: string;
};

export class UserService {
    constructor(
        private repo: UserRepository,
        private jwt: JWTService
    ) {}

    async register(user: UserRequestDTO): Promise<UserResponseDTO> {
        const exists = await this.repo.findByEmail(user.email)
        if (exists) {
            throw new ORPCError("CONFLICT", {
                message: "User already exists",
            });
        };
        
        const userID = crypto.randomUUID().toString();
        const PasswordHash = await Bun.password.hash(user.password);

        const created = await this.repo.create({
            id: userID,
            name: user.name,
            email: user.email,
            passwordHash: PasswordHash,
        });

        const access = await this.jwt.sign({ sub: created.id });
        const refresh = crypto.randomUUID().toString();

        return {
            success: true,
            user: created,
            tokens: {
                access_token: access,
                refresh_token: refresh,
            },
        };
    }
};