import {useAuth} from "@/hooks/useAuth.ts";
import {Navigate, Outlet} from "react-router-dom";

export function AuthGuard() {
    const { isLoading, isError } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <Navigate to="/registration" replace />;

    return <Outlet/>;
}