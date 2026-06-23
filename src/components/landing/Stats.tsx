import { motion } from "framer-motion";
import { Zap, Globe, Smartphone, Shield } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { fadeUp, stagger } from "./types";

export function Stats() {
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
