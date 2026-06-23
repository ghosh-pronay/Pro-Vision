import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Wallet,
  Brain,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { fadeUp } from "./types";

export function Hero() {
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
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-3xl bg-[var(--pv-blue)] blur-xl -z-10"
            />
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

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          {t("hero.subtitle", lang)}
        </motion.p>

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
