import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Users, Flame } from "lucide-react";
import { STREAK_LEVELS, type LeaderboardEntry } from "./types";

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardTab({ leaderboard }: LeaderboardTabProps) {
  const { lang } = useLang();

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          {lang === "bn" ? "বন্ধুদের সাথে তুলনা" : "Compare with Friends"}
        </h3>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => {
            const entryLevel = STREAK_LEVELS.find(
              (l) => l.level === entry.level,
            );
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  entry.isCurrentUser
                    ? "bg-white/15 ring-1 ring-purple-500/30"
                    : "bg-white/5"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1
                      ? "bg-yellow-500/30 text-yellow-400"
                      : entry.rank === 2
                        ? "bg-gray-400/30 text-gray-300"
                        : entry.rank === 3
                          ? "bg-orange-500/30 text-orange-400"
                          : "bg-white/10 text-white/50"
                  }`}
                >
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-white/50">
                    {entryLevel?.nameBn || entry.level} · {entry.streak}{" "}
                    {lang === "bn" ? "দিন" : "days"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame
                      className="w-4 h-4"
                      style={{ color: entryLevel?.color }}
                    />
                    <span className="font-semibold">{entry.streak}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
