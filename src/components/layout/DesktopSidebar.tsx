import { Link, NavLink } from "react-router"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"
import { Shield, Settings } from "lucide-react"
import logo from "@/assets/logo.png"
import type { NavItem } from "./nav-items"

interface DesktopSidebarProps {
  navItems: NavItem[]
  isAdmin: boolean
}

export default function DesktopSidebar({
  navItems,
  isAdmin,
}: DesktopSidebarProps) {
  const { lang } = useLang()

  return (
    <aside className="hidden lg:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40">
      <div className="flex flex-col h-full glass-strong border-r border-border/30 m-3 mr-0 rounded-2xl overflow-hidden">
        <Link
          to="/"
          className="px-5 py-4 flex flex-col items-center gap-1.5 border-b border-border/20 hover:bg-foreground/5 transition-colors"
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
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">Pro-Vision</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Plan · Focus · Achieve
            </div>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex-1 p-3 space-y-1 overflow-y-auto"
        >
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`
              }
            >
              <Icon className="size-4 shrink-0" />
              {t(labelKey, lang)}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <div className="px-3 pb-1">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--pv-orange)]/10 text-[var(--pv-orange)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`
              }
            >
              <Shield className="size-4 shrink-0" />
              {lang === "bn" ? "অ্যাডমিন" : "Admin"}
            </NavLink>
          </div>
        )}

        <div className="p-3 border-t border-border/20">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`
            }
          >
            <Settings className="size-4 shrink-0" />
            {t("nav.settings", lang)}
          </NavLink>
        </div>
      </div>
    </aside>
  )
}
