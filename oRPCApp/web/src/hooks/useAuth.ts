import {useQuery} from "@tanstack/react-query";
import {orpc} from "../../../app/src/libs/orpc/client.ts";

export function useAuth() {
    return useQuery({
        ...orpc.me.queryOptions(),
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
}