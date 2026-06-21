import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo, useState } from "react";
import {
  Calendar,
  TrendingUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  Flame,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WeeklyReview() {
  const { lang } = useLang();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - 7 * weekOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek,
      end: endOfWeek,
      tasks: { completed: 12, created: 15, completionRate: 80 },
      habits: { completed: 28, total: 35, streak: 7, bestStreak: 14 },
      focus: { sessions: 18, totalMinutes: 540, avgSession: 30 },
      mood: { avg: 3.8, greatDays: 4, goodDays: 2, okayDays: 1 },
      finance: { income: 25000, expense: 18500, saved: 6500, savingsRate: 26 },
      sleep: { avgHours: 7.2, greatNights: 3, avgQuality: "Good" },
      calories: { avg: 1850, total: 12950 },
      gratitude: { entries: 5, streak: 5 },
    };
  }, [weekOffset]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const highlights = [
    {
      title: lang === "bn" ? "সেরা দিন" : "Best Day",
      value: lang === "bn" ? "বুধবার" : "Wednesday",
      description: lang === "bn" ? "৫টি কাজ সম্পন্ন" : "5 tasks completed",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: lang === "bn" ? "দীর্ঘতম ফোকাস" : "Longest Focus",
      value: "45m",
      description: lang === "bn" ? "শনিবার" : "Saturday",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: lang === "bn" ? "স্ট্রিক" : "Habit Streak",
      value: "7",
      description: lang === "bn" ? "দিন ধারাবাহিক" : "days consistent",
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {lang === "bn" ? "সাপ্তাহিক রিভিউ" : "Weekly Review"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(weekData.start)} - {formatDate(weekData.end)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="cursor-pointer px-3 py-1 rounded-lg text-sm bg-foreground/5 hover:bg-foreground/10"
          >
            {lang === "bn" ? "পূর্ববর্তী" : "Previous"}
          </button>
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="cursor-pointer px-3 py-1 rounded-lg text-sm bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50"
          >
            {lang === "bn" ? "পরবর্তী" : "Next"}
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">{weekData.tasks.completed}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "কাজ সম্পন্ন" : "Tasks Done"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-500">+15%</span>
          </div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Target className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">
            {weekData.habits.completed}/{weekData.habits.total}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "অভ্যাস" : "Habits"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-500">80%</span>
          </div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">
            {Math.round(weekData.focus.totalMinutes / 60)}h
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "ফোকাস" : "Focus Time"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-500">+22%</span>
          </div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Flame className="h-5 w-5 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{weekData.finance.savingsRate}%</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সঞ্চয় হার" : "Savings Rate"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-500">+5%</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="glass rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 bg-foreground/5 ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">
          {lang === "bn" ? "বিস্তারিত পারফরম্যান্স" : "Detailed Performance"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {lang === "bn" ? "মনোভাব" : "Mood"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(weekData.mood.avg / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{weekData.mood.avg}/5</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {weekData.mood.greatDays} {lang === "bn" ? "দারুণ" : "great"} ·{" "}
              {weekData.mood.goodDays} {lang === "bn" ? "ভালো" : "good"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {lang === "bn" ? "ঘুম" : "Sleep"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(weekData.sleep.avgHours / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {weekData.sleep.avgHours}h
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {weekData.sleep.greatNights}{" "}
              {lang === "bn" ? "দারুণ রাত" : "great nights"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {lang === "bn" ? "আয়" : "Income"}
            </p>
            <p className="text-lg font-bold text-green-500">
              ৳{weekData.finance.income.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "খরচ" : "Spent"}: ৳
              {weekData.finance.expense.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {lang === "bn" ? "সঞ্চয়" : "Saved"}
            </p>
            <p className="text-lg font-bold text-primary">
              ৳{weekData.finance.saved.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {weekData.finance.savingsRate}%{" "}
              {lang === "bn" ? "সঞ্চয় হার" : "savings rate"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">
          {lang === "bn" ? "AI পরামর্শ" : "AI Insights"}
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn" ? "আপনি উন্নতি করেছেন!" : "You've improved!"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "গত সপ্তাহের তুলনায় আপনার পারফরম্যান্স ১৫% বেশি ভালো"
                  : "Your performance is 15% better than last week"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <Target className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn" ? "ফোকাস বাড়ান" : "Boost Focus"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "বিকেলে ৩-৫টার মধ্যে ফোকাস করলে আপনার উৎপাদনশীলতা ৩০% বাড়বে"
                  : "Focusing between 3-5 PM could boost your productivity by 30%"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <Flame className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn" ? "ঘুমের মান" : "Sleep Quality"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "রাত ১১টার আগে ঘুমালে আপনার ঘুমের মান ২৫% ভালো হয়"
                  : "Sleeping before 11 PM improves your sleep quality by 25%"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center gap-3">
        <button className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" />
          {lang === "bn" ? "রিপোর্ট ডাউনলোড" : "Download Report"}
        </button>
        <button className="cursor-pointer flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium hover:bg-foreground/5">
          <Share2 className="h-4 w-4" />
          {lang === "bn" ? "শেয়ার করুন" : "Share"}
        </button>
      </motion.div>
    </motion.div>
  );
}
