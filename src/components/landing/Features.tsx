import { motion } from "framer-motion";
import {
  CheckCircle2,
  Target,
  Wallet,
  Focus,
  Newspaper,
  Heart,
  Brain,
  BarChart3,
  Zap,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { fadeUp, stagger } from "./types";

export function Features() {
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
