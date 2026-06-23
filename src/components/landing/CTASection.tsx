import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";

export function CTASection() {
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
