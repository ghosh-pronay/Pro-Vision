import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RewardedVideoProps {
  isOpen: boolean;
  onClose: () => void;
  onRewarded: () => void;
  featureName: string;
}

export default function RewardedVideo({
  isOpen,
  onClose,
  onRewarded,
  featureName,
}: RewardedVideoProps) {
  const [status, setStatus] = useState<"idle" | "watching" | "complete">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const updateProfile = useMutation(api.userProfiles.upsert);

  const handleWatch = () => {
    setStatus("watching");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("complete");
          return 100;
        }
        return prev + 2;
      });
    }, 600);
  };

  const handleClaim = async () => {
    await updateProfile({});
    onRewarded();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <h3 className="font-semibold text-foreground">
                Watch Ad to Unlock
              </h3>
              <button
                onClick={onClose}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-[var(--pv-blue)]/10 flex items-center justify-center mx-auto">
                <Play className="size-8 text-[var(--pv-blue)]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Watch a short ad to unlock
                </p>
                <p className="font-semibold text-foreground mt-1">
                  {featureName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  for 24 hours
                </p>
              </div>

              {status === "idle" && (
                <button
                  onClick={handleWatch}
                  className="w-full py-3 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all"
                >
                  Watch Ad (30s)
                </button>
              )}

              {status === "watching" && (
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--pv-blue)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Watching... {Math.round(progress * 0.3)}s remaining
                  </p>
                </div>
              )}

              {status === "complete" && (
                <div className="space-y-3">
                  <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <Check className="size-6 text-green-500" />
                  </div>
                  <button
                    onClick={handleClaim}
                    className="w-full py-3 rounded-xl bg-green-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    Claim Reward
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
