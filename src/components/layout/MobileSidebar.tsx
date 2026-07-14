import { Link, NavLink } from "react-router"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"
import { Search, ChevronDown, ChevronRight, Settings, X } from "lucide-react"
import logo from "@/assets/logo.png"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import type { NavItem } from "./nav-items"

const NAV_SECTIONS = [
  { id: "core", label: { en: "Core", bn: "কোর" } },
  { id: "productivity", label: { en: "Productivity", bn: "উৎপাদনশীলতা" } },
  { id: "health", label: { en: "Health", bn: "স্বাস্থ্য" } },
  { id: "finance", label: { en: "Finance", bn: "আর্থিক" } },
  { id: "social", label: { en: "Social", bn: "সামাজিক" } },
  { id: "discover", label: { en: "Discover", bn: "আবিষ্কার" } },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
}

export default function MobileSidebar({
  isOpen,
  onClose,
  navItems,
}: MobileSidebarProps) {
  const { lang } = useLang()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    core: true,
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery) return navItems
    const query = searchQuery.toLowerCase()
    return navItems.filter((item) => {
      const label = t(item.labelKey, lang).toLowerCase()
      return label.includes(query) || item.id.includes(query)
    })
  }, [searchQuery, lang, navItems])

  const groupedItems = useMemo(() => {
    if (searchQuery) return { filtered: filteredItems }
    const groups: Record<string, NavItem[]> = {}
    for (const section of NAV_SECTIONS) {
      groups[section.id] = navItems.filter(
        (item) => item.section === section.id,
      )
    }
    return groups
  }, [searchQuery, filteredItems, navItems])

  const handleClose = () => {
    setSearchQuery("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px]"
          >
            <div className="flex flex-col h-full glass-strong border-r border-border/30 m-3 mr-0 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border/20">
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
                  <span className="text-sm font-bold text-foreground">
                    Pro-Vision
                  </span>
                </Link>
                <button
                  onClick={handleClose}
                  className="size-11 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  aria-label={
                    lang === "bn" ? "সাইডবার বন্ধ করুন" : "Close sidebar"
                  }
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-3 pt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={lang === "bn" ? "অনুসন্ধান..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label={
                      lang === "bn" ? "নেভিগেশন অনুসন্ধান" : "Search navigation"
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pv-blue)]/50"
                  />
                </div>
              </div>
              <nav
                aria-label="Mobile sidebar navigation"
                className="flex-1 p-3 space-y-1 overflow-y-auto"
              >
                {searchQuery
                  ? filteredItems.map(({ path, icon: Icon, labelKey }) => (
                      <NavLink
                        key={path}
                        to={path}
                        onClick={handleClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                          }`
                        }
                      >
                        <Icon className="size-4 shrink-0" />
                        {t(labelKey, lang)}
                      </NavLink>
                    ))
                  : NAV_SECTIONS.map((section) => {
                      const items = groupedItems[section.id] || []
                      if (items.length === 0) return null
                      const isExpanded = expandedSections[section.id] !== false
                      return (
                        <div key={section.id} className="space-y-1">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                          >
                            <span>{section.label[lang]}</span>
                            {isExpanded ? (
                              <ChevronDown className="size-3" />
                            ) : (
                              <ChevronRight className="size-3" />
                            )}
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                {items.map(({ path, icon: Icon, labelKey }) => (
                                  <NavLink
                                    key={path}
                                    to={path}
                                    onClick={handleClose}
                                    className={({ isActive }) =>
                                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                          ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                      }`
                                    }
                                  >
                                    <Icon className="size-4 shrink-0" />
                                    {t(labelKey, lang)}
                                  </NavLink>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
              </nav>
              <div className="p-3 border-t border-border/20">
                <NavLink
                  to="/settings"
                  onClick={handleClose}
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
