import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleIn } from "./types";

interface SavePlanModalProps {
  lang: string;
  show: boolean;
  onClose: () => void;
  planName: string;
  onPlanNameChange: (name: string) => void;
  onSave: () => void;
}

export function SavePlanModal({
  lang,
  show,
  onClose,
  planName,
  onPlanNameChange,
  onSave,
}: SavePlanModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={fadeIn.hidden}
          animate={fadeIn.visible}
          exit={fadeIn.hidden}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={scaleIn.hidden}
            animate={scaleIn.visible}
            exit={scaleIn.hidden}
            className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {lang === "bn" ? "পরিকল্পনা সংরক্ষণ" : "Save Plan"}
            </h3>
            <input
              type="text"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
              placeholder={lang === "bn" ? "পরিকল্পনার নাম" : "Plan name"}
              className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && onSave()}
            />
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl glass-subtle text-sm font-medium"
              >
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={onSave}
                disabled={!planName.trim()}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {lang === "bn" ? "সংরক্ষণ" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
