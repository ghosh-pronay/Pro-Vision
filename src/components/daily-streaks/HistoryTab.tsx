import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Trophy, History, Flame, Star } from "lucide-react";
import { STREAK_LEVELS, type StreakHistory } from "./types";

interface HistoryTabProps {
  longestStreak: number;
  streakHistory: StreakHistory[];
}

export function HistoryTab({ longestStreak, streakHistory }: HistoryTabProps) {
  const { lang } = useLang();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
          <p className="text-3xl font-bold">{longestStreak}</p>
          <p className="text-white/60">
            {lang === "bn" ? "দীর্ঘতম স্ট্রিক" : "Longest Streak"}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          {lang === "bn" ? "স্ট্রিক ইতিহাস" : "Streak History"}
        </h3>
        <div className="space-y-3">
          {streakHistory.map((entry, idx) => {
            const entryLevel = STREAK_LEVELS.find(
              (l) => l.level === entry.level,
            );
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${entryLevel?.color}30` }}
                >
                  <Flame
                    className="w-5 h-5"
                    style={{ color: entryLevel?.color }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {entry.days}{" "}
                    {lang === "bn" ? "দিনের স্ট্রিক" : "Day Streak"}
                  </p>
                  <p className="text-xs text-white/50">
                    {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: entryLevel?.color }}
                  >
                    {entryLevel?.nameBn}
                  </p>
                  <p className="text-xs text-white/50 flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-yellow-400" />+
                    {entry.pointsEarned}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
