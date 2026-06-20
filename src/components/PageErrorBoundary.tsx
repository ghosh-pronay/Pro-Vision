import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `PageErrorBoundary (${this.props.pageName || "page"}) caught:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          pageName={this.props.pageName}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({
  error,
  pageName,
}: {
  error: Error | null;
  pageName?: string;
}) {
  const { lang } = useLang();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="glass rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-white/10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 300,
            delay: 0.1,
          }}
          className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto"
        >
          <AlertTriangle className="size-8 text-red-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-foreground">
            {pageName
              ? `${pageName} — ${lang === "bn" ? "কিছু ভুল হয়েছে" : "Something went wrong"}`
              : lang === "bn"
                ? "কিছু ভুল হয়েছে"
                : "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message ||
              (lang === "bn"
                ? "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে"
                : "An unexpected error occurred")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all active:scale-95"
          >
            <RefreshCw className="size-4" />
            {t("common.retry", lang)}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PageErrorBoundary;
