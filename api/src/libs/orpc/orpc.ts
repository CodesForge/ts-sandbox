import { os } from "@orpc/server";
import type { AppContext } from "./context";
import { userService } from "../modules/user";

export const o = os.$context<AppContext>();

export const withUserService = o.middleware(async ({ context, next }) => {
    return next({
        context: {...context, userService},
    });
});