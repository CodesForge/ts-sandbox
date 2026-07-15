import {useAuth} from "@/hooks/useAuth.ts";
import {Navigate, Outlet} from "react-router-dom";

export function GuestGuard() {
    const { isLoading, isError } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    if (isError) return <Outlet />;

    return <Navigate to="/" replace />;
}