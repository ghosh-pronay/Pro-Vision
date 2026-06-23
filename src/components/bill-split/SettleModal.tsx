import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { CheckCircle } from "lucide-react";

interface SettleModalProps {
  billId: string;
  t: (key: string) => string;
  onSettle: (billId: string) => void;
  onClose: () => void;
}

export function SettleModal({
  billId,
  t,
  onSettle,
  onClose,
}: SettleModalProps) {
  const { lang } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("billSplit.settleUp")}</h3>
            <p className="text-sm text-muted-foreground">
              {lang === "bn"
                ? "এই বিলটি সম্পন্ন হিসেবে চিহ্নিত করবেন?"
                : "Mark this bill as settled?"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-xl glass font-medium hover:bg-foreground/5"
          >
            {t("billSplit.cancel")}
          </button>
          <button
            onClick={() => onSettle(billId)}
            className="cursor-pointer flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600"
          >
            {t("billSplit.settleUp")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
