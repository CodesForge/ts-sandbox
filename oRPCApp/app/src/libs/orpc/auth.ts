import type {JWTService} from "../secure/jwt.ts";
import type Redis from "ioredis";
import {getCookie, setCookie} from "@orpc/server/helpers";
import {config} from "../config/config.ts";
import {ORPCError} from "@orpc/client";

export interface AuthResult {
    userID: string;
}

export async function resolveAuth(
    reqHeaders: Headers | undefined,
    resHeaders: Headers | undefined,
    jwt: JWTService,
    redis: Redis,
): Promise<AuthResult> {
    const access_token = getCookie(reqHeaders, "access_token");

    if (access_token) {
        try {
            const payload = await jwt.verifyAccessToken(access_token);
            return { userID: payload.sub };
        } catch {
        }
    }

    const refresh_token = getCookie(reqHeaders, "refresh_token");
    if (refresh_token) {
        const session = await redis.hgetall(`session:${refresh_token}`);

        if (session.userID) {
            const access = await jwt.signAccessToken({ sub: session.userID });

            if (resHeaders) {
                setCookie(resHeaders, "access_token", access, {
                    httpOnly: true,
                    maxAge: 3600,
                    secure: config.NODE_ENV === "production",
                    path: "/",
                    sameSite: "lax",
                });
            }

            return { userID: session.userID };
        }
    }

    throw new ORPCError("UNAUTHORIZED");
}