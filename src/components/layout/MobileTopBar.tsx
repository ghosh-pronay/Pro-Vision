import { Link } from "react-router"
import { Menu, X } from "lucide-react"
import logo from "@/assets/logo.png"

interface MobileTopBarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function MobileTopBar({
  sidebarOpen,
  onToggleSidebar,
}: MobileTopBarProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5" />
            <img
              src={logo}
              alt="Pro-Vision"
              width={28}
              height={28}
              className="relative rounded-lg"
            />
          </div>
          <span className="text-sm font-bold text-foreground">Pro-Vision</span>
        </Link>
        <button
          onClick={onToggleSidebar}
          className="size-11 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
    </header>
  )
}
