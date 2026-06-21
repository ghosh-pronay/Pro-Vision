import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { SkipLink } from "@/components/ui/SkipLink";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import AdManager from "@/components/ads/AdManager";
import { getTimeBasedGreeting } from "@/lib/bangla-greetings";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Wallet,
  Timer,
  Newspaper,
  BarChart3,
  Heart,
  Settings,
  Shield,
  Menu,
  X,
  Trophy,
  BookOpen,
  BookMarked,
  Apple,
  Users,
  Moon,
  PiggyBank,
  Dumbbell,
  GraduationCap,
  Sparkles,
  Award,
  BarChart,
  Sun,
  Brain,
  UserPlus,
  Activity,
  DollarSign,
  QrCode,
  Search,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: TranslationKey;
  id: string;
  section?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "nav.dashboard" as TranslationKey,
    id: "dashboard",
    section: "core",
  },
  {
    path: "/todo",
    icon: CheckSquare,
    labelKey: "nav.todo" as TranslationKey,
    id: "todo",
    section: "core",
  },
  {
    path: "/habits",
    icon: Target,
    labelKey: "nav.habits" as TranslationKey,
    id: "habits",
    section: "core",
  },
  {
    path: "/expense",
    icon: Wallet,
    labelKey: "nav.expense" as TranslationKey,
    id: "expense",
    section: "core",
  },
  {
    path: "/focus",
    icon: Timer,
    labelKey: "nav.focus" as TranslationKey,
    id: "focus",
    section: "core",
  },
  {
    path: "/goals",
    icon: Trophy,
    labelKey: "nav.goals" as TranslationKey,
    id: "goals",
    section: "productivity",
  },
  {
    path: "/journal",
    icon: BookOpen,
    labelKey: "nav.journal" as TranslationKey,
    id: "journal",
    section: "productivity",
  },
  {
    path: "/reading",
    icon: BookMarked,
    labelKey: "nav.reading" as TranslationKey,
    id: "reading",
    section: "productivity",
  },
  {
    path: "/study",
    icon: GraduationCap,
    labelKey: "nav.study" as TranslationKey,
    id: "study",
    section: "productivity",
  },
  {
    path: "/learning-paths",
    icon: GraduationCap,
    labelKey: "nav.learningPaths" as TranslationKey,
    id: "learningPaths",
    section: "productivity",
  },
  {
    path: "/fitness",
    icon: Dumbbell,
    labelKey: "nav.fitness" as TranslationKey,
    id: "fitness",
    section: "health",
  },
  {
    path: "/sleep",
    icon: Moon,
    labelKey: "nav.sleep" as TranslationKey,
    id: "sleep",
    section: "health",
  },
  {
    path: "/nutrition",
    icon: Apple,
    labelKey: "nav.nutrition" as TranslationKey,
    id: "nutrition",
    section: "health",
  },
  {
    path: "/health-dashboard",
    icon: Activity,
    labelKey: "nav.healthDashboard" as TranslationKey,
    id: "healthDashboard",
    section: "health",
  },
  {
    path: "/wellbeing",
    icon: Heart,
    labelKey: "nav.wellbeing" as TranslationKey,
    id: "wellbeing",
    section: "health",
  },
  {
    path: "/checkin",
    icon: Sun,
    labelKey: "nav.checkin" as TranslationKey,
    id: "checkin",
    section: "health",
  },
  {
    path: "/gratitude",
    icon: Sparkles,
    labelKey: "nav.gratitude" as TranslationKey,
    id: "gratitude",
    section: "health",
  },
  {
    path: "/savings",
    icon: PiggyBank,
    labelKey: "nav.savings" as TranslationKey,
    id: "savings",
    section: "finance",
  },
  {
    path: "/financial-dashboard",
    icon: DollarSign,
    labelKey: "nav.financialDashboard" as TranslationKey,
    id: "financialDashboard",
    section: "finance",
  },
  {
    path: "/wallets",
    icon: Wallet,
    labelKey: "nav.wallets" as TranslationKey,
    id: "wallets",
    section: "finance",
  },
  {
    path: "/payment",
    icon: CreditCard,
    labelKey: "nav.payment" as TranslationKey,
    id: "payment",
    section: "finance",
  },
  {
    path: "/crm",
    icon: Users,
    labelKey: "nav.crm" as TranslationKey,
    id: "crm",
    section: "social",
  },
  {
    path: "/accountability-partner",
    icon: UserPlus,
    labelKey: "nav.accountabilityPartner" as TranslationKey,
    id: "accountabilityPartner",
    section: "social",
  },
  {
    path: "/challenges",
    icon: Trophy,
    labelKey: "nav.challenges" as TranslationKey,
    id: "challenges",
    section: "social",
  },
  {
    path: "/social-challenges",
    icon: Users,
    labelKey: "nav.socialChallenges" as TranslationKey,
    id: "socialChallenges",
    section: "social",
  },
  {
    path: "/gamification",
    icon: Award,
    labelKey: "nav.gamification" as TranslationKey,
    id: "gamification",
    section: "social",
  },
  {
    path: "/achievements",
    icon: Award,
    labelKey: "nav.achievements" as TranslationKey,
    id: "achievements",
    section: "social",
  },
  {
    path: "/news",
    icon: Newspaper,
    labelKey: "nav.news" as TranslationKey,
    id: "news",
    section: "discover",
  },
  {
    path: "/reports",
    icon: BarChart3,
    labelKey: "nav.reports" as TranslationKey,
    id: "reports",
    section: "discover",
  },
  {
    path: "/heatmap",
    icon: BarChart,
    labelKey: "nav.heatmap" as TranslationKey,
    id: "heatmap",
    section: "discover",
  },
  {
    path: "/correlation",
    icon: Brain,
    labelKey: "nav.correlation" as TranslationKey,
    id: "correlation",
    section: "discover",
  },
  {
    path: "/qr-profile",
    icon: QrCode,
    labelKey: "nav.qrProfile" as TranslationKey,
    id: "qrProfile",
    section: "discover",
  },
  {
    path: "/analytics",
    icon: BarChart,
    labelKey: "nav.analytics" as TranslationKey,
    id: "analytics",
    section: "discover",
  },
  {
    path: "/encryption",
    icon: Shield,
    labelKey: "nav.encryption" as TranslationKey,
    id: "encryption",
    section: "discover",
  },
  {
    path: "/ai-life-coach",
    icon: Brain,
    labelKey: "nav.aiLifeCoach" as TranslationKey,
    id: "aiLifeCoach",
    section: "discover",
  },
  {
    path: "/bill-split",
    icon: Users,
    labelKey: "nav.billSplit" as TranslationKey,
    id: "billSplit",
    section: "finance",
  },
  {
    path: "/subscriptions",
    icon: CreditCard,
    labelKey: "nav.subscriptions" as TranslationKey,
    id: "subscriptions",
    section: "finance",
  },
  {
    path: "/market-prices",
    icon: BarChart3,
    labelKey: "nav.marketPrices" as TranslationKey,
    id: "marketPrices",
    section: "discover",
  },
  {
    path: "/bengali-calendar",
    icon: Sun,
    labelKey: "nav.bengaliCalendar" as TranslationKey,
    id: "bengaliCalendar",
    section: "discover",
  },
  {
    path: "/emergency-sos",
    icon: Shield,
    labelKey: "nav.emergencySOS" as TranslationKey,
    id: "emergencySOS",
    section: "health",
  },
  {
    path: "/carbon-footprint",
    icon: Heart,
    labelKey: "nav.carbonFootprint" as TranslationKey,
    id: "carbonFootprint",
    section: "discover",
  },
  {
    path: "/meal-planning",
    icon: Apple,
    labelKey: "nav.mealPlanning" as TranslationKey,
    id: "mealPlanning",
    section: "health",
  },
  {
    path: "/commute-tracker",
    icon: Activity,
    labelKey: "nav.commuteTracker" as TranslationKey,
    id: "commuteTracker",
    section: "health",
  },
  {
    path: "/voice-notes",
    icon: BookOpen,
    labelKey: "nav.voiceNotes" as TranslationKey,
    id: "voiceNotes",
    section: "productivity",
  },
  {
    path: "/achievement-sharing",
    icon: Award,
    labelKey: "nav.achievementSharing" as TranslationKey,
    id: "achievementSharing",
    section: "social",
  },
  {
    path: "/daily-streaks",
    icon: Trophy,
    labelKey: "nav.dailyStreaks" as TranslationKey,
    id: "dailyStreaks",
    section: "social",
  },
  {
    path: "/family",
    icon: Users,
    labelKey: "nav.familyDashboard" as TranslationKey,
    id: "familyDashboard",
    section: "social",
  },
  {
    path: "/family-sharing",
    icon: Users,
    labelKey: "nav.familySharing" as TranslationKey,
    id: "familySharing",
    section: "social",
  },
];

const NAV_SECTIONS = [
  { id: "core", label: { en: "Core", bn: "কোর" } },
  { id: "productivity", label: { en: "Productivity", bn: "উৎপাদনশীলতা" } },
  { id: "health", label: { en: "Health", bn: "স্বাস্থ্য" } },
  { id: "finance", label: { en: "Finance", bn: "আর্থিক" } },
  { id: "social", label: { en: "Social", bn: "সামাজিক" } },
  { id: "discover", label: { en: "Discover", bn: "আবিষ্কার" } },
];

const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

export default function DashboardLayout() {
  const { lang } = useLang();
  const { user } = useAuth();
  void useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    core: true,
  });
  const isAdmin = (user as { role?: string })?.role === "admin";

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return NAV_ITEMS;
    const query = searchQuery.toLowerCase();
    return NAV_ITEMS.filter((item) => {
      const label = t(item.labelKey, lang).toLowerCase();
      return label.includes(query) || item.id.includes(query);
    });
  }, [searchQuery, lang]);

  const groupedItems = useMemo(() => {
    if (searchQuery) return { filtered: filteredItems };
    const groups: Record<string, NavItem[]> = {};
    for (const section of NAV_SECTIONS) {
      groups[section.id] = NAV_ITEMS.filter(
        (item) => item.section === section.id,
      );
    }
    return groups;
  }, [searchQuery, filteredItems]);

  // Register keyboard shortcuts for power users
  useKeyboardShortcuts();

  const greeting = getTimeBasedGreeting(new Date().getHours());

  return (
    <div className="bg-mesh min-h-screen flex">
      <SkipLink />
      {/* Desktop sidebar (≥1024px) */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40">
        <div className="flex flex-col h-full glass-strong border-r border-border/30 m-3 mr-0 rounded-2xl overflow-hidden">
          {/* Logo */}
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
              <div className="text-sm font-bold text-foreground">
                Pro-Vision
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Plan · Focus · Achieve
              </div>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
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

          {/* Admin link (admin only) */}
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

          {/* Bottom settings */}
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

          {/* Sidebar ad */}
          <div className="px-3 pb-3">
            <AdManager positions={["sidebar"]} />
          </div>
        </div>
      </aside>

      {/* Tablet collapsed sidebar (768px–1024px) */}
      <TooltipProvider delayDuration={0}>
        <div className="hidden md:flex lg:hidden flex-col w-[68px] fixed inset-y-0 left-0 z-40">
          <div className="flex flex-col h-full glass-strong border-r border-border/30 m-3 mr-0 rounded-2xl overflow-hidden">
            {/* Logo */}
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

            {/* Nav items — icons only */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto flex flex-col items-center">
              {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
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

            {/* Admin (admin only) */}
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

            {/* Settings */}
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

            {/* Sidebar ad (tablet) */}
            <div className="p-2 flex flex-col items-center">
              <AdManager positions={["sidebar"]} />
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Mobile top bar (<768px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
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
            <span className="text-sm font-bold text-foreground">
              Pro-Vision
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="size-11 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            {sidebarOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-out sidebar (<768px) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
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
                    onClick={() => setSidebarOpen(false)}
                    className="size-11 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5"
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
                      className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pv-blue)]/50"
                    />
                  </div>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {searchQuery
                    ? filteredItems.map(({ path, icon: Icon, labelKey }) => (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={() => {
                            setSidebarOpen(false);
                            setSearchQuery("");
                          }}
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
                        const items = groupedItems[section.id] || [];
                        if (items.length === 0) return null;
                        const isExpanded =
                          expandedSections[section.id] !== false;
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
                                  {items.map(
                                    ({ path, icon: Icon, labelKey }) => (
                                      <NavLink
                                        key={path}
                                        to={path}
                                        onClick={() => setSidebarOpen(false)}
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
                                    ),
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                </nav>
                <div className="p-3 border-t border-border/20">
                  <NavLink
                    to="/settings"
                    onClick={() => setSidebarOpen(false)}
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

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 md:ml-[68px] lg:ml-[260px] min-h-screen overflow-x-hidden"
      >
        <div className="md:p-6 p-4 pt-[calc(env(safe-area-inset-top,0px)+52px)] md:pt-6 pb-24 md:pb-6">
          <AdManager positions={["header"]} className="mb-4" />
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
            <p className="text-sm font-medium">
              {lang === "bn" ? greeting.bn : greeting.en}
            </p>
          </div>
          <Outlet />
          <AdManager positions={["footer"]} className="mt-4" />
        </div>
      </main>

      {/* Mobile bottom nav (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/30 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV.map(({ path, icon: Icon, labelKey }) => (
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
    </div>
  );
}
