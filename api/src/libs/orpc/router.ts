import { os } from "@orpc/server";
import z from "zod";
import { withUserService } from "./orpc";
import { setCookie } from "@orpc/server/helpers"
import type { AppContext } from "./context";
import type { UserResponseDTO } from "../modules/user/service";

const publicProcudure = os.use(withUserService);

const SetCookies = (context: AppContext, created: UserResponseDTO) => {
    setCookie(context.resHeaders, "access_token", created.tokens.access_token, {
        secure: false,
        maxAge: 3600,
        httpOnly: true,
        path: "/",
    });
    setCookie(context.resHeaders, "refresh_token", created.tokens.refresh_token, {
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        path: "/",
    });
}

export const appRouter = {
    hello: publicProcudure
        .input(z.object({ name: z.string() }))
        .handler(async ({ input }) => {
            return { message: `Привет, ${input.name}!` }
        }),
    add: publicProcudure
        .input(z.object({ a: z.number(), b: z.number() }))
        .handler(async ({ input }) => {
            return input.a + input.b
        }),
    register: publicProcudure
        .input(z.object({ username: z.string(), password: z.string() }))
        .handler(async ({ input, context }) => {
            const created = await context.userService.register({
                username: input.username,
                password: input.password,
            });
            SetCookies(context, created)
        }),
};

export type AppRouter = typeof appRouter;
