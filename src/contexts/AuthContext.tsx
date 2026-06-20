import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading Pro-Vision...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading: false,
        isAuthenticated,
        userId: user?.uid ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
