import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronUp, ChevronDown } from "lucide-react";
import { SAFETY_TIPS, fadeUp } from "./types";

interface SafetyTipsProps {
  lang: string;
  expanded: boolean;
  onToggle: () => void;
}

export function SafetyTips({ lang, expanded, onToggle }: SafetyTipsProps) {
  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between cursor-pointer hover:bg-foreground/5 rounded-xl p-3 transition-colors"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {lang === "bn" ? "নিরাপত্তা টিপস" : "Safety Tips"}
        </h2>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {SAFETY_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5"
              >
                <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-yellow-500">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn" ? tip.bn : tip.en}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
