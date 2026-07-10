import { config } from "#/config";
import { AuthController } from "#/modules/user/controller";
import { AppError } from "#/libs/errors";
import { closeRedis } from "#/libs/cache";
import { closeDb } from "#/libs/db";
import Elysia from "elysia";
import { swagger } from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { RequestHeadersPlugin, ResponseHeadersPlugin } from "@orpc/server/plugins";
import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "../orpc/router";

const version = "1.0.0";

export const app = new Elysia()
    .use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
    .use(
        swagger({
            path: "/docs",
            version,
            documentation: {
                info: {
                    title: "Feed API",
                    description: "RSS feed reader API",
                    version,
                },
                servers: [{ url: `http://localhost:${config.SERVER_PORT}`, description: "Development" }],
            },
        }),
    )
    .onError(({ error, set }) => {
        if (error instanceof AppError) {
            set.status = error.statusCode;
            return { error: error.message };
        }
    })
    .onStop(() => {
        closeRedis();
        closeDb();
    })
    .use(AuthController)
    .listen({
        port: config.SERVER_PORT,
        hostname: config.SERVER_HOSTNAME,
    });

const { hostname, port } = app.server!;
const local = `http://${hostname}:${port}`;

console.log(`\n\x1b[46m\x1b[1m ✦ Feed API v${version} \x1b[0m\x1b[32m started\x1b[0m\n`);
console.log(`  \x1b[36m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   ${local}`);
console.log(`  \x1b[36m➜\x1b[0m  \x1b[1mDocs:\x1b[0m    ${local}/docs`);
console.log(`  \x1b[36m➜\x1b[0m  \x1b[1mEnv:\x1b[0m     \x1b[33m${config.NODE_ENV}\x1b[0m\n`);


// oRPC-app

import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "../orpc/router";
import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { RequestHeadersPlugin, ResponseHeadersPlugin } from "@orpc/server/plugins";

const handler = new RPCHandler(appRouter, {
    plugins: [new RequestHeadersPlugin(), new ResponseHeadersPlugin()],
});

const app = new Elysia()
    .use(
        cors({
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }),
    )
    .all("/rpc*", async ({ request }) => {
        const { response } = await handler.handle(request, { prefix: "/rpc" });
        return response ?? new Response("Not found", { status: 404 });
    })

    .listen(3000, () => {
        console.log("Сервер на http://localhost:3000/rpc");
    });

console.log("✅ oRPC Elysia app successfully started!")
