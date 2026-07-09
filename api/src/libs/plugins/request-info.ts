import Elysia from "elysia";

export const requestInfoPlugin = new Elysia({ name: "request-info" })
    .derive({ as: "global" }, ({ request, server }) => ({
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || server?.requestIP(request)?.address
            || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
    }));