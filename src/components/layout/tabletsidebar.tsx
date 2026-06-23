import { Link, NavLink } from "react-router";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import { Shield, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavItem } from "./nav-items";

interface TabletSidebarProps {
  navItems: NavItem[];
  isAdmin: boolean;
}

export default function TabletSidebar({
  navItems,
  isAdmin,
}: TabletSidebarProps) {
  const { lang } = useLang();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="hidden md:flex lg:hidden flex-col w-[68px] fixed inset-y-0 left-0 z-40">
        <div className="flex flex-col h-full glass-strong border-r border-border/30 m-3 mr-0 rounded-2xl overflow-hidden">
          <Link
            to="/"
            className="px-2 py-4 flex items-center justify-center border-b border-border/20 hover:bg-foreground/5 transition-colors"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5" />
              <img
                src={logo}
                alt="Pro-Vision"
                width={32}
                height={32}
                className="relative rounded-lg"
              />
            </div>
          </Link>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto flex flex-col items-center">
            {navItems.map(({ path, icon: Icon, labelKey }) => (
              <Tooltip key={path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center justify-center size-10 rounded-xl transition-all ${
                        isActive
                          ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      }`
                    }
                  >
                    <Icon className="size-[18px] shrink-0" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(labelKey, lang)}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {isAdmin && (
            <div className="px-2 pb-1 flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center justify-center size-10 rounded-xl transition-all ${
                        isActive
                          ? "bg-[var(--pv-orange)]/10 text-[var(--pv-orange)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      }`
                    }
                  >
                    <Shield className="size-[18px] shrink-0" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <div className="p-2 border-t border-border/20 flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center justify-center size-10 rounded-xl transition-all ${
                      isActive
                        ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`
                  }
                >
                  <Settings className="size-[18px] shrink-0" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {t("nav.settings", lang)}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
