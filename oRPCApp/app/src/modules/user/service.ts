import {TaskRepository, type UserRepository} from "./repository.ts";
import type {JWTService} from "../../libs/secure/jwt.ts";
import {ORPCError} from "@orpc/client";
import type Redis from "ioredis";
import type {DBTask} from "../../libs/db/schemas/tasks.ts";

// User dto

export interface UserRequestDTO {
    username: string;
    password: string;
}

export interface UserResponseDTO {
    success: boolean;
    user: {
        id: string;
        username: string;
    };
    tokens: {
        access_token: string;
        refresh_token: string;
    };
}

export interface GetUserResponseDTO {
    success: boolean;
    user: {
        id: string;
        username: string;
        createdAt: Date;
    };
}

export interface GenerateAccessTokenResponseDTO {
    access_token: string;
}

// Task dto

export interface CreateTaskRequestDTO {
    user_id: string;
    title: string;
    description: string;
}

export interface CreateTaskResponseDTO {
    success: boolean;
    task: {
        task_id: string;
        user_id: string;
        title: string;
        description: string;
        createdAt: Date;
    };
}

export interface GetAllTasksRequestDTO {
    user_id: string;
}

export interface GetAllTasksResponseDTO {
    success: boolean;
    tasks: DBTask[];
}

export interface DeleteTaskRequestDTO {
    task_id: string;
}

export interface DeleteTaskResponseDTO {
    success: boolean;
}

export class UserService {
    constructor(
        private repo: UserRepository,
        private jwt: JWTService,
        private redis: Redis,
    ) {}

    async register(input: UserRequestDTO): Promise<UserResponseDTO> {
        const userID = crypto.randomUUID().toString();
        const hashPassword = (await Bun.password.hash(input.password)).toString();

        const created = await this.repo.Create({
            id: userID,
            username: input.username,
            password: hashPassword,
        });

        const access = await this.jwt.signAccessToken({ sub: created.id });
        const refresh = crypto.randomUUID().toString();

        await this.redis.hset(`session:${refresh}`, { userID: created.id });
        await this.redis.expire(`session:${refresh}`, 60 * 60 * 24 * 30);

        return {
            success: true,
            user: {
                id: created.id,
                username: created.username
            },
            tokens: {
                access_token: access,
                refresh_token: refresh,
            },
        };
    };

    async getUserById(token: string): Promise<GetUserResponseDTO> {
        const payload = await this.jwt.verifyAccessToken(token);

        const result = await this.repo.FindById(payload.sub);
        if (!result) {
            throw new ORPCError("NOT_FOUND");
        }
        return {
            success: true,
            user: {
                id: result.id,
                username: result.username,
                createdAt: result.createdAt,
            },
        };
    }

    async getUserByIdDirect(id: string): Promise<GetUserResponseDTO> {
        const result = await this.repo.FindById(id);
        if (!result) {
            throw new ORPCError("NOT_FOUND");
        }
        return {
            success: true,
            user: {
                id: result.id,
                username: result.username,
                createdAt: result.createdAt,
            },
        };
    }

    async generateAccessToken(id: string): Promise<GenerateAccessTokenResponseDTO> {
        const access = await this.jwt.signAccessToken({ sub: id });
        return { access_token: access };
    }
}

export class TaskService {
    constructor(
        private repo: TaskRepository,
    ) {}

    async create(input: CreateTaskRequestDTO): Promise<CreateTaskResponseDTO> {
        const taskID = crypto.randomUUID().toString();

        const created = await this.repo.Create({
            task_id: taskID,
            user_id: input.user_id,
            title: input.title,
            description: input.description,
        });

        return {
            success: true,
            task: {
                task_id: created.task_id,
                user_id: created.user_id,
                title: created.title,
                description: created.description,
                createdAt: created.createdAt,
            },
        };
    }

    async getAllTasks(input: GetAllTasksRequestDTO): Promise<GetAllTasksResponseDTO> {
        const result = await this.repo.GetAllTasks(input.user_id);
        return {
            success: true,
            tasks: result,
        };
    }

    async deleteTask(input: DeleteTaskRequestDTO): Promise<DeleteTaskResponseDTO> {
        await this.repo.DeleteTask(input.task_id);
        return { success: true };
    }
}