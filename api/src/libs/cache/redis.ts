import { config } from "#/config";
import { RedisClient } from "bun";

let redis: RedisClient | null = null;

export function getRedis(): RedisClient {
    if (!redis) {
        redis = new RedisClient(config.REDIS_URL);
    }
    return redis;
};

export function closeRedis(): void {
    if (redis) {
        redis.close();
        redis = null;
    }
};