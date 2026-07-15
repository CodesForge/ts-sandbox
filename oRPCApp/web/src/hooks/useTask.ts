import {useMutation, useQueryClient} from "@tanstack/react-query";
import {orpc} from "../../../app/src/libs/orpc/client.ts";

export function useTask() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.task.create.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: orpc.task.all.queryOptions().queryKey,
            });
        },
    });
}