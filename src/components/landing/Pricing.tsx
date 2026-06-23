import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { CheckCircle2, Star } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { fadeUp, stagger } from "./types";

export function Pricing() {
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
