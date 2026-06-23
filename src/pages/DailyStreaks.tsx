import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  Flame,
  Calendar,
  Trophy,
  Gift,
  Users,
  Star,
  Check,
  PartyPopper,
  History,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  CalendarTab,
  RewardsTab,
  LeaderboardTab,
  HistoryTab,
  SettingsTab,
} from "@/components/daily-streaks";
import {
  fadeUp,
  stagger,
  STREAK_LEVELS,
  MILESTONES,
  DEFAULT_REWARDS,
  type StreakDay,
  type Reward,
  type LeaderboardEntry,
  type StreakHistory,
  type Milestone,
} from "@/components/daily-streaks/types";

export default function DailyStreaks() {
  const { lang } = useLang();
  const [currentStreak, setCurrentStreak] = useState(12);
  const [longestStreak] = useState(28);
  const [points, setPoints] = useState(480);
  const [level] = useState("silver");
  const [freezeTokens, setFreezeTokens] = useState(3);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [ownedRewards, setOwnedRewards] = useState<string[]>(["r4"]);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "rewards" | "leaderboard" | "history" | "settings"
  >("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMilestone, setShowMilestone] = useState<Milestone | null>(null);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [showRewardModal, setShowRewardModal] = useState<Reward | null>(null);
  const [redeemAnimation, setRedeemAnimation] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const currentLevelData = useMemo(
    () => STREAK_LEVELS.find((l) => l.level === level) || STREAK_LEVELS[0],
    [level],
  );

  const streakDays = useMemo<StreakDay[]>(() => {
    const days: StreakDay[] = [];
    const today = new Date();
    for (let i = 0; i < currentStreak; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        completed: true,
        pointsEarned: 10,
      });
    }
    return days;
  }, [currentStreak]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: { day: number | null; isStreak: boolean; isToday: boolean }[] =
      [];
    const today = new Date();

    for (let i = 0; i < startDay; i++) {
      cells.push({ day: null, isStreak: false, isToday: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isStreak = streakDays.some((sd) => sd.date === dateStr);
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === d;
      cells.push({ day: d, isStreak, isToday });
    }

    return cells;
  }, [currentMonth, streakDays]);

  const streakHistory = useMemo<StreakHistory[]>(
    () => [
      {
        id: "h1",
        startDate: "2025-12-01",
        endDate: "2025-12-28",
        days: 28,
        level: "silver",
        pointsEarned: 280,
      },
      {
        id: "h2",
        startDate: "2025-10-15",
        endDate: "2025-10-29",
        days: 15,
        level: "gold",
        pointsEarned: 150,
      },
      {
        id: "h3",
        startDate: "2025-08-01",
        endDate: "2025-08-03",
        days: 3,
        level: "bronze",
        pointsEarned: 30,
      },
    ],
    [],
  );

  const leaderboard = useMemo<LeaderboardEntry[]>(
    () => [
      {
        rank: 1,
        name: "Rahim Ahmed",
        streak: 45,
        level: "gold",
        isCurrentUser: false,
      },
      {
        rank: 2,
        name: "Karim Hassan",
        streak: 38,
        level: "gold",
        isCurrentUser: false,
      },
      {
        rank: 3,
        name: lang === "bn" ? "আপনি" : "You",
        streak: currentStreak,
        level: level,
        isCurrentUser: true,
      },
      {
        rank: 4,
        name: "Fatima Begum",
        streak: 10,
        level: "silver",
        isCurrentUser: false,
      },
      {
        rank: 5,
        name: "Nadia Khan",
        streak: 7,
        level: "silver",
        isCurrentUser: false,
      },
      {
        rank: 6,
        name: "Sakib Rahman",
        streak: 5,
        level: "bronze",
        isCurrentUser: false,
      },
      {
        rank: 7,
        name: "Tasnim Ahmed",
        streak: 3,
        level: "bronze",
        isCurrentUser: false,
      },
    ],
    [currentStreak, level, lang],
  );

  const totalPointsEarned = useMemo(
    () => streakDays.reduce((sum, d) => sum + d.pointsEarned, 0),
    [streakDays],
  );

  const checkMilestone = useCallback((streak: number) => {
    const milestone = MILESTONES.find(
      (m) => m.days === streak && !m.celebrated,
    );
    if (milestone) {
      setShowMilestone(milestone);
      milestone.celebrated = true;
    }
  }, []);

  const handleMarkToday = () => {
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    setPoints((p) => p + 10);
    checkMilestone(newStreak);
  };

  const handleUseFreeze = () => {
    if (freezeTokens > 0) {
      setFreezeTokens((t) => t - 1);
    }
  };

  const handleRedeemReward = (reward: Reward) => {
    if (points >= reward.cost && !ownedRewards.includes(reward.id)) {
      setShowRewardModal(reward);
    }
  };

  const confirmRedeem = (reward: Reward) => {
    setPoints((p) => p - reward.cost);
    setOwnedRewards((prev) => [...prev, reward.id]);
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, unlocked: true } : r)),
    );
    setRedeemAnimation(true);
    setTimeout(() => setRedeemAnimation(false), 2000);
    setShowRewardModal(null);
  };

  const getMonthLabel = () => {
    return currentMonth.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const tabs = [
    {
      id: "calendar" as const,
      label: lang === "bn" ? "ক্যালেন্ডার" : "Calendar",
      icon: Calendar,
    },
    {
      id: "rewards" as const,
      label: lang === "bn" ? "পুরস্কার" : "Rewards",
      icon: Gift,
    },
    {
      id: "leaderboard" as const,
      label: lang === "bn" ? "লিডারবোর্ড" : "Leaderboard",
      icon: Users,
    },
    {
      id: "history" as const,
      label: lang === "bn" ? "ইতিহাস" : "History",
      icon: History,
    },
    {
      id: "settings" as const,
      label: lang === "bn" ? "সেটিংস" : "Settings",
      icon: Settings,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen p-4 md:p-6 space-y-6"
    >
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {lang === "bn"
              ? "দৈনিক স্ট্রিক ও পুরস্কার"
              : "Daily Streaks & Rewards"}
          </h1>
        </div>
        <p className="text-white/60 text-sm">
          {lang === "bn"
            ? "আপনার অভ্যাস ট্র্যাক করুন এবং পুরস্কার অর্জন করুন"
            : "Track your habits and earn rewards"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative inline-block">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${currentLevelData.color}40, ${currentLevelData.color}10)`,
                  border: `3px solid ${currentLevelData.color}`,
                }}
              >
                <div className="text-center">
                  <Flame
                    className="w-6 h-6 mx-auto mb-1"
                    style={{ color: currentLevelData.color }}
                  />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: currentLevelData.color }}
                  >
                    {currentStreak}
                  </span>
                </div>
              </motion.div>
              {currentStreak >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: currentLevelData.color }}
                >
                  {currentLevelData.icon && (
                    <currentLevelData.icon className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              )}
            </div>
            <p className="mt-2 text-white/60 text-sm">
              {lang === "bn" ? "বর্তমান স্ট্রিক" : "Current Streak"}
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 rounded-xl bg-white/5">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{currentLevelData.nameBn}</p>
              <p className="text-white/60 text-sm">
                {lang === "bn" ? "বর্তমান লেভেল" : "Current Level"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="p-4 rounded-xl bg-white/5">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold">{points}</p>
              <p className="text-white/60 text-sm">
                {lang === "bn" ? "পয়েন্ট অর্জিত" : "Points Earned"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkToday}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
          >
            <Check className="w-5 h-5" />
            {lang === "bn" ? "আজকের কাজ চিহ্নিত করুন" : "Mark Today"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseFreeze}
            disabled={freezeTokens === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50"
          >
            <Gift className="w-5 h-5" />
            {lang === "bn"
              ? `ফ্রিজ (${freezeTokens})`
              : `Freeze (${freezeTokens})`}
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "calendar" && (
          <CalendarTab
            currentStreak={currentStreak}
            level={level}
            currentMonth={currentMonth}
            streakDays={streakDays}
            calendarDays={calendarDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            getMonthLabel={getMonthLabel}
          />
        )}

        {activeTab === "rewards" && (
          <RewardsTab
            points={points}
            totalPointsEarned={totalPointsEarned}
            rewards={rewards}
            ownedRewards={ownedRewards}
            filterCategory={filterCategory}
            onFilterChange={setFilterCategory}
            onRedeem={handleRedeemReward}
          />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} />
        )}

        {activeTab === "history" && (
          <HistoryTab
            longestStreak={longestStreak}
            streakHistory={streakHistory}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            reminderTime={reminderTime}
            freezeTokens={freezeTokens}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            totalPointsEarned={totalPointsEarned}
            ownedRewardsCount={ownedRewards.length}
            onReminderTimeChange={setReminderTime}
            onUseFreeze={handleUseFreeze}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <PartyPopper className="w-16 h-16 mx-auto text-yellow-400" />
              </motion.div>
              <h3 className="text-xl font-bold mt-4 mb-2">
                {lang === "bn" ? "অভিনন্দন!" : "Congratulations!"}
              </h3>
              <p className="text-white/70 mb-4">
                {lang === "bn" ? showMilestone.labelBn : showMilestone.label}
              </p>
              <div className="flex gap-2 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMilestone(null)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                >
                  {lang === "bn" ? "ধন্যবাদ!" : "Thank You!"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRewardModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={
                  redeemAnimation
                    ? { scale: [1, 1.5, 1], rotate: [0, 360] }
                    : {}
                }
                transition={{ duration: 0.8 }}
              >
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                  {showRewardModal.icon && (
                    <showRewardModal.icon className="w-8 h-8 text-purple-400" />
                  )}
                </div>
              </motion.div>
              <h3 className="text-xl font-bold mt-4 mb-2">
                {lang === "bn" ? "পুরস্কার রিডিম করুন" : "Redeem Reward"}
              </h3>
              <p className="text-white/70 mb-1">{showRewardModal.name}</p>
              <p className="text-sm text-white/50 mb-4">
                {showRewardModal.description}
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{showRewardModal.cost}</span>
                <span className="text-white/50 text-sm">
                  {lang === "bn" ? "পয়েন্ট" : "points"}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRewardModal(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 font-medium"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => confirmRedeem(showRewardModal)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                >
                  {lang === "bn" ? "নিশ্চিত করুন" : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {redeemAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 2 }}
            >
              <div className="text-center">
                <Sparkles className="w-24 h-24 text-yellow-400 mx-auto" />
                <p className="text-2xl font-bold text-white mt-4">
                  {lang === "bn"
                    ? "সফলভাবে রিডিম হয়েছে!"
                    : "Successfully Redeemed!"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
