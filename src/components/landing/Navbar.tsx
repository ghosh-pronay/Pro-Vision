import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Languages,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import { useTheme, LANGUAGES, navLinkKeys } from "./types";

export function Navbar() {
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

          <div className="flex items-center gap-1.5">
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
