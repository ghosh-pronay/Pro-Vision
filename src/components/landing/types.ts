import { useEffect, useState } from "react";

export const fadeUp = {
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

export const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export function useTheme() {
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

export const LANGUAGES = [
  { code: "en" as const, label: "English", flag: "🇬🇧" },
  { code: "bn" as const, label: "বাংলা", flag: "🇧🇩" },
] as const;

export const navLinkKeys = [
  "nav.features",
  "nav.coach",
  "nav.pricing",
] as const;
