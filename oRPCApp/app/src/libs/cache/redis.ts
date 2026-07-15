import Redis from "ioredis";
import {config} from "../config/config.ts";

export const redis = new Redis(config.REDIS_URL);