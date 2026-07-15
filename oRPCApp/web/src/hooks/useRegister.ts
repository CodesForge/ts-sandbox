import {orpc} from "../../../app/src/libs/orpc/client.ts";
import {useMutation} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";

export function useRegister() {
    const navigate = useNavigate();

    return useMutation({
        ...orpc.register.mutationOptions(),
        onSuccess: () => {
            navigate("/");
        }
    });
}