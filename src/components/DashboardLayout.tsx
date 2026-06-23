import { Outlet, useLocation } from "react-router";
import { SkipLink } from "@/components/ui/SkipLink";
import { Suspense, lazy, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAuth } from "@/hooks/use-auth";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import TabletSidebar from "@/components/layout/tabletsidebar";
import MobileTopBar from "@/components/layout/MobileTopBar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GreetingBar from "@/components/layout/GreetingBar";

const AdManager = lazy(() => import("@/components/ads/AdManager"));
import { BOTTOM_NAV } from "@/components/layout/nav-items";

export default function DashboardLayout() {
  void useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = (user as { role?: string })?.role === "admin";

  useKeyboardShortcuts();

  return (
    <div className="bg-mesh min-h-screen flex">
      <SkipLink />
      <DesktopSidebar navItems={NAV_ITEMS} isAdmin={isAdmin} />
      <TabletSidebar navItems={NAV_ITEMS} isAdmin={isAdmin} />
      <MobileTopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={NAV_ITEMS}
      />

      <main
        id="main-content"
        className="flex-1 md:ml-[68px] lg:ml-[260px] min-h-screen overflow-x-hidden"
      >
        <div className="md:p-6 p-4 pt-[calc(env(safe-area-inset-top,0px)+52px)] md:pt-6 pb-24 md:pb-6">
          <Suspense fallback={null}>
            <AdManager positions={["header"]} className="mb-4" />
          </Suspense>
          <GreetingBar />
          <Outlet />
          <Suspense fallback={null}>
            <AdManager positions={["footer"]} className="mt-4" />
          </Suspense>
        </div>
      </main>

      <MobileBottomNav items={BOTTOM_NAV} />
    </div>
  );
}
