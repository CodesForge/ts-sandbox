import {useQuery} from "@tanstack/react-query";
import {orpc} from "../../../app/src/libs/orpc/client.ts";

export function useAllTasks() {
    return useQuery({
        ...orpc.task.all.queryOptions(),
        retry: false,
    });
}