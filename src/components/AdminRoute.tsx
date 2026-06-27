import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminRoute() {
  const { isAuthenticated } = useAuthContext();
  const profile = useQuery(api.userProfiles.get);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile || (profile as { role?: string }).role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
