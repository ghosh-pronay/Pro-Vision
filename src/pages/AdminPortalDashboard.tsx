import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Shield, LogOut, Users, Activity, Settings, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { lazy } from "react";

const Admin = lazy(() => import("@/pages/Admin"));
const AdminAPI = lazy(() => import("@/pages/AdminAPI"));

type AdminTab = "admin" | "api";

const ADMIN_TABS: { id: AdminTab; label: string; icon: typeof Shield }[] = [
  { id: "admin", label: "Admin Panel", icon: Users },
  { id: "api", label: "API Management", icon: Activity },
];

export default function AdminPortalDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentUser = useQuery(api.users.currentUser);
  const [activeTab, setActiveTab] = useState<AdminTab>("admin");

  const isAdmin = currentUser != null && currentUser.role === "admin";

  useEffect(() => {
    if (currentUser !== undefined && !isAdmin) {
      navigate("/admin-portal", { replace: true });
    }
  }, [currentUser, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-portal", { replace: true });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/10 to-gray-950">
      {/* Admin Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Admin Portal</h1>
              <p className="text-xs text-white/40">Pro-Vision Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}

            <div className="w-px h-6 bg-white/10 mx-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64 text-white/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400" />
            </div>
          }
        >
          {activeTab === "admin" && <Admin />}
          {activeTab === "api" && <AdminAPI />}
        </Suspense>
      </div>
    </div>
  );
}
