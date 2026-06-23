import { NavLink } from "react-router";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import { Settings } from "lucide-react";
import type { NavItem } from "./nav-items";

interface MobileBottomNavProps {
  items: NavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const { lang } = useLang();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/30 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-medium transition-all min-w-[56px] ${
                isActive ? "text-[var(--pv-blue)]" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="size-5" />
            {t(labelKey, lang)}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-medium transition-all min-w-[56px] ${
              isActive ? "text-[var(--pv-blue)]" : "text-muted-foreground"
            }`
          }
        >
          <Settings className="size-5" />
          {t("nav.settings", lang)}
        </NavLink>
      </div>
    </nav>
  );
}
