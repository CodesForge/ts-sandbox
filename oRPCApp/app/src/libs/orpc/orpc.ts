import { os } from "@orpc/server";
import type {AppContext} from "./context.ts";
import {jwt, taskService, userService} from "../../modules/user";
import {redis} from "../cache/redis.ts";
import {getCookie} from "@orpc/server/helpers";
import {ORPCError} from "@orpc/client";
import {resolveAuth} from "./auth.ts";

export const orpc = os.$context<AppContext>();

export const withUserService = orpc.middleware(async ({ context, next }) => {
    return next({
        context: {...context, userService},
    });
});

export const withRedis = orpc.middleware(async ({ context, next }) => {
    return next({
        context: {...context, redis},
    });
});

export const withTaskService = orpc.middleware(async ({ context, next }) => {
    return next({
        context: {...context, taskService},
    });
});

export const withAuth = orpc.middleware(async ({ context, next }) => {
    const { userID } = await resolveAuth(
        context.reqHeaders, context.resHeaders, jwt, redis
    );

    return next({
        context: {...context, userID}
    });
});