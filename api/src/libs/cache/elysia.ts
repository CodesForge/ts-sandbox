import Elysia from "elysia";
import { getRedis } from "./redis";
import { CacheService } from "./service";

export const redisPlugin = new Elysia({ name: "redis" })
    .decorate({ redis: getRedis() })
    .decorate({ cache: new CacheService(getRedis()) })
    .onStop(() => {
        closeRedis();
    });
