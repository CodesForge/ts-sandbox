import {RPCHandler} from "@orpc/server/fetch";
import {appRouter} from "../libs/orpc/routers.ts";
import Elysia from "elysia";
import cors from "@elysiajs/cors";
import {config} from "../libs/config/config.ts";
import {RequestHeadersPlugin, ResponseHeadersPlugin} from "@orpc/server/plugins";

const handler = new RPCHandler(appRouter, {
    plugins: [
        new ResponseHeadersPlugin(),
        new RequestHeadersPlugin(),
    ],
});

const app = new Elysia()
    .use(
        cors({
            origin: config.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }),
    )
    .all("/rpc*", async ({ request }) => {
        const { response } = await handler.handle(request, { prefix: "/rpc" });
        return response ?? new Response("Not found", { status: 404 });
    }, {
        parse: "none",
    })
    .listen({
        port: config.SERVER_PORT,
        hostname: config.SERVER_HOSTNAME,
    }, () => {
        console.log("✅ oRPC Elysia app successfully started!")
    })