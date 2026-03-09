import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/RoleContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If provided, only these roles can access. Otherwise any authenticated user can. */
    allowedRoles?: UserRole[];
}

/**
 * Wraps a route so that:
 *  - Unauthenticated users are redirected to /login (with `from` saved for redirect back)
 *  - Optionally, users whose role is not in `allowedRoles` see a 403 page
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // While rehydrating from localStorage — show nothing or a subtle spinner
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8 bg-slate-950 text-white">
                <div className="text-7xl">🚫</div>
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-slate-400 max-w-md">
                    Your current role (<strong className="text-white capitalize">{user.role}</strong>) does
                    not have permission to view this page.
                </p>
                <a
                    href="/home"
                    className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
                >
                    Go to Dashboard
                </a>
            </div>
        );
    }

    return <>{children}</>;
}
