import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Leaf,
  Plus,
  Trash2,
  Car,
  Beef,
  Zap,
  ShoppingCart,
  TreePine,
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Share2,
  RotateCcw,
  Lightbulb,
  X,
} from "lucide-react";

/* ──────── Types ──────── */

interface CarbonLog {
  id: string;
  category: "transport" | "food" | "energy" | "shopping";
  subCategory: string;
  amount: number;
  unit: string;
  carbonKg: number;
  date: number;
  note?: string;
}

/* ──────── Constants ──────── */

const CARBON_FACTORS = {
  transport: {
    car: 0.21,
    bus: 0.089,
    train: 0.041,
    rickshaw: 0,
    motorcycle: 0.103,
  },
  food: {
    meat: 27,
    fish: 6.1,
    vegetables: 2,
    rice: 4,
    dairy: 3.2,
  },
  energy: {
    electricity: 0.5,
    gas: 2.5,
  },
  shopping: {
    clothing: 10,
    electronics: 50,
  },
};

const TRANSPORT_MODES = [
  { key: "car", icon: "🚗", unit: "km", factor: CARBON_FACTORS.transport.car },
  { key: "bus", icon: "🚌", unit: "km", factor: CARBON_FACTORS.transport.bus },
  {
    key: "train",
    icon: "🚆",
    unit: "km",
    factor: CARBON_FACTORS.transport.train,
  },
  {
    key: "rickshaw",
    icon: "🛺",
    unit: "km",
    factor: CARBON_FACTORS.transport.rickshaw,
  },
  {
    key: "motorcycle",
    icon: "🏍️",
    unit: "km",
    factor: CARBON_FACTORS.transport.motorcycle,
  },
];

const FOOD_ITEMS = [
  { key: "meat", icon: "🥩", unit: "kg", factor: CARBON_FACTORS.food.meat },
  { key: "fish", icon: "🐟", unit: "kg", factor: CARBON_FACTORS.food.fish },
  {
    key: "vegetables",
    icon: "🥬",
    unit: "kg",
    factor: CARBON_FACTORS.food.vegetables,
  },
  { key: "rice", icon: "🍚", unit: "kg", factor: CARBON_FACTORS.food.rice },
  { key: "dairy", icon: "🥛", unit: "kg", factor: CARBON_FACTORS.food.dairy },
];

const ENERGY_ITEMS = [
  {
    key: "electricity",
    icon: "⚡",
    unit: "kWh",
    factor: CARBON_FACTORS.energy.electricity,
  },
  { key: "gas", icon: "🔥", unit: "m³", factor: CARBON_FACTORS.energy.gas },
];

const SHOPPING_ITEMS = [
  {
    key: "clothing",
    icon: "👕",
    unit: "item",
    factor: CARBON_FACTORS.shopping.clothing,
  },
  {
    key: "electronics",
    icon: "💻",
    unit: "item",
    factor: CARBON_FACTORS.shopping.electronics,
  },
];

const TREES_PER_KG_PER_YEAR = 21;
const AVG_BANGLADESHI_ANNUAL_TONS = 1.5;

const ECO_TIPS_EN = [
  "Use public transport instead of private car to reduce 60% of transport emissions.",
  "Eat more vegetables and less meat – beef produces 13x more CO2 than vegetables.",
  "Switch to LED bulbs – they use 75% less energy than incandescent bulbs.",
  "Walk or cycle for trips under 3 km to save both carbon and health.",
  "Air dry clothes instead of using a dryer to save up to 2.5 kg CO2 per load.",
  "Unplug electronics when not in use – phantom loads add up to 10% of energy bills.",
  "Buy local and seasonal produce to reduce transport emissions.",
  "Reduce food waste – rotting food in landfills produces methane, a potent greenhouse gas.",
  "Use a reusable water bottle instead of plastic ones to reduce waste.",
  "Plant trees in your community – one tree absorbs 21 kg of CO2 per year.",
];

const ECO_TIPS_BN = [
  "বেসরকারি গাড়ির বদলে পাবলিক ট্রান্সপোর্ট ব্যবহার করুন – ট্রান্সপোর্টের কার্বন ৬০% কমান।",
  "বেশি সবজি এবং কম মাংস খান – গরুর মাংস সবজির তুলনায় ১৩ গুণ বেশি CO₂ তৈরি করে।",
  "LED বাল্ব ব্যবহার করুন – এগুলো ইনকান্ডেসেন্ট বাল্বের তুলনায় ৭৫% কম বিদ্যুৎ খরচ করে।",
  "৩ কিমির কম দূরত্বে হাঁটুন বা সাইকেল চালান – স্বাস্থ্য ও পরিবেশ উভয়ের জন্য ভালো।",
  "কাপড় শুকাতে ড্রায়ারের বদলে হাওয়ায় শুকান – প্রতি লোডে ২.৫ কেজি CO₂ বাঁচান।",
  "ব্যবহার না হলে ইলেকট্রনিক্স আনপ্লাগ করুন – ফ্যান্টম লোড বিদ্যুৎ বিলের ১০% পর্যন্ত হতে পারে।",
  "স্থানীয় ও মৌসুমি খাবার কিনুন – ট্রান্সপোর্টের কার্বন কমাতে সাহায্য করে।",
  "খাবারের অপচয় কমান – ল্যান্ডফিলে পচনশীল খাবার মিথেন তৈরি করে।",
  "প্লাস্টিক বোতলের বদলে রিইউজেবল পানির বোতল ব্যবহার করুন।",
  "আপনার এলাকায় গাছ লাগান – একটি গাছ বছরে ২১ কেজি CO₂ শোষণ করে।",
];

const ACHIEVEMENTS = [
  {
    id: "first-log",
    threshold: 1,
    type: "count",
    icon: "🌱",
    title: "First Step",
    titleBn: "প্রথম পদক্ষেপ",
    desc: "Log your first carbon activity",
    descBn: "আপনার প্রথম কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "10-logs",
    threshold: 10,
    type: "count",
    icon: "🌿",
    title: "Eco Explorer",
    titleBn: "ইকো অনুসন্ধানকারী",
    desc: "Log 10 carbon activities",
    descBn: "১০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "50-logs",
    threshold: 50,
    type: "count",
    icon: "🌳",
    title: "Green Warrior",
    titleBn: "সবুজ যোদ্ধা",
    desc: "Log 50 carbon activities",
    descBn: "৫০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "100-logs",
    threshold: 100,
    type: "count",
    icon: "🏆",
    title: "Carbon Champion",
    titleBn: "কার্বন চ্যাম্পিয়ন",
    desc: "Log 100 carbon activities",
    descBn: "১০০টি কার্বন কার্যকলাপ লগ করুন",
  },
  {
    id: "below-avg",
    threshold: 1,
    type: "days-below-avg",
    icon: "⭐",
    title: "Below Average",
    titleBn: "গড়ের নিচে",
    desc: "Stay below Bangladesh daily average",
    descBn: "বাংলাদেশের দৈনিক গড়ের নিচে থাকুন",
  },
  {
    id: "zero-day",
    threshold: 1,
    type: "zero-days",
    icon: "🎯",
    title: "Zero Carbon Day",
    titleBn: "শূন্য কার্বন দিন",
    desc: "Complete a zero-carbon day",
    descBn: "একটি শূন্য-কার্বন দিন সম্পন্ন করুন",
  },
  {
    id: "weekly-goal",
    threshold: 1,
    type: "weekly-goals",
    icon: "🔥",
    title: "Goal Crusher",
    titleBn: "লক্ষ্য ভেঙে",
    desc: "Meet your weekly goal 4 times",
    descBn: "আপনার সাপ্তাহিক লক্ষ্য ৪ বার পূরণ করুন",
  },
  {
    id: "plant-tree",
    threshold: 1,
    type: "trees-earned",
    icon: "🌲",
    title: "Tree Planter",
    titleBn: "গাছ লাগানোকারী",
    desc: "Offset enough carbon to plant 1 tree",
    descBn: "১টি গাছ লাগানোর সমপরিমাণ কার্বন অফসেট করুন",
  },
];

/* ──────── Helpers ──────── */

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getDayStart(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatDay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ──────── Animations ──────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/* ──────── Component ──────── */

export default function CarbonFootprint() {
  const { lang } = useLang();

  const [dailyLogs, setDailyLogs] = useState<CarbonLog[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState<
    "transport" | "food" | "energy" | "shopping"
  >("transport");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formSubCategory, setFormSubCategory] = useState("");

  const today = useMemo(() => getDayStart(Date.now()), []);

  const getItemsForCategory = (cat: string) => {
    switch (cat) {
      case "transport":
        return TRANSPORT_MODES;
      case "food":
        return FOOD_ITEMS;
      case "energy":
        return ENERGY_ITEMS;
      case "shopping":
        return SHOPPING_ITEMS;
      default:
        return [];
    }
  };

  const todayLogs = useMemo(
    () => dailyLogs.filter((l) => getDayStart(l.date) === today),
    [dailyLogs, today],
  );

  const yesterdayLogs = useMemo(
    () => dailyLogs.filter((l) => getDayStart(l.date) === today - 86400000),
    [dailyLogs, today],
  );

  const todayTotal = useMemo(
    () => todayLogs.reduce((s, l) => s + l.carbonKg, 0),
    [todayLogs],
  );
  const yesterdayTotal = useMemo(
    () => yesterdayLogs.reduce((s, l) => s + l.carbonKg, 0),
    [yesterdayLogs],
  );

  const treesNeeded = useMemo(
    () => todayTotal / TREES_PER_KG_PER_YEAR,
    [todayTotal],
  );

  const comparisonPercent = useMemo(() => {
    if (yesterdayTotal === 0) return 0;
    return ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
  }, [todayTotal, yesterdayTotal]);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };
    todayLogs.forEach((l) => {
      cats[l.category] += l.carbonKg;
    });
    return cats;
  }, [todayLogs]);

  const maxCat = useMemo(
    () => Math.max(...Object.values(categoryBreakdown), 1),
    [categoryBreakdown],
  );

  const weeklyTrend = useMemo(() => {
    const days: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = today - i * 86400000;
      const dayLogs = dailyLogs.filter((l) => getDayStart(l.date) === dayStart);
      const total = dayLogs.reduce((s, l) => s + l.carbonKg, 0);
      days.push({ day: formatDay(dayStart), total });
    }
    return days;
  }, [dailyLogs, today]);

  const monthlyStats = useMemo(() => {
    const monthStart = today - 30 * 86400000;
    const monthLogs = dailyLogs.filter((l) => l.date >= monthStart);
    const total = monthLogs.reduce((s, l) => s + l.carbonKg, 0);
    const avg = monthLogs.length > 0 ? total / 30 : 0;
    const dailyGoalKg = monthlyGoal / 30;
    const daysOnTrack =
      monthlyLogs.filter((l) => getDayStart(l.date) === today).length > 0
        ? todayTotal <= dailyGoalKg
        : false;
    return {
      total: total.toFixed(1),
      avg: avg.toFixed(1),
      daysOnTrack,
      dailyGoalKg,
    };
  }, [dailyLogs, today, monthlyGoal, todayTotal]);

  const monthlyReductionPercent = useMemo(() => {
    if (yesterdayTotal === 0 && todayTotal === 0) return 0;
    const monthlyAvg = parseFloat(monthlyStats.avg);
    if (monthlyAvg === 0) return 0;
    const dailyGoalKg = monthlyGoal / 30;
    return Math.max(0, ((monthlyAvg - dailyGoalKg) / monthlyAvg) * 100);
  }, [todayTotal, yesterdayTotal, monthlyStats.avg, monthlyGoal]);

  const avgBangladeshiDaily = useMemo(
    () => (AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 365,
    [],
  );

  const earnedAchievements = useMemo(() => {
    const totalLogs = dailyLogs.length;
    const zeroDays = new Set(
      dailyLogs.filter((l) => l.carbonKg === 0).map((l) => getDayStart(l.date)),
    ).size;
    const daysBelowAvg = new Set(
      dailyLogs
        .filter((l) => {
          const dayStart = getDayStart(l.date);
          const dayTotal = dailyLogs
            .filter((dl) => getDayStart(dl.date) === dayStart)
            .reduce((s, dl) => s + dl.carbonKg, 0);
          return dayTotal < avgBangladeshiDaily && dayTotal > 0;
        })
        .map((l) => getDayStart(l.date)),
    ).size;
    const totalOffset = dailyLogs.reduce((s, l) => s + l.carbonKg, 0);
    const treesEarned = Math.floor(totalOffset / TREES_PER_KG_PER_YEAR);

    return ACHIEVEMENTS.filter((a) => {
      switch (a.type) {
        case "count":
          return totalLogs >= a.threshold;
        case "days-below-avg":
          return daysBelowAvg >= a.threshold;
        case "zero-days":
          return zeroDays >= a.threshold;
        case "weekly-goals":
          return daysBelowAvg >= 4;
        case "trees-earned":
          return treesEarned >= a.threshold;
        default:
          return false;
      }
    });
  }, [dailyLogs, avgBangladeshiDaily]);

  const currentTip = useMemo(() => {
    const tips = lang === "bn" ? ECO_TIPS_BN : ECO_TIPS_EN;
    return tips[tipIndex % tips.length];
  }, [tipIndex, lang]);

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const handleAddLog = () => {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) return;

    const items = getItemsForCategory(selectedCategory);
    const item = items.find((i) => i.key === formSubCategory);
    if (!item) return;

    const carbonKg = amount * item.factor;

    const newLog: CarbonLog = {
      id: generateId(),
      category: selectedCategory,
      subCategory: formSubCategory,
      amount,
      unit: item.unit,
      carbonKg,
      date: Date.now(),
      note: formNote.trim() || undefined,
    };

    setDailyLogs((prev) => [newLog, ...prev]);
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteLog = (id: string) => {
    setDailyLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const resetForm = () => {
    setFormAmount("");
    setFormNote("");
    setFormSubCategory("");
  };

  const handleShare = () => {
    const text = t(
      `🌍 My carbon footprint today: ${todayTotal.toFixed(1)} kg CO₂. That's like needing ${treesNeeded.toFixed(1)} trees to offset! #CarbonFootprint #EcoWarrior`,
      `🌍 আজকের আমার কার্বন ফুটপ্রিন্ট: ${todayTotal.toFixed(1)} কেজি CO₂। এটি অফসেট করতে ${treesNeeded.toFixed(1)}টি গাছ প্রয়োজন! #কার্বনফুটপ্রিন্ট #ইকোওয়ারিয়র`,
    );
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  const categoryConfig = [
    {
      key: "transport",
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-500",
      label: t("Transport", "পরিবহন"),
    },
    {
      key: "food",
      icon: Beef,
      color: "from-orange-500 to-red-500",
      textColor: "text-orange-500",
      label: t("Food", "খাদ্য"),
    },
    {
      key: "energy",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      textColor: "text-yellow-500",
      label: t("Energy", "শক্তি"),
    },
    {
      key: "shopping",
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-500",
      label: t("Shopping", "শপিং"),
    },
  ];

  const categoryColors: Record<string, string> = {
    transport: "bg-blue-500",
    food: "bg-orange-500",
    energy: "bg-yellow-500",
    shopping: "bg-purple-500",
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-trend flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            {t("Carbon Footprint Tracker", "কার্বন ফুটপ্রিন্ট ট্র্যাকার")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "Track your daily carbon emissions and reduce your impact",
              "আপনার দৈনিক কার্বন নির্গমন ট্র্যাক করুন এবং প্রভাব কমান",
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            <Target className="h-4 w-4" />
            {t("Goal", "লক্ষ্য")}
          </button>
          <button
            onClick={handleShare}
            className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            {t("Share", "শেয়ার")}
          </button>
          <button
            onClick={() => {
              resetForm();
              setFormSubCategory(TRANSPORT_MODES[0].key);
              setShowAddModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("Log Activity", "কার্যকলাপ লগ")}
          </button>
        </div>
      </motion.div>

      {/* Today's Summary */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-1">
              {t("Today's Carbon", "আজকের কার্বন")}
            </p>
            <p className="text-4xl font-bold text-green-500">
              {todayTotal.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">kg CO₂</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("vs Yesterday", "গতকালের তুলনায়")}
            </p>
            <div className="flex items-center justify-center gap-1">
              {comparisonPercent > 0 ? (
                <>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">
                    +{comparisonPercent.toFixed(0)}%
                  </span>
                </>
              ) : comparisonPercent < 0 ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">
                    {comparisonPercent.toFixed(0)}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">
                  —
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {yesterdayTotal.toFixed(1)} kg {t("yesterday", "গতকাল")}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground mb-1">
              {t("Trees to Offset", "অফসেটের জন্য গাছ")}
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <TreePine className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold text-green-500">
                {treesNeeded.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("1 tree = 21 kg/year", "১ গাছ = ২১ কেজি/বছর")}
            </p>
          </div>
        </div>

        {/* Comparison to Average Bangladeshi */}
        <div className="mt-4 pt-4 border-t border-foreground/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {t("vs Average Bangladeshi", "গড় বাংলাদেশির তুলনায়")}
            </span>
            <span
              className={`text-sm font-medium ${todayTotal < avgBangladeshiDaily ? "text-green-500" : "text-red-500"}`}
            >
              {todayTotal < avgBangladeshiDaily
                ? t(
                    `${((1 - todayTotal / avgBangladeshiDaily) * 100).toFixed(0)}% below`,
                    `${((1 - todayTotal / avgBangladeshiDaily) * 100).toFixed(0)}% কম`,
                  )
                : t(
                    `${((todayTotal / avgBangladeshiDaily - 1) * 100).toFixed(0)}% above`,
                    `${((todayTotal / avgBangladeshiDaily - 1) * 100).toFixed(0)}% বেশি`,
                  )}
            </span>
          </div>
          <div className="relative h-3 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-green-500/30 rounded-full"
              style={{
                width: `${Math.min(100, (avgBangladeshiDaily / (avgBangladeshiDaily * 2)) * 100)}%`,
              }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (todayTotal / (avgBangladeshiDaily * 2)) * 100)}%`,
              }}
              className="absolute h-full bg-green-500 rounded-full"
            />
            <div
              className="absolute h-full w-0.5 bg-foreground/30"
              style={{
                left: `${(avgBangladeshiDaily / (avgBangladeshiDaily * 2)) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>
              {t("Avg: ", "গড়: ")}
              {avgBangladeshiDaily.toFixed(1)} kg
            </span>
            <span>{(avgBangladeshiDaily * 2).toFixed(0)} kg</span>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Carbon by Category", "বিভাগ অনুযায়ী কার্বন")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryConfig.map((cat) => {
            const CatIcon = cat.icon;
            const value = categoryBreakdown[cat.key] || 0;
            const percent = maxCat > 0 ? (value / maxCat) * 100 : 0;
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-foreground/10 p-4 hover:bg-foreground/5 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedCategory(cat.key as typeof selectedCategory);
                  setShowAddModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CatIcon className={`h-4 w-4 ${cat.textColor}`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {value.toFixed(1)} kg
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Weekly Trend", "সাপ্তাহিক প্রবণতা")}
        </h3>
        <div className="flex items-end gap-2 h-40">
          {weeklyTrend.map((day, i) => {
            const maxWeek = Math.max(...weeklyTrend.map((d) => d.total), 1);
            const height = (day.total / maxWeek) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {day.total.toFixed(1)}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`w-full rounded-t-lg ${
                    day.total <= monthlyGoal / 7
                      ? "bg-gradient-to-t from-green-600 to-green-400"
                      : "bg-gradient-to-t from-red-600 to-red-400"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {day.day.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            {t("Within goal", "লক্ষ্যের মধ্যে")}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            {t("Exceeded goal", "লক্ষ্য অতিক্রম")}
          </div>
        </div>
      </motion.div>

      {/* Quick Log Section */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Quick Log", "দ্রুত লগ")}
        </h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {categoryConfig.map((cat) => (
            <button
              key={cat.key}
              onClick={() =>
                setSelectedCategory(cat.key as typeof selectedCategory)
              }
              className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {getItemsForCategory(selectedCategory).map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setFormSubCategory(item.key);
                setShowAddModal(true);
              }}
              className="cursor-pointer rounded-xl border border-foreground/10 p-3 text-center hover:bg-foreground/5 transition-all hover:scale-105"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs font-medium mt-1 capitalize">{item.key}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.factor} kg/{item.unit}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Eco Tips */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">
              {t("Eco Tips", "ইকো টিপস")}
            </h3>
          </div>
          <button
            onClick={() => setTipIndex((i) => i + 1)}
            className="cursor-pointer p-2 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {currentTip}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Monthly Goal & Achievements */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly Goal */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-lg">
              {t("Monthly Goal", "মাসিক লক্ষ্য")}
            </h3>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-green-500">
              {monthlyStats.total} kg
            </p>
            <p className="text-sm text-muted-foreground">
              {t("of", "/")} {monthlyGoal} kg {t("goal", "লক্ষ্য")}
            </p>
          </div>
          <div className="h-4 bg-foreground/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (parseFloat(monthlyStats.total) / monthlyGoal) * 100)}%`,
              }}
              className={`h-full rounded-full ${
                parseFloat(monthlyStats.total) <= monthlyGoal
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : "bg-gradient-to-r from-red-500 to-orange-400"
              }`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("Daily avg:", "দৈনিক গড়:")} {monthlyStats.avg} kg ·{" "}
              {t("Daily goal:", "দৈনিক লক্ষ্য:")}{" "}
              {monthlyStats.dailyGoalKg.toFixed(1)} kg
            </p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">
              {t("Achievements", "অর্জন")}
            </h3>
          </div>
          {earnedAchievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t(
                "Log activities to earn eco badges!",
                "ইকো ব্যাজ অর্জনের জন্য কার্যকলাপ লগ করুন!",
              )}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {earnedAchievements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-center"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-xs font-semibold mt-1">
                    {lang === "bn" ? a.titleBn : a.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {lang === "bn" ? a.descBn : a.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's Log List */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Today's Log", "আজকের লগ")} ({todayLogs.length})
        </h3>
        {todayLogs.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="h-12 w-12 text-green-500/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t(
                "No activities logged today. Start tracking!",
                "আজ কোনো কার্যকলাপ লগ হয়নি। ট্র্যাকিং শুরু করুন!",
              )}
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {todayLogs.map((log) => (
              <motion.div
                key={log.id}
                variants={fadeUp}
                className="flex items-center justify-between rounded-xl border border-foreground/10 p-3 hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getItemsForCategory(log.category).find(
                      (i) => i.key === log.subCategory,
                    )?.icon || "📊"}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {log.subCategory}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.amount} {log.unit}
                      {log.note ? ` · ${log.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-green-500">
                    {log.carbonKg.toFixed(2)} kg
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="cursor-pointer p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t("Log Activity", "কার্যকলাপ লগ")}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer p-2 rounded-full hover:bg-foreground/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Category", "বিভাগ")}
                  </label>
                  <div className="flex gap-2">
                    {categoryConfig.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(
                            cat.key as typeof selectedCategory,
                          );
                          setFormSubCategory("");
                        }}
                        className={`cursor-pointer flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedCategory === cat.key
                            ? `bg-gradient-to-r ${cat.color} text-white`
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Type", "ধরন")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getItemsForCategory(selectedCategory).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setFormSubCategory(item.key)}
                        className={`cursor-pointer rounded-xl p-3 text-center transition-all ${
                          formSubCategory === item.key
                            ? "bg-green-500/20 border-2 border-green-500"
                            : "bg-foreground/5 border-2 border-transparent hover:bg-foreground/10"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <p className="text-xs font-medium mt-1 capitalize">
                          {item.key}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Amount (", "পরিমাণ (")}
                    {getItemsForCategory(selectedCategory).find(
                      (i) => i.key === formSubCategory,
                    )?.unit || ""}
                    {")"}
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder={t("Enter amount", "পরিমাণ লিখুন")}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  {formAmount && formSubCategory && (
                    <p className="text-xs text-green-500 mt-1">
                      ≈{" "}
                      {(
                        parseFloat(formAmount) *
                        (getItemsForCategory(selectedCategory).find(
                          (i) => i.key === formSubCategory,
                        )?.factor || 0)
                      ).toFixed(2)}{" "}
                      kg CO₂
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Note (optional)", "নোট (ঐচ্ছিক)")}
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder={t(
                      "e.g., commute to work",
                      "যেমন, কাজে যাওয়া",
                    )}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>

                <button
                  onClick={handleAddLog}
                  disabled={!formAmount || !formSubCategory}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("Add Log", "লগ যোগ করুন")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t("Set Monthly Goal", "মাসিক লক্ষ্য নির্ধারণ")}
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cursor-pointer p-2 rounded-full hover:bg-foreground/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Monthly CO₂ Goal (kg)", "মাসিক CO₂ লক্ষ্য (কেজি)")}
                  </label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) =>
                      setMonthlyGoal(parseInt(e.target.value) || 50)
                    }
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Average Bangladeshi produces",
                    "গড় বাংলাদেশি উৎপাদন করে",
                  )}{" "}
                  {(AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 12} kg{" "}
                  {t("CO₂ per month", "CO₂ প্রতি মাসে")}
                </p>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  {t("Save Goal", "লক্ষ্য সংরক্ষণ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-6 py-3 text-sm font-medium"
          >
            {t("Copied to clipboard!", "ক্লিপবোর্ডে কপি হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
