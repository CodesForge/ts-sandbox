import Elysia, { t } from "elysia";
import { ContainerPlugin } from "./plugins";
import { config } from "#/config";
import { requestInfoPlugin } from "#/libs/plugins";
import { authGuardPlugin } from "#/libs/plugins/auth-guard";

function setAuthCookies(access_token: any, refresh_token: any, access: string, refresh: string) {
    access_token?.set({
        value: access,
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        path: "/",
        maxAge: 15 * 60,
    });

    refresh_token?.set({
        value: refresh,
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
    });
}

function userResponse(user: { id: string; name: string; email: string; createdAt: Date }) {
    return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
    };
}

export const AuthController = new Elysia({ prefix: "/auth" })
    .use(ContainerPlugin)
    .use(requestInfoPlugin)
    .post("/register", async ({ authService, body, cookie: { access_token, refresh_token }, userAgent, ip }) => {
        const result = await authService.register({
            name: body.name,
            email: body.email,
            passwordHash: body.password,
        }, ip, userAgent);

        setAuthCookies(access_token, refresh_token, result.accessToken, result.refreshToken);

        return {
            success: true,
            user: userResponse(result.user),
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 3, maxLength: 20 }),
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 8, maxLength: 255 }),
        })
    })
    .post("/login", async ({ authService, body, cookie: { access_token, refresh_token }, userAgent, ip }) => {
        const result = await authService.login(body.email, body.password, ip, userAgent);

        setAuthCookies(access_token, refresh_token, result.accessToken, result.refreshToken);

        return {
            success: true,
            user: userResponse(result.user),
        }
    }, {
        body: t.Object({
            email: t.String({ format: "email" }),
            password: t.String({ minLength: 8, maxLength: 255 }),
        })
    })
    .group("", (app) => app
        .use(authGuardPlugin)
        .get("/me", async ({ authService, UserID }) => {
            const user = await authService.getMe(UserID as string);
            return {
                success: true,
                user: userResponse(user!),
            }
        })
        .get("/sessions", async ({ authService, UserID }) => {
            const [result] = await authService.getUserSessions(UserID as string);
            return {
                success: true,
                sessions: result
            };
        })
        .post("/logout", async (ctx) => {
            const refresh = ctx.cookie.refresh_token?.value;
            if (refresh) {
                await ctx.authService.logout(ctx.UserID as string, refresh as string);
            }
            ctx.cookie.access_token?.remove();
            ctx.cookie.refresh_token?.remove();
            return { success: true };
        })
    )
