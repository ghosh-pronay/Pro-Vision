import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="mesh-orb mesh-orb-1 -top-32 -left-32" />
        <div className="mesh-orb mesh-orb-2 bottom-0 -right-24" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-md"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="inline-flex mb-6"
          >
            <div className="relative">
              <div className="size-20 rounded-2xl glass-strong glow-blue flex items-center justify-center">
                <Compass className="size-10 text-[var(--pv-blue)]" />
              </div>
              <div className="absolute -inset-3 rounded-3xl bg-[var(--pv-blue)] opacity-10 blur-xl -z-10" />
            </div>
          </motion.div>

          {/* 404 */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--pv-blue), var(--pv-teal))",
            }}
          >
            {t("notFound.title", lang)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-lg font-semibold text-foreground"
          >
            {t("notFound.heading", lang)}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 text-sm text-muted-foreground leading-relaxed"
          >
            {t("notFound.desc", lang)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))" }}
            >
              {t("notFound.home", lang)}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="glass glass-card-hover rounded-2xl px-6 py-3 text-sm font-semibold text-foreground"
            >
              {t("notFound.dashboard", lang)}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

