import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X, Clock, Target, Sparkles } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export default function PushNotificationBanner() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isDeclined,
    requestPermission,
    decline,
  } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (
      isSupported &&
      permission === "default" &&
      !isSubscribed &&
      !isDeclined()
    ) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, isDeclined]);

  const handleAccept = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);
    if (granted) {
      setVisible(false);
    }
  };

  const handleDecline = () => {
    decline();
    setVisible(false);
  };

  if (!visible || permission !== "default" || isSubscribed) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
        >
          <div className="glass rounded-2xl p-5 shadow-2xl border border-white/20 dark:border-white/10">
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 text-white/50 hover:text-white/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <BellRing className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1">
                  Stay on Track
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  Get timely reminders for prayer times, habit streaks, and
                  daily goals to boost your productivity.
                </p>

                <div className="flex items-center gap-3 mb-4 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prayer Times
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> Habit Reminders
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Daily Tips
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={isRequesting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isRequesting ? "Enabling..." : "Enable Notifications"}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-4 py-2 bg-white/10 text-white/70 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
