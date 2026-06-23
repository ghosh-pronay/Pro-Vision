import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Trophy, Flame, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  streak: number;
  completedChallenges: number;
  points: number;
  isCurrentUser: boolean;
}

interface Props {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: Props) {
  const { lang } = useLang();

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">
          {lang === "bn" ? "লিডারবোর্ড" : "Leaderboard"}
        </h2>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        {entries.slice(0, 3).map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className={`flex flex-col items-center gap-2 ${idx === 0 ? "order-2 -mt-4" : idx === 1 ? "order-1" : "order-3"}`}
          >
            <div
              className={`relative ${idx === 0 ? "w-16 h-16" : "w-14 h-14"}`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-2xl glass ${idx === 0 ? "ring-2 ring-yellow-500" : ""}`}
              >
                {entry.avatar}
              </div>
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-yellow-500 text-white" : idx === 1 ? "bg-gray-300 text-gray-800" : "bg-amber-600 text-white"}`}
              >
                {entry.rank}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{entry.name}</div>
              <div className="text-xs text-muted-foreground">
                {entry.points} pts
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        {entries.slice(3).map((entry) => (
          <motion.div
            key={entry.rank}
            variants={fadeUp}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${entry.isCurrentUser ? "glass bg-primary/10 border border-primary/30" : "glass-subtle"}`}
          >
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">
              {entry.rank}
            </div>
            <div className="text-xl">{entry.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{entry.name}</span>
                {entry.isCurrentUser && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary">
                    {lang === "bn" ? "আপনি" : "You"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {entry.streak}d
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {entry.completedChallenges}
                </span>
              </div>
            </div>
            <div className="text-sm font-semibold">{entry.points} pts</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
