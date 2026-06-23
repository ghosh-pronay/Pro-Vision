import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "./types";

interface SOSSectionProps {
  lang: string;
  sosActive: boolean;
  onTriggerSOS: () => void;
}

export function SOSSection({ lang, sosActive, onTriggerSOS }: SOSSectionProps) {
  return (
    <>
      <motion.div variants={fadeUp} className="flex justify-center">
        <motion.button
          animate={
            sosActive
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0.7)",
                    "0 0 0 20px rgba(239, 68, 68, 0)",
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                  ],
                  transition: { duration: 1.5, repeat: Infinity },
                }
              : {
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                  },
                }
          }
          whileTap={{ scale: 0.95 }}
          onClick={onTriggerSOS}
          className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 
            text-white font-black text-3xl shadow-2xl shadow-red-500/50 
            flex items-center justify-center cursor-pointer
            hover:from-red-600 hover:to-red-800 transition-colors"
        >
          {sosActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-400"
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          SOS
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center"
          >
            <p className="text-red-500 font-bold text-lg">
              {lang === "bn"
                ? "জরুরি সতর্কতা সক্রিয়!"
                : "EMERGENCY ALERT ACTIVE!"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "bn"
                ? "আপনার জরুরি কনট্যাক্টদের বার্তা পাঠানো হচ্ছে..."
                : "Sending alerts to emergency contacts..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
