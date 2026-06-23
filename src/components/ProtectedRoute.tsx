import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isEmailVerified, hasEmail } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (hasEmail && !isEmailVerified) {
    return <Navigate to="/auth?mode=verify" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
