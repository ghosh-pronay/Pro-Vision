import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";
import { Button } from "./button";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    confirmBg: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    confirmBg: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  info: {
    icon: Info,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    confirmBg: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
};

const defaultLabels = {
  en: { confirm: "Confirm", cancel: "Cancel" },
  bn: { confirm: "নিশ্চিত করুন", cancel: "বাতিল" },
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "danger",
}: ConfirmDialogProps) {
  const { lang } = useLang();
  const labels = defaultLabels[lang];
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-sm relative z-10"
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  config.iconBg,
                )}
              >
                <Icon className={cn("w-6 h-6", config.iconColor)} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {description}
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 glass"
                >
                  {cancelLabel || labels.cancel}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={cn("flex-1", config.confirmBg)}
                >
                  {confirmLabel || labels.confirm}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
