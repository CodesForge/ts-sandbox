import { config } from "#/config";
import { ContainerPlugin } from "#/modules/user/plugins";
import Elysia from "elysia";

export const authGuardPlugin = new Elysia({ name: "auth-guard" })
    .use(ContainerPlugin)
    .derive({ as: "global" }, async ({ cookie: { access_token, refresh_token }, jwt, redis }) => {
        if (access_token?.value) {
            const payload = await jwt.verify(String(access_token.value));
            if (payload) {
                return { UserID: payload.sub };
            }
        }

        const session = refresh_token?.value;
        if (!session) {
            return { UserID: null };
        }

        const userID = await redis.hget(`session:${session}`, "userid");
        if (!userID) {
            return { UserID: null };
        }

        const newAccess = await jwt.signAccess(userID);

        access_token?.set({
            value: newAccess,
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            path: "/",
            maxAge: 15 * 60,
        });

        return { UserID: userID };
    })
    .onBeforeHandle({ as: "global" }, ({ UserID, set }) => {
        if (!UserID) {
            set.status = 401;
            return { success: false, message: "Unauthorized" };
        }
    })