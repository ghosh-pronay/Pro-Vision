import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Focus,
  Sparkles,
  Target,
  Wallet,
  Newspaper,
  Heart,
  Brain,
  Shield,
  Zap,
  Globe,
  Smartphone,
  BarChart3,
  Star,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Languages,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

/* ─────────────────────────── helpers ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────────── sections ─────────────────────────── */

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("pv-theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    return stored || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: "light" | "dark" | "system") => {
      root.classList.remove("light", "dark");
      if (t === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.add(prefersDark ? "dark" : "light");
      } else {
        root.classList.add(t);
      }
    };
    apply(theme);
    localStorage.setItem("pv-theme", theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return { theme, setTheme };
}

const LANGUAGES = [
  { code: "en" as const, label: "English", flag: "🇬🇧" },
  { code: "bn" as const, label: "বাংলা", flag: "🇧🇩" },
] as const;

const navLinkKeys = ["nav.features", "nav.coach", "nav.pricing"] as const;

function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [themeMenuOpen]);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langMenuOpen]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ThemeIcon =
    theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
        <div className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5" />
              <img
                src={logo}
                alt="Pro-Vision"
                width={36}
                height={36}
                className="relative rounded-xl"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight leading-none text-foreground">
                Pro-Vision
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
                Plan · Focus · Achieve
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinkKeys.map((key) => {
              const id = key.split(".")[1];
              return (
                <button
                  key={key}
                  onClick={() => scrollTo(id)}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                >
                  {t(key, lang)}
                </button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Toggle language"
              >
                <Languages className="size-4" />
              </button>
              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-strong rounded-xl p-1 min-w-[150px] z-50"
                  >
                    {LANGUAGES.map(({ code, label, flag }) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          lang === code
                            ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] font-medium"
                            : "text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <span className="text-base">{flag}</span>
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <div ref={themeRef} className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Toggle theme"
              >
                <ThemeIcon className="size-4" />
              </button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-strong rounded-xl p-1 min-w-[140px] z-50"
                  >
                    {[
                      { key: "light" as const, icon: Sun, label: "Light" },
                      { key: "dark" as const, icon: Moon, label: "Dark" },
                      {
                        key: "system" as const,
                        icon: Monitor,
                        label: "System",
                      },
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setTheme(key);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === key
                            ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] font-medium"
                            : "text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop sign in + CTA */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/auth")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                {t("nav.signIn", lang)}
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-[var(--pv-blue)]/25 active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                }}
              >
                {t("nav.getStarted", lang)}
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="md:hidden mt-2 overflow-hidden"
            >
              <div className="glass-strong rounded-2xl p-3 space-y-1">
                {navLinkKeys.map((key) => {
                  const id = key.split(".")[1];
                  return (
                    <button
                      key={key}
                      onClick={() => scrollTo(id)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      {t(key, lang)}
                    </button>
                  );
                })}
                <div className="border-t border-border/30 pt-2 mt-2 space-y-1">
                  <div className="flex items-center gap-1 px-4 py-2">
                    <span className="text-xs text-muted-foreground mr-2">
                      Language:
                    </span>
                    {LANGUAGES.map(({ code, label, flag }) => (
                      <button
                        key={code}
                        onClick={() => setLang(code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          lang === code
                            ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                            : "text-muted-foreground hover:bg-foreground/5"
                        }`}
                      >
                        {flag} {label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/auth");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-xl transition-colors"
                  >
                    {t("nav.signIn", lang)}
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/auth");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:brightness-110 hover:shadow-lg hover:shadow-[var(--pv-blue)]/25 active:scale-[0.97]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                    }}
                  >
                    {t("nav.getStarted", lang)}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: orbY }}
          className="mesh-orb mesh-orb-1 -top-20 -left-32"
        />
        <motion.div
          style={{ y: orbY }}
          className="mesh-orb mesh-orb-2 top-1/4 -right-24"
        />
        <motion.div
          style={{ y: orbY }}
          className="mesh-orb mesh-orb-3 bottom-16 left-1/4"
        />
        <motion.div
          style={{ y: orbY }}
          className="mesh-orb mesh-orb-4 top-1/3 left-1/2"
        />
      </div>

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center"
      >
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex justify-center mb-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Glow pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-3xl bg-[var(--pv-blue)] blur-xl -z-10"
            />
            {/* Glow pulse ring 2 (teal) */}
            <motion.div
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute -inset-6 rounded-3xl bg-[var(--pv-teal)] blur-2xl -z-10"
            />
            {/* Logo with subtle rotation */}
            <motion.img
              src={logo}
              alt="Pro-Vision"
              width={80}
              height={80}
              className="relative z-10 rounded-2xl bg-gradient-to-br from-[var(--pv-blue)]/15 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5 p-2"
              animate={{ rotate: [0, 3, 0, -3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{
                scale: 1.08,
                rotate: 0,
                transition: { duration: 0.3 },
              }}
            />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--pv-green)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--pv-green)]" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-muted-foreground">
            {t("hero.badge", lang)}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]"
        >
          <span className="text-foreground">{t("hero.title1", lang)}</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--pv-blue), var(--pv-teal), var(--pv-green))",
            }}
          >
            {t("hero.title2", lang)}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          {t("hero.subtitle", lang)}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/auth")}
            className="group relative inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--pv-blue)]/25 active:scale-[0.98]"
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, var(--pv-blue-light), var(--pv-blue))",
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              {t("hero.cta", lang)}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>

          <a
            href="#features"
            className="glass glass-card-hover rounded-2xl px-6 py-3.5 text-sm font-semibold text-foreground"
          >
            {t("hero.explore", lang)}
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
        >
          {[
            { icon: Shield, key: "hero.trust.encrypted" as TranslationKey },
            { icon: Globe, key: "hero.trust.offline" as TranslationKey },
            { icon: Sparkles, key: "hero.trust.coach" as TranslationKey },
          ].map(({ icon: Icon, key }) => (
            <span key={key} className="flex items-center gap-1.5">
              <Icon className="size-3.5 text-[var(--pv-blue)]" />
              {t(key, lang)}
            </span>
          ))}
        </motion.div>

        {/* Hero glass preview card */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-14 mx-auto max-w-2xl"
        >
          <div className="glass-strong rounded-3xl p-1 glow-blue glass-accent-top">
            <div className="rounded-[20px] bg-background/40 p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    icon: CheckCircle2,
                    value: "12",
                    subKey: "hero.preview.tasks" as TranslationKey,
                    color: "var(--pv-blue)",
                    hoverClass: "hover-blue",
                  },
                  {
                    icon: Target,
                    value: "87%",
                    subKey: "hero.preview.habits" as TranslationKey,
                    color: "var(--pv-green)",
                    hoverClass: "hover-green",
                  },
                  {
                    icon: Wallet,
                    value: "৳4.2K",
                    subKey: "hero.preview.saved" as TranslationKey,
                    color: "var(--pv-orange)",
                    hoverClass: "hover-orange",
                  },
                ].map(({ icon: Icon, value, subKey, color, hoverClass }, i) => (
                  <motion.div
                    key={subKey}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.12 }}
                    className={`glass glass-card-hover ${hoverClass} rounded-2xl p-4 text-center`}
                  >
                    <Icon className="size-5 mx-auto mb-2" style={{ color }} />
                    <div className="text-2xl font-bold text-foreground">
                      {value}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {t(subKey, lang)}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
                    }}
                  >
                    <Brain className="size-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-foreground">
                      {t("hero.preview.score", lang)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t("hero.preview.scoreSub", lang)}
                    </div>
                  </div>
                </div>
                <div
                  className="text-3xl font-extrabold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--pv-blue), var(--pv-green))",
                  }}
                >
                  82
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Features() {
  const { lang } = useLang();

  const features = [
    {
      icon: CheckCircle2,
      titleKey: "features.todo.title" as TranslationKey,
      descKey: "features.todo.desc" as TranslationKey,
      color: "var(--pv-blue)",
      glow: "glow-blue",
    },
    {
      icon: Target,
      titleKey: "features.habits.title" as TranslationKey,
      descKey: "features.habits.desc" as TranslationKey,
      color: "var(--pv-green)",
      glow: "glow-green",
    },
    {
      icon: Wallet,
      titleKey: "features.expense.title" as TranslationKey,
      descKey: "features.expense.desc" as TranslationKey,
      color: "var(--pv-orange)",
      glow: "glow-orange",
    },
    {
      icon: Focus,
      titleKey: "features.focus.title" as TranslationKey,
      descKey: "features.focus.desc" as TranslationKey,
      color: "var(--pv-teal)",
      glow: "glow-blue",
    },
    {
      icon: Newspaper,
      titleKey: "features.news.title" as TranslationKey,
      descKey: "features.news.desc" as TranslationKey,
      color: "var(--pv-blue)",
      glow: "glow-blue",
    },
    {
      icon: BarChart3,
      titleKey: "features.reports.title" as TranslationKey,
      descKey: "features.reports.desc" as TranslationKey,
      color: "var(--pv-green)",
      glow: "glow-green",
    },
    {
      icon: Heart,
      titleKey: "features.wellbeing.title" as TranslationKey,
      descKey: "features.wellbeing.desc" as TranslationKey,
      color: "var(--pv-lavender)",
      glow: "glow-blue",
    },
    {
      icon: Brain,
      titleKey: "features.coach.title" as TranslationKey,
      descKey: "features.coach.desc" as TranslationKey,
      color: "var(--pv-mint)",
      glow: "glow-green",
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-[var(--pv-blue)] mb-4">
            <Zap className="size-3" />
            {t("features.badge", lang)}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {t("features.title", lang)}
            <br />
            <span className="text-muted-foreground">
              {t("features.titleSub", lang)}
            </span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-muted-foreground leading-relaxed">
            {t("features.desc", lang)}
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map(({ icon: Icon, titleKey, descKey, color, glow }, i) => (
            <motion.div
              key={titleKey}
              custom={i}
              variants={fadeUp}
              className={`glass glass-accent-top glass-card-hover rounded-2xl p-5 group cursor-default ${glow}`}
            >
              <div
                className="size-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${color}18` }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5">
                {t(titleKey, lang)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(descKey, lang)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CoachSection() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const chips = t("coach.chips", lang);
  const chipArray = chips.split("|");

  return (
    <section id="coach" className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-[var(--pv-teal)] mb-4">
              <Sparkles className="size-3" />
              {t("coach.badge", lang)}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t("coach.title", lang)}
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--pv-teal), var(--pv-blue))",
                }}
              >
                {t("coach.titleSub", lang)}
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("coach.desc", lang)}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "coach.point1",
                "coach.point2",
                "coach.point3",
                "coach.point4",
                "coach.point5",
              ].map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-[var(--pv-green)] mt-0.5" />
                  {t(key as TranslationKey, lang)}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-[var(--pv-teal)]/25 active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, var(--pv-teal), var(--pv-blue))",
              }}
            >
              {t("coach.cta", lang)}
              <ArrowRight className="size-4" />
            </button>
          </motion.div>

          {/* Right — chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="glass-strong rounded-3xl p-1 glow-blue glass-accent-top">
              <div className="rounded-[20px] bg-background/40 p-5 space-y-4">
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                  <div
                    className="size-9 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
                    }}
                  >
                    <Compass className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {lang === "bn" ? "কোচ" : "Coach"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[var(--pv-green)]" />
                      <span className="text-[10px] text-muted-foreground">
                        {lang === "bn"
                          ? "অনলাইন · সাহায্য করতে প্রস্তুত"
                          : "Online · Ready to help"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coach message */}
                <div className="flex gap-2.5">
                  <div
                    className="size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
                    }}
                  >
                    <Compass className="size-3.5 text-white" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t("coach.mock.greeting", lang)}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      8:02 AM
                    </span>
                  </div>
                </div>

                {/* User message */}
                <div className="flex gap-2.5 justify-end">
                  <div
                    className="rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                    }}
                  >
                    <p className="text-sm text-white leading-relaxed">
                      {t("coach.mock.user", lang)}
                    </p>
                    <span className="text-[10px] text-white/60 mt-1 block">
                      8:03 AM
                    </span>
                  </div>
                </div>

                {/* Coach response */}
                <div className="flex gap-2.5">
                  <div
                    className="size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
                    }}
                  >
                    <Compass className="size-3.5 text-white" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      {t("coach.mock.reply", lang)}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      8:03 AM
                    </span>
                  </div>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {chipArray.map((chip: string) => (
                    <span
                      key={chip}
                      className="glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground cursor-default hover:text-foreground transition-colors"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { lang } = useLang();

  const stats = [
    { value: "7", labelKey: "features.badge" as TranslationKey, icon: Zap },
    { value: "2", labelKey: "stats.languages" as TranslationKey, icon: Globe },
    {
      value: "100%",
      labelKey: "stats.offline" as TranslationKey,
      icon: Smartphone,
    },
    {
      value: "256-bit",
      labelKey: "stats.encryption" as TranslationKey,
      icon: Shield,
    },
  ];

  return (
    <section className="relative py-20">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="glass-strong rounded-3xl p-1 glow-blue">
          <div className="rounded-[20px] bg-background/30 p-8 sm:p-10">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map(({ value, labelKey, icon: Icon }, i) => (
                <motion.div
                  key={labelKey}
                  custom={i}
                  variants={fadeUp}
                  className="text-center"
                >
                  <Icon className="size-5 mx-auto mb-2 text-[var(--pv-blue)]" />
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t(labelKey, lang)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WellbeingSection() {
  const { lang } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-strong rounded-3xl p-1 glow-green glass-accent-top">
              <div className="rounded-[20px] bg-background/40 p-6">
                <div className="text-sm font-bold text-foreground mb-4">
                  {t("wellbeing.moodLabel", lang)}
                </div>
                <div className="flex justify-between mb-6">
                  {["😞", "😕", "😐", "🙂", "😄"].map((emoji, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-3xl p-2 rounded-xl transition-colors ${i === 3 ? "glass glow-green" : "hover:bg-foreground/5"}`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    {
                      labelKey: "wellbeing.streak" as TranslationKey,
                      valueKey: "wellbeing.streakValue" as TranslationKey,
                      bar: 80,
                      color: "var(--pv-green)",
                    },
                    {
                      labelKey: "wellbeing.sleepLabel" as TranslationKey,
                      valueKey: "wellbeing.sleepValue" as TranslationKey,
                      bar: 72,
                      color: "var(--pv-teal)",
                    },
                    {
                      labelKey: "wellbeing.stressLabel" as TranslationKey,
                      valueKey: "wellbeing.stressValue" as TranslationKey,
                      bar: 30,
                      color: "var(--pv-lavender)",
                    },
                  ].map(({ labelKey, valueKey, bar, color }) => (
                    <div key={labelKey}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {t(labelKey, lang)}
                        </span>
                        <span className="font-semibold text-foreground">
                          {t(valueKey, lang)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-[var(--pv-lavender)] mb-4">
              <Heart className="size-3" />
              {t("wellbeing.badge", lang)}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t("wellbeing.title", lang)}
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--pv-lavender), var(--pv-mint))",
                }}
              >
                {t("wellbeing.titleSub", lang)}
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("wellbeing.desc", lang)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="glass glass-card-hover rounded-xl px-4 py-3 flex items-center gap-2.5">
                <span className="text-xl">😴</span>
                <span className="text-sm font-semibold text-foreground">
                  {t("wellbeing.sleep" as TranslationKey, lang)}
                </span>
              </div>
              <div className="glass glass-card-hover rounded-xl px-4 py-3 flex items-center gap-2.5">
                <span className="text-xl">🙏</span>
                <span className="text-sm font-semibold text-foreground">
                  {t("wellbeing.gratitude" as TranslationKey, lang)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const navigate = useNavigate();
  const { lang } = useLang();

  const plans = [
    {
      nameKey: "pricing.free" as TranslationKey,
      price: "৳0",
      periodKey: "pricing.freeSub" as TranslationKey,
      descKey: "pricing.freeDesc" as TranslationKey,
      featureKeys: [
        "pricing.freeFeature1",
        "pricing.freeFeature2",
        "pricing.freeFeature3",
        "pricing.freeFeature4",
        "pricing.freeFeature5",
      ] as TranslationKey[],
      ctaKey: "pricing.freeCta" as TranslationKey,
      highlight: false,
    },
    {
      nameKey: "pricing.premium" as TranslationKey,
      price: "৳199",
      periodKey: "pricing.premiumSub" as TranslationKey,
      descKey: "pricing.premiumDesc" as TranslationKey,
      featureKeys: [
        "pricing.premiumFeature1",
        "pricing.premiumFeature2",
        "pricing.premiumFeature3",
        "pricing.premiumFeature4",
        "pricing.premiumFeature5",
        "pricing.premiumFeature6",
      ] as TranslationKey[],
      ctaKey: "pricing.premiumCta" as TranslationKey,
      highlight: true,
    },
    {
      nameKey: "pricing.student" as TranslationKey,
      price: "৳99",
      periodKey: "pricing.premiumSub" as TranslationKey,
      descKey: "pricing.studentDesc" as TranslationKey,
      featureKeys: [
        "pricing.studentFeature1",
        "pricing.studentFeature2",
        "pricing.studentFeature3",
        "pricing.studentFeature4",
      ] as TranslationKey[],
      ctaKey: "pricing.studentCta" as TranslationKey,
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-[var(--pv-orange)] mb-4">
            <Star className="size-3" />
            {t("pricing.badge", lang)}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("pricing.title", lang)}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("pricing.desc", lang)}
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-5"
        >
          {plans.map(
            (
              {
                nameKey,
                price,
                periodKey,
                descKey,
                featureKeys,
                ctaKey,
                highlight,
              },
              i,
            ) => (
              <motion.div
                key={nameKey}
                custom={i}
                variants={fadeUp}
                className={`relative rounded-2xl p-1 ${highlight ? "glow-blue" : ""}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span
                      className="rounded-full px-3 py-0.5 text-[10px] font-bold text-white tracking-wider uppercase"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
                      }}
                    >
                      {t("pricing.mostPopular", lang)}
                    </span>
                  </div>
                )}
                <div
                  className={`glass-strong glass-accent-top rounded-2xl h-full flex flex-col p-6 hover-lift ${highlight ? "border-[var(--pv-blue)]/30" : ""}`}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      {t(nameKey, lang)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(descKey, lang)}
                    </p>
                  </div>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">
                      {price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t(periodKey, lang)}
                    </span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {featureKeys.map((fk) => (
                      <li
                        key={fk}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="size-3.5 shrink-0 text-[var(--pv-green)] mt-0.5" />
                        {t(fk, lang)}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/auth")}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                      highlight
                        ? "text-white hover:brightness-110 hover:shadow-lg hover:shadow-[var(--pv-blue)]/25"
                        : "glass text-foreground hover:bg-foreground/10 hover:shadow-md"
                    }`}
                    style={
                      highlight
                        ? {
                            background:
                              "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                          }
                        : undefined
                    }
                  >
                    {t(ctaKey, lang)}
                  </button>
                </div>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-strong rounded-3xl p-1 glow-blue glass-accent-top">
            <div className="rounded-[20px] bg-background/30 px-8 py-12 sm:px-12 sm:py-14">
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5 blur-lg" />
                  <img
                    src={logo}
                    alt="Pro-Vision"
                    width={48}
                    height={48}
                    className="relative rounded-xl"
                  />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {t("cta.title", lang)}
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                {t("cta.desc", lang)}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/auth")}
                  className="group inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-[var(--pv-blue)]/25 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                  }}
                >
                  {t("cta.button", lang)}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("cta.note", lang)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { lang } = useLang();

  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--pv-blue)]/20 to-[var(--pv-teal)]/10 dark:from-white/10 dark:to-white/5" />
              <img
                src={logo}
                alt="Pro-Vision"
                width={28}
                height={28}
                className="relative rounded-lg"
              />
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
            >
              Pro-Vision
            </Link>
            <span className="text-xs text-muted-foreground">
              · Plan · Focus · Achieve
            </span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { key: "footer.privacy" as TranslationKey },
              { key: "footer.terms" as TranslationKey },
              { key: "footer.cookie" as TranslationKey },
              { key: "footer.contact" as TranslationKey },
            ].map(({ key }) => (
              <a
                key={key}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground hover-lift transition-colors"
              >
                {t(key, lang)}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? (
              <>
                <a
                  href="https://pronayghosh.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground hover:underline"
                >
                  Pronay
                </a>{" "}
                {t("footer.madeWith", lang)}
              </>
            ) : (
              <>
                {t("footer.madeWith", lang)}{" "}
                <a
                  href="https://pronayghosh.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground hover:underline"
                >
                  Pronay
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function Landing() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CoachSection />
        <Stats />
        <WellbeingSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
