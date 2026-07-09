import Elysia from "elysia";
import { AuthService } from "./service";
import { UserRepository } from "./repository";
import { db } from "#/libs/db";
import { getRedis } from "#/libs/cache";
import { TokenService } from "#/libs/secure";

const tokenService = new TokenService();
const redis = getRedis();
const userRepo = new UserRepository(db);
const authService = new AuthService(
    userRepo, redis, tokenService,
);

export const ContainerPlugin = new Elysia({ name: "container-plugin" })
    .decorate("authService", authService)
    .decorate("jwt", tokenService)
    .decorate("redis", redis);