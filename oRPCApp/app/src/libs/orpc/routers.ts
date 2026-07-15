import { z } from "zod";
import {orpc, withAuth, withRedis, withTaskService, withUserService} from "./orpc.ts";
import {getCookie, setCookie} from "@orpc/server/helpers";
import {config} from "../config/config.ts";
import {ORPCError} from "@orpc/client";

export const appRouter = {
    register: orpc
        .use(withUserService)
        .input(z.object({ username: z.string(), password: z.string() }))
        .handler(async ({ input, context }) => {
            const created = await context.userService.register({
                username: input.username,
                password: input.password
            });

            setCookie(context.resHeaders, "access_token", created.tokens.access_token, {
                httpOnly: true,
                maxAge: 3600,
                secure: config.NODE_ENV === "production",
                path: "/",
                sameSite: "lax",
            });

            setCookie(context.resHeaders, "refresh_token", created.tokens.refresh_token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                secure: config.NODE_ENV === "production",
                path: "/",
                sameSite: "lax",
            });

            return created;
        }),
    me: orpc
        .use(withUserService)
        .use(withRedis)
        .handler(async ({ context }) => {
            const access_token = getCookie(context.reqHeaders, "access_token");

            if (access_token) {
                console.log("Access_token успешно найден!")
                try {
                    return await context.userService.getUserById(access_token);
                } catch {

                }
            }

            console.log("Access_token не найден, пробуем найти refresh_token...")

            const refresh_token = getCookie(context.reqHeaders, "refresh_token");
            if (refresh_token) {
                console.log("Refresh_token успешно найден!")
                const session = await context.redis.hgetall(`session:${refresh_token}`);

                if (!session.userID) {
                    console.log("Сессия пользователя в redis не найдена.")
                    throw new ORPCError("NOT_FOUND");
                }

                const access = await context.userService.generateAccessToken(session.userID);

                setCookie(context.resHeaders, "access_token", access.access_token, {
                    httpOnly: true,
                    maxAge: 3600,
                    secure: config.NODE_ENV === "production",
                    path: "/",
                    sameSite: "lax",
                })

                console.log("Сессия успешно найдена в redis!")
                return await context.userService.getUserByIdDirect(session.userID);
            }

            console.log("Пользователь не авторизованный.")
            throw new ORPCError("UNAUTHORIZED");
        }),
    task: {
        create: orpc
            .use(withAuth)
            .use(withTaskService)
            .input(z.object({
                title: z.string()
                    .min(3).max(30),
                description: z.string()
                    .min(3).max(255),
            }))
            .handler(async ({ context, input }) => {
                return await context.taskService.create({
                    user_id: context.userID,
                    title: input.title,
                    description: input.description,
                });
            }),
        all: orpc
            .use(withAuth)
            .use(withTaskService)
            .handler(async ({ context }) => {
                return await context.taskService.getAllTasks({ user_id: context.userID });
            }),
        delete: orpc
            .use(withAuth)
            .use(withTaskService)
            .input(z.object({ task_id: z.string() }))
            .handler(async ({ context, input }) => {
                return await context.taskService.deleteTask({ task_id: input.task_id });
            }),
    },
};

export type AppRouter = typeof appRouter;