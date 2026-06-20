import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  BarChart3,
  CheckSquare,
  Target,
  Timer,
  Wallet,
  Heart,
  TrendingUp,
  Flame,
  Calendar,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

type Period = "day" | "week" | "month";

const DEMO_DATA = {
  tasks: {
    completed: { day: 5, week: 28, month: 112 },
    total: { day: 8, week: 45, month: 180 },
  },
  habits: {
    completionRate: { day: 75, week: 82, month: 78 },
    totalHabits: 6,
    currentStreak: 14,
    bestStreak: 32,
  },
  focus: {
    minutes: { day: 45, week: 320, month: 1280 },
    sessions: { day: 2, week: 14, month: 56 },
  },
  expenses: {
    categories: [
      { name: "Food", amount: 4500, color: "bg-orange-500" },
      { name: "Transport", amount: 2200, color: "bg-blue-500" },
      { name: "Shopping", amount: 3800, color: "bg-purple-500" },
      { name: "Bills", amount: 5000, color: "bg-red-500" },
      { name: "Health", amount: 1500, color: "bg-green-500" },
    ],
    total: 17000,
  },
  mood: {
    trend: [
      { day: "Mon", score: 7 },
      { day: "Tue", score: 8 },
      { day: "Wed", score: 6 },
      { day: "Thu", score: 9 },
      { day: "Fri", score: 8 },
      { day: "Sat", score: 9 },
      { day: "Sun", score: 7 },
    ],
    average: 7.7,
  },
  productivity: {
    score: 82,
    weeklyTrend: [72, 78, 75, 80, 82, 85, 82],
  },
  streaks: {
    current: 14,
    longest: 32,
    totalDays: 128,
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="glass rounded-2xl p-4 space-y-2 border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}
          >
            <Icon className="size-4 text-white" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {label}
          </span>
        </div>
        <div>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {subValue && (
            <span className="text-xs text-muted-foreground ml-2">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
}) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className={`w-full rounded-t-lg ${item.color} min-h-[4px]`}
          />
          <span className="text-[10px] text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({
  data,
}: {
  data: { name: string; amount: number; color: string }[];
}) {
  const maxAmount = Math.max(...data.map((d) => d.amount));
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="text-foreground font-medium">
              ৳{item.amount.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.amount / maxAmount) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`h-full rounded-full ${item.color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MoodTrendChart({ data }: { data: { day: string; score: number }[] }) {
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", damping: 15 }}
            className="flex items-center justify-center"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: `hsl(${item.score * 12}, 70%, 50%)`,
                color: "white",
              }}
            >
              {item.score}
            </div>
          </motion.div>
          <span className="text-[10px] text-muted-foreground">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

function ProductivityScore({
  score,
  trend,
}: {
  score: number;
  trend: number[];
}) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--pv-blue)" />
              <stop offset="100%" stopColor="var(--pv-teal)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex gap-1">
          {trend.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${(v / 100) * 40 + 4}px`,
                backgroundColor:
                  v >= 80
                    ? "var(--pv-teal)"
                    : v >= 60
                      ? "var(--pv-blue)"
                      : "var(--pv-orange)",
                opacity: 0.6 + (i / trend.length) * 0.4,
              }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">7-day trend</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { lang } = useLang();
  const [period, setPeriod] = useState<Period>("week");

  const periods: { id: Period; label: string }[] = [
    { id: "day", label: lang === "bn" ? "আজ" : "Today" },
    { id: "week", label: lang === "bn" ? "এই সপ্তাহ" : "This Week" },
    { id: "month", label: lang === "bn" ? "এই মাসে" : "This Month" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="size-6 text-[var(--pv-blue)]" />
          {lang === "bn" ? "ব্যক্তিগত অ্যানালিটিক্স" : "Personal Analytics"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার উৎপাদনশীলতার পরিসংখ্যান"
            : "Your productivity statistics"}
        </p>
      </motion.div>

      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2"
      >
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              period === p.id
                ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {p.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={CheckSquare}
          label={lang === "bn" ? "সম্পন্ন কাজ" : "Tasks Completed"}
          value={DEMO_DATA.tasks.completed[period]}
          subValue={`/ ${DEMO_DATA.tasks.total[period]}`}
          color="bg-[var(--pv-blue)]"
          index={1}
        />
        <StatCard
          icon={Target}
          label={lang === "bn" ? "অভ্যাস হার" : "Habit Rate"}
          value={`${DEMO_DATA.habits.completionRate[period]}%`}
          color="bg-[var(--pv-teal)]"
          index={2}
        />
        <StatCard
          icon={Timer}
          label={lang === "bn" ? "ফোকাস সময়" : "Focus Time"}
          value={`${Math.round(DEMO_DATA.focus.minutes[period] / 60)}h`}
          subValue={`${DEMO_DATA.focus.sessions[period]} sessions`}
          color="bg-purple-500"
          index={3}
        />
        <StatCard
          icon={Flame}
          label={lang === "bn" ? "বর্তমান স্ট্রিক" : "Current Streak"}
          value={`${DEMO_DATA.streaks.current} days`}
          color="bg-orange-500"
          index={4}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[var(--pv-blue)]" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "bn" ? "দৈনিক কাজ সম্পন্ন" : "Daily Tasks Completed"}
              </h3>
            </div>
            <BarChart
              data={[
                { label: "M", value: 6, color: "bg-[var(--pv-blue)]" },
                { label: "T", value: 8, color: "bg-[var(--pv-blue)]" },
                { label: "W", value: 5, color: "bg-[var(--pv-blue)]" },
                { label: "T", value: 9, color: "bg-[var(--pv-teal)]" },
                { label: "F", value: 7, color: "bg-[var(--pv-blue)]" },
                { label: "S", value: 4, color: "bg-[var(--pv-blue)]" },
                { label: "S", value: 3, color: "bg-[var(--pv-blue)]" },
              ]}
              maxValue={10}
            />
          </div>
        </motion.div>

        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-[var(--pv-orange)]" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "bn" ? "খরচের ব্রেকডাউন" : "Expense Breakdown"}
              </h3>
            </div>
            <HorizontalBarChart data={DEMO_DATA.expenses.categories} />
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "মোট খরচ" : "Total Spent"}
                </span>
                <span className="text-foreground font-bold">
                  ৳{DEMO_DATA.expenses.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-pink-500" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "bn" ? "মেজাজ ট্রেন্ড" : "Mood Trend"}
              </h3>
            </div>
            <MoodTrendChart data={DEMO_DATA.mood.trend} />
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "গড় মেজাজ" : "Average Mood"}
                </span>
                <span className="text-foreground font-bold">
                  {DEMO_DATA.mood.average}/10
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={8}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-[var(--pv-teal)]" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "bn" ? "উৎপাদনশীলতা স্কোর" : "Productivity Score"}
              </h3>
            </div>
            <ProductivityScore
              score={DEMO_DATA.productivity.score}
              trend={DEMO_DATA.productivity.weeklyTrend}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        custom={9}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">
              {lang === "bn" ? "স্ট্রিক পরিসংখ্যান" : "Streak Statistics"}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-orange-500">
                {DEMO_DATA.streaks.current}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "বর্তমান স্ট্রিক" : "Current Streak"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {lang === "bn" ? "দিন" : "days"}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-[var(--pv-teal)]">
                {DEMO_DATA.streaks.longest}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "দীর্ঘতম স্ট্রিক" : "Longest Streak"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {lang === "bn" ? "দিন" : "days"}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-[var(--pv-blue)]">
                {DEMO_DATA.streaks.totalDays}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "মোট দিন" : "Total Days"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {lang === "bn" ? "ট্র্যাক করা হয়েছে" : "tracked"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
