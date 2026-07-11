import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Shield, Loader2, Lock } from "lucide-react"

// Admin access is granted by your account's role (set in the database),
// not by a key entered in the browser. This page just checks that role
// and routes you to the dashboard or back out.
export default function AdminPortal() {
  const navigate = useNavigate()
  const currentUser = useQuery(api.users.currentUser) as any

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      navigate("/admin-portal/dashboard", { replace: true })
    }
  }, [currentUser, navigate])

  const isLoading = currentUser === undefined
  const isDenied =
    currentUser === null || (currentUser && currentUser.role !== "admin")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/10 to-gray-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border-white/10 relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-white">Admin Portal</CardTitle>
          <CardDescription className="text-white/50">
            {isLoading
              ? "Checking your access..."
              : "This area is restricted to admin accounts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          )}

          {isDenied && (
            <div className="text-center space-y-4 py-2">
              <div className="flex justify-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Lock className="w-6 h-6 text-white/40" />
                </div>
              </div>
              <p className="text-sm text-white/60">
                {currentUser === null
                  ? "Sign in with an admin account to continue."
                  : "Your account doesn't have admin access."}
              </p>
              <button
                onClick={() => navigate(currentUser === null ? "/auth" : "/")}
                className="text-xs text-white/40 hover:text-white/70 transition-colors underline"
              >
                {currentUser === null ? "Go to sign in" : "Back to Pro-Vision"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
