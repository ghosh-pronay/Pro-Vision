import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

export function CoachSection() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const chips = t("coach.chips", lang);
  const chipArray = chips.split("|");

  return (
    <section id="coach" className="relative py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="glass-strong rounded-3xl p-1 glow-blue glass-accent-top">
              <div className="rounded-[20px] bg-background/40 p-5 space-y-4">
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
