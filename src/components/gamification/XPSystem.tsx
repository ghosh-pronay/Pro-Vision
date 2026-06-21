import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface UserStats {
  tasksCompleted: number;
  habitsCompleted: number;
  focusMinutes: number;
  transactionsTracked: number;
  daysActive: number;
  streakDays: number;
}

interface XPSystemProps {
  stats: UserStats;
}

const XP_VALUES = {
  taskCompleted: 10,
  habitCompleted: 15,
  focusMinute: 1,
  transactionTracked: 5,
  dayActive: 20,
  streakBonus: 50,
};

const LEVELS = [
  { level: 1, title: "Beginner", xpRequired: 0, icon: "🌱" },
  { level: 2, title: "Learner", xpRequired: 100, icon: "📚" },
  { level: 3, title: "Practitioner", xpRequired: 300, icon: "🎯" },
  { level: 4, title: "Achiever", xpRequired: 600, icon: "🏆" },
  { level: 5, title: "Expert", xpRequired: 1000, icon: "⭐" },
  { level: 6, title: "Master", xpRequired: 1500, icon: "👑" },
  { level: 7, title: "Sage", xpRequired: 2500, icon: "🧙" },
  { level: 8, title: "Legend", xpRequired: 4000, icon: "💎" },
  { level: 9, title: "Mythic", xpRequired: 6000, icon: "🔥" },
  { level: 10, title: "Transcendent", xpRequired: 10000, icon: "✨" },
];

function calculateXP(stats: UserStats): number {
  let xp = 0;
  xp += stats.tasksCompleted * XP_VALUES.taskCompleted;
  xp += stats.habitsCompleted * XP_VALUES.habitCompleted;
  xp += stats.focusMinutes * XP_VALUES.focusMinute;
  xp += stats.transactionsTracked * XP_VALUES.transactionTracked;
  xp += stats.daysActive * XP_VALUES.dayActive;
  xp += stats.streakDays * XP_VALUES.streakBonus;
  return xp;
}

function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = xpForNext > 0 ? (xpInLevel / xpForNext) * 100 : 100;

  return {
    currentLevel,
    nextLevel,
    xpInLevel,
    xpForNext,
    progress: Math.min(progress, 100),
  };
}

export default function XPSystem({ stats }: XPSystemProps) {
  const xp = useMemo(() => calculateXP(stats), [stats]);
  const { currentLevel, nextLevel, progress } = useMemo(() => getLevelInfo(xp), [xp]);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-foreground">Level & XP</h3>
      </div>

      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-5xl mb-2"
        >
          {currentLevel.icon}
        </motion.div>
        <h4 className="text-2xl font-bold text-foreground">
          Level {currentLevel.level}
        </h4>
        <p className="text-sm text-muted-foreground">{currentLevel.title}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress to Level {nextLevel.level}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{xp - currentLevel.xpRequired} XP</span>
          <span>{nextLevel.xpRequired - currentLevel.xpRequired} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-xl bg-white/5">
          <p className="text-2xl font-bold text-yellow-500">{xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5">
          <p className="text-2xl font-bold text-primary">{currentLevel.level}</p>
          <p className="text-xs text-muted-foreground">Current Level</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground mb-2">XP Breakdown:</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Tasks completed</span>
            <span className="text-green-500">+{stats.tasksCompleted * XP_VALUES.taskCompleted} XP</span>
          </div>
          <div className="flex justify-between">
            <span>Habits completed</span>
            <span className="text-green-500">+{stats.habitsCompleted * XP_VALUES.habitCompleted} XP</span>
          </div>
          <div className="flex justify-between">
            <span>Focus time</span>
            <span className="text-green-500">+{stats.focusMinutes * XP_VALUES.focusMinute} XP</span>
          </div>
          <div className="flex justify-between">
            <span>Streak bonus</span>
            <span className="text-green-500">+{stats.streakDays * XP_VALUES.streakBonus} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LEVELS, calculateXP, getLevelInfo, XP_VALUES };
