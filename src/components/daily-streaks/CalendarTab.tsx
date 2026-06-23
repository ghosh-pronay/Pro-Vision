import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  PartyPopper,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  fadeUp,
  STREAK_LEVELS,
  LEVEL_BENEFITS,
  MILESTONES,
  getHeatmapColor,
  type StreakDay,
  type Milestone,
} from "./types";

interface CalendarTabProps {
  currentStreak: number;
  level: string;
  currentMonth: Date;
  streakDays: StreakDay[];
  calendarDays: { day: number | null; isStreak: boolean; isToday: boolean }[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  getMonthLabel: () => string;
}

export function CalendarTab({
  currentStreak,
  level,
  currentMonth,
  streakDays,
  calendarDays,
  onPrevMonth,
  onNextMonth,
  getMonthLabel,
}: CalendarTabProps) {
  const { lang } = useLang();

  const currentLevelData = useMemo(
    () => STREAK_LEVELS.find((l) => l.level === level) || STREAK_LEVELS[0],
    [level],
  );

  const nextLevelData = useMemo(() => {
    const idx = STREAK_LEVELS.findIndex((l) => l.level === level);
    return idx < STREAK_LEVELS.length - 1 ? STREAK_LEVELS[idx + 1] : null;
  }, [level]);

  const progressToNextLevel = useMemo(() => {
    if (!nextLevelData) return 100;
    const currentMin = currentLevelData.minDays;
    const nextMin = nextLevelData.minDays;
    return Math.min(
      100,
      ((currentStreak - currentMin) / (nextMin - currentMin)) * 100,
    );
  }, [currentStreak, currentLevelData, nextLevelData]);

  const weekDayLabels =
    lang === "bn"
      ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrevMonth}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h3 className="text-lg font-semibold">{getMonthLabel()}</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNextMonth}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDayLabels.map((day) => (
            <div key={day} className="text-center text-xs text-white/50 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.01 }}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                cell.day === null
                  ? ""
                  : cell.isStreak
                    ? "text-white font-bold"
                    : cell.isToday
                      ? "border-2 border-white/50 text-white"
                      : "text-white/40"
              }`}
              style={
                cell.isStreak
                  ? {
                      background: `linear-gradient(135deg, ${getHeatmapColor(currentStreak)}, ${getHeatmapColor(currentStreak)}80)`,
                    }
                  : undefined
              }
            >
              {cell.day}
              {cell.isStreak && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/80" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-white/50">
            {lang === "bn" ? "কম" : "Less"}
          </span>
          {[0, 3, 7, 14, 30, 60, 100].map((days) => (
            <div
              key={days}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: getHeatmapColor(days) }}
            />
          ))}
          <span className="text-xs text-white/50">
            {lang === "bn" ? "বেশি" : "More"}
          </span>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          {lang === "bn" ? "লেভেল অগ্রগতি" : "Level Progress"}
        </h3>

        <div className="space-y-4">
          {STREAK_LEVELS.map((lvl) => {
            const LevelIcon = lvl.icon;
            const isActive = lvl.level === level;
            const isCompleted = currentStreak >= lvl.minDays;
            return (
              <div
                key={lvl.level}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-white/15 ring-2"
                    : isCompleted
                      ? "bg-white/5"
                      : "bg-white/5 opacity-50"
                }`}
                style={isActive ? { ringColor: lvl.color } : undefined}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: isCompleted
                      ? `linear-gradient(135deg, ${lvl.color}, ${lvl.color}80)`
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  {isCompleted ? (
                    <LevelIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lvl.nameBn}</span>
                    <span className="text-xs text-white/50">
                      {lang === "bn"
                        ? `${lvl.minDays}+ দিন`
                        : `${lvl.minDays}+ days`}
                    </span>
                  </div>
                  {isActive && nextLevelData && (
                    <div className="mt-2">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNextLevel}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: lvl.color }}
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {currentStreak}/{nextLevelData.minDays}{" "}
                        {lang === "bn" ? "দিন" : "days"}
                      </p>
                    </div>
                  )}
                </div>
                {isCompleted && <Check className="w-5 h-5 text-green-400" />}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-white/5">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles
              className="w-4 h-4"
              style={{ color: currentLevelData.color }}
            />
            {lang === "bn" ? "আপনার সুবিধা" : "Your Benefits"}
          </h4>
          <div className="space-y-2">
            {LEVEL_BENEFITS[level]?.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                {lang === "bn" ? benefit.bn : benefit.en}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-yellow-400" />
          {lang === "bn" ? "মাইলস্টোন" : "Milestones"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MILESTONES.map((milestone) => {
            const achieved = currentStreak >= milestone.days;
            return (
              <motion.div
                key={milestone.days}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl text-center ${
                  achieved
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ring-1 ring-yellow-500/30"
                    : "bg-white/5 opacity-50"
                }`}
              >
                {achieved ? (
                  <PartyPopper className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                ) : (
                  <Lock className="w-8 h-8 mx-auto mb-2 text-white/30" />
                )}
                <p className="text-sm font-medium">
                  {lang === "bn" ? milestone.labelBn : milestone.label}
                </p>
                <p className="text-xs text-white/50">
                  {lang === "bn"
                    ? `${milestone.days} দিন`
                    : `${milestone.days} days`}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
