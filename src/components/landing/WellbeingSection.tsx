import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

export function WellbeingSection() {
  const { lang } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
