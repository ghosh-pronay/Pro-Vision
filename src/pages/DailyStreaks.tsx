import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  Flame,
  Calendar,
  Trophy,
  Gift,
  Snowflake,
  Users,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  Star,
  Award,
  Crown,
  Shield,
  Gem,
  Medal,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  PartyPopper,
  History,
  Bell,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Heart,
  ShoppingBag,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Bookmark,
  Palette,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadgeCheck,
  UserCircle,
  Diamond,
  Settings,
} from "lucide-react";

interface StreakDay {
  date: string;
  completed: boolean;
  pointsEarned: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  category: string;
  unlocked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  streak: number;
  level: string;
  isCurrentUser: boolean;
}

interface StreakHistory {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  level: string;
  pointsEarned: number;
}

interface Milestone {
  days: number;
  label: string;
  labelBn: string;
  celebrated: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const STREAK_LEVELS = [
  {
    level: "bronze",
    nameEn: "Bronze",
    nameBn: "ব্রোঞ্জ",
    minDays: 3,
    color: "#cd7f32",
    icon: Medal,
  },
  {
    level: "silver",
    nameEn: "Silver",
    nameBn: "রূপা",
    minDays: 7,
    color: "#c0c0c0",
    icon: Shield,
  },
  {
    level: "gold",
    nameEn: "Gold",
    nameBn: "সোনা",
    minDays: 14,
    color: "#ffd700",
    icon: Award,
  },
  {
    level: "platinum",
    nameEn: "Platinum",
    nameBn: "প্লাটিনাম",
    minDays: 30,
    color: "#e5e4e2",
    icon: Gem,
  },
  {
    level: "diamond",
    nameEn: "Diamond",
    nameBn: "হীরা",
    minDays: 60,
    color: "#b9f2ff",
    icon: Diamond,
  },
  {
    level: "crown",
    nameEn: "Crown",
    nameBn: "মুকুট",
    minDays: 100,
    color: "#9d00ff",
    icon: Crown,
  },
];

const LEVEL_BENEFITS: Record<string, { en: string; bn: string }[]> = {
  bronze: [
    { en: "Basic streak tracking", bn: "মৌলিক স্ট্রিক ট্র্যাকিং" },
    { en: "1 freeze token per week", bn: "প্রতি সপ্তাহে ১টি ফ্রিজ টোকেন" },
    { en: "Bronze badge", bn: "ব্রোঞ্জ ব্যাজ" },
  ],
  silver: [
    { en: "Advanced analytics", bn: "উন্নত অ্যানালিটিক্স" },
    { en: "2 freeze tokens per week", bn: "প্রতি সপ্তাহে ২টি ফ্রিজ টোকেন" },
    { en: "Silver badge & profile frame", bn: "রূপা ব্যাজ ও প্রোফাইল ফ্রেম" },
  ],
  gold: [
    { en: "Custom streak themes", bn: "কাস্টম স্ট্রিক থিম" },
    { en: "3 freeze tokens per week", bn: "প্রতি সপ্তাহে ৩টি ফ্রিজ টোকেন" },
    { en: "Gold badge & profile frame", bn: "সোনা ব্যাজ ও প্রোফাইল ফ্রেম" },
  ],
  platinum: [
    { en: "Priority support", bn: "অগ্রাধিকার সহায়তা" },
    { en: "4 freeze tokens per week", bn: "প্রতি সপ্তাহে ৪টি ফ্রিজ টোকেন" },
    {
      en: "Platinum badge & animated frame",
      bn: "প্লাটিনাম ব্যাজ ও অ্যানিমেটেড ফ্রেম",
    },
  ],
  diamond: [
    { en: "Exclusive rewards", bn: "একচেটিয়া পুরস্কার" },
    { en: "5 freeze tokens per week", bn: "প্রতি সপ্তাহে ৫টি ফ্রিজ টোকেন" },
    { en: "Diamond badge & special effects", bn: "হীরা ব্যাজ ও বিশেষ ইফেক্ট" },
  ],
  crown: [
    { en: "All benefits unlocked", bn: "সমস্ত সুবিধা আনলক" },
    { en: "Unlimited freeze tokens", bn: "অসীমিত ফ্রিজ টোকেন" },
    {
      en: "Crown badge & legendary status",
      bn: "মুকুট ব্যাজ ও কিংবদন্তী মর্যাদা",
    },
  ],
};

const MILESTONES: Milestone[] = [
  {
    days: 3,
    label: "3-Day Streak!",
    labelBn: "৩ দিনের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 7,
    label: "1 Week Streak!",
    labelBn: "১ সপ্তাহের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 14,
    label: "2 Week Streak!",
    labelBn: "২ সপ্তাহের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 30,
    label: "1 Month Streak!",
    labelBn: "১ মাসের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 60,
    label: "2 Month Streak!",
    labelBn: "২ মাসের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 100,
    label: "100 Day Legend!",
    labelBn: "১০০ দিনের কিংবদন্তী!",
    celebrated: false,
  },
];

const DEFAULT_REWARDS: Reward[] = [
  {
    id: "r1",
    name: "Ocean Theme",
    description: "Cool ocean blue theme",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r2",
    name: "Sunset Theme",
    description: "Warm sunset colors",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r3",
    name: "Forest Theme",
    description: "Natural forest green",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r4",
    name: "Explorer Badge",
    description: "Special explorer badge",
    cost: 50,
    icon: Award,
    category: "badge",
    unlocked: false,
  },
  {
    id: "r5",
    name: "Champion Badge",
    description: "Champion achievement badge",
    cost: 75,
    icon: Trophy,
    category: "badge",
    unlocked: false,
  },
  {
    id: "r6",
    name: "Golden Frame",
    description: "Golden profile frame",
    cost: 150,
    icon: UserCircle,
    category: "profile",
    unlocked: false,
  },
  {
    id: "r7",
    name: "Neon Frame",
    description: "Neon glow profile frame",
    cost: 200,
    icon: UserCircle,
    category: "profile",
    unlocked: false,
  },
  {
    id: "r8",
    name: "Advanced Stats",
    description: "Unlock advanced analytics",
    cost: 300,
    icon: TrendingUp,
    category: "premium",
    unlocked: false,
  },
  {
    id: "r9",
    name: "Custom Reminders",
    description: "Customizable reminder system",
    cost: 250,
    icon: Bell,
    category: "premium",
    unlocked: false,
  },
  {
    id: "r10",
    name: "Streak Shield",
    description: "Extra freeze token pack",
    cost: 120,
    icon: Snowflake,
    category: "powerup",
    unlocked: false,
  },
];

export default function DailyStreaks() {
  const { lang } = useLang();
  const [currentStreak, setCurrentStreak] = useState(12);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [longestStreak, setLongestStreak] = useState(28);
  const [points, setPoints] = useState(480);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [level, setLevel] = useState("silver");
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

  const nextLevelData = useMemo(() => {
    const idx = STREAK_LEVELS.findIndex((l) => l.level === level);
    return idx < STREAK_LEVELS.length - 1 ? STREAK_LEVELS[idx + 1] : null;
  }, [level]);

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

  const filteredRewards = useMemo(() => {
    if (filterCategory === "all") return rewards;
    return rewards.filter((r) => r.category === filterCategory);
  }, [rewards, filterCategory]);

  const progressToNextLevel = useMemo(() => {
    if (!nextLevelData) return 100;
    const currentMin = currentLevelData.minDays;
    const nextMin = nextLevelData.minDays;
    return Math.min(
      100,
      ((currentStreak - currentMin) / (nextMin - currentMin)) * 100,
    );
  }, [currentStreak, currentLevelData, nextLevelData]);

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

  const getHeatmapColor = (streak: number) => {
    if (streak >= 100) return "#9d00ff";
    if (streak >= 60) return "#b9f2ff";
    if (streak >= 30) return "#e5e4e2";
    if (streak >= 14) return "#ffd700";
    if (streak >= 7) return "#c0c0c0";
    if (streak >= 3) return "#cd7f32";
    return "rgba(255,255,255,0.1)";
  };

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

  const weekDayLabels =
    lang === "bn"
      ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const rewardCategories = [
    { id: "all", label: lang === "bn" ? "সব" : "All", icon: ShoppingBag },
    { id: "theme", label: lang === "bn" ? "থিম" : "Themes", icon: Palette },
    { id: "badge", label: lang === "bn" ? "ব্যাজ" : "Badges", icon: Award },
    {
      id: "profile",
      label: lang === "bn" ? "প্রোফাইল" : "Profile",
      icon: UserCircle,
    },
    {
      id: "premium",
      label: lang === "bn" ? "প্রিমিয়াম" : "Premium",
      icon: Star,
    },
    {
      id: "powerup",
      label: lang === "bn" ? "পাওয়ারআপ" : "Power-ups",
      icon: Zap,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen p-4 md:p-6 space-y-6"
    >
      {/* Header */}
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

      {/* Current Streak Card */}
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

        {/* Action Buttons */}
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
            <Snowflake className="w-5 h-5" />
            {lang === "bn"
              ? `ফ্রিজ (${freezeTokens})`
              : `Freeze (${freezeTokens})`}
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
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

      {/* Calendar Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Streak Calendar */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <h3 className="text-lg font-semibold">{getMonthLabel()}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDayLabels.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-white/50 py-1"
                  >
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

              {/* Heatmap Legend */}
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

            {/* Level Progress */}
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
                      {isCompleted && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current Level Benefits */}
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

            {/* Milestones */}
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
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Points Summary */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">
                    {lang === "bn" ? "উপলব্ধ পয়েন্ট" : "Available Points"}
                  </p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    {points}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">
                    {lang === "bn" ? "মোট অর্জিত" : "Total Earned"}
                  </p>
                  <p className="text-xl font-semibold">{totalPointsEarned}</p>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="glass rounded-2xl p-2">
              <div className="flex gap-2 overflow-x-auto">
                {rewardCategories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      filterCategory === cat.id
                        ? "bg-white/20 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRewards.map((reward, idx) => {
                const isOwned = ownedRewards.includes(reward.id);
                const canAfford = points >= reward.cost;
                const RewardIcon = reward.icon;
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className={`glass rounded-xl p-4 ${isOwned ? "ring-1 ring-green-500/30" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <RewardIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-sm text-white/50 truncate">
                          {reward.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400" />
                            {reward.cost}
                          </span>
                          {isOwned ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {lang === "bn" ? "অর্জিত" : "Owned"}
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRedeemReward(reward)}
                              disabled={!canAfford}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                                canAfford
                                  ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                                  : "bg-white/5 text-white/30 cursor-not-allowed"
                              }`}
                            >
                              {lang === "bn" ? "রিডিম" : "Redeem"}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
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
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Best Streak */}
            <div className="glass rounded-2xl p-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                <p className="text-3xl font-bold">{longestStreak}</p>
                <p className="text-white/60">
                  {lang === "bn" ? "দীর্ঘতম স্ট্রিক" : "Longest Streak"}
                </p>
              </div>
            </div>

            {/* Streak History */}
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
                          {formatDate(entry.startDate)} -{" "}
                          {formatDate(entry.endDate)}
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
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Reminder Settings */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                {lang === "bn" ? "দৈনিক রিমাইন্ডার" : "Daily Reminder"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">
                      {lang === "bn" ? "রিমাইন্ডার সময়" : "Reminder Time"}
                    </p>
                    <p className="text-sm text-white/50">
                      {lang === "bn"
                        ? "প্রতিদিন রিমাইন্ডার পান"
                        : "Get reminded daily"}
                    </p>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">
                      {lang === "bn" ? "রিমাইন্ডার সক্রিয়" : "Reminder Active"}
                    </p>
                    <p className="text-sm text-white/50">
                      {lang === "bn"
                        ? "নির্ধারিত সময়ে নোটিফিকেশন পান"
                        : "Get notified at set time"}
                    </p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-purple-500 relative cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Freeze */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-400" />
                {lang === "bn" ? "স্ট্রিক ফ্রিজ" : "Streak Freeze"}
              </h3>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">
                      {lang === "bn" ? "ফ্রিজ টোকেন" : "Freeze Tokens"}
                    </p>
                    <p className="text-sm text-white/50">
                      {lang === "bn"
                        ? "স্ট্রিক রক্ষা করতে ফ্রিজ ব্যবহার করুন"
                        : "Use freeze to protect your streak"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-5 h-5 text-cyan-400" />
                    <span className="text-xl font-bold">{freezeTokens}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUseFreeze}
                    disabled={freezeTokens === 0}
                    className="flex-1 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium disabled:opacity-50"
                  >
                    {lang === "bn" ? "ফ্রিজ ব্যবহার করুন" : "Use Freeze"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white/70 text-sm font-medium"
                  >
                    {lang === "bn" ? "আরও কিনুন" : "Buy More"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                {lang === "bn" ? "পরিসংখ্যান" : "Statistics"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    {currentStreak}
                  </p>
                  <p className="text-xs text-white/50">
                    {lang === "bn" ? "বর্তমান স্ট্রিক" : "Current"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {longestStreak}
                  </p>
                  <p className="text-xs text-white/50">
                    {lang === "bn" ? "দীর্ঘতম" : "Longest"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {totalPointsEarned}
                  </p>
                  <p className="text-xs text-white/50">
                    {lang === "bn" ? "মোট পয়েন্ট" : "Total Points"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {ownedRewards.length}
                  </p>
                  <p className="text-xs text-white/50">
                    {lang === "bn" ? "পুরস্কার" : "Rewards"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Celebration Modal */}
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
      </AnimatePresence>

      {/* Reward Redemption Modal */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Redeem Success Animation */}
      <AnimatePresence>
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
