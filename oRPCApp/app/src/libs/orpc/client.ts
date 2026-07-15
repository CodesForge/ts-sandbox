import {RPCLink} from "@orpc/client/fetch";
import type {RouterClient} from "@orpc/server";
import type {AppRouter} from "./routers.ts";
import {createORPCClient} from "@orpc/client";
import {createTanstackQueryUtils} from "@orpc/tanstack-query";

const link = new RPCLink({ url: "http://localhost:3000/rpc",
    fetch: (input, init) => fetch(input, {
        ...init,
        credentials: "include",
    }),
});
export const client: RouterClient<AppRouter> = createORPCClient(link);

export const orpc =createTanstackQueryUtils(client);