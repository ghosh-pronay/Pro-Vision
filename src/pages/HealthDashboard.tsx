import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Heart,
  Moon,
  Dumbbell,
  Smile,
  Droplets,
  Plus,
  Calendar,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface SleepLog {
  _id: string;
  hours: number;
  quality: "great" | "good" | "okay" | "bad";
  date: number;
}

interface ExerciseLog {
  _id: string;
  type: string;
  duration: number;
  calories: number;
  date: number;
}

interface MoodLog {
  _id: string;
  score: number;
  label: string;
  date: number;
}

interface WaterLog {
  _id: string;
  glasses: number;
  date: number;
}

interface ActivityItem {
  id: string;
  type: "sleep" | "exercise" | "mood" | "water";
  title: string;
  detail: string;
  time: string;
  icon: typeof Moon;
  color: string;
  bgColor: string;
}

const MOOD_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "😔", label: "Terrible" },
  2: { emoji: "😐", label: "Bad" },
  3: { emoji: "🙂", label: "Okay" },
  4: { emoji: "😊", label: "Good" },
  5: { emoji: "😄", label: "Great" },
};

const EXERCISE_TYPES: Record<string, { icon: string; label: string }> = {
  running: { icon: "🏃", label: "Running" },
  gym: { icon: "🏋️", label: "Gym" },
  yoga: { icon: "🧘", label: "Yoga" },
  cycling: { icon: "🚴", label: "Cycling" },
  walking: { icon: "🚶", label: "Walking" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const INITIAL_SLEEP_LOGS: SleepLog[] = [
  { _id: "1", hours: 7.5, quality: "good", date: Date.now() - 0 * 86400000 },
  { _id: "2", hours: 6, quality: "okay", date: Date.now() - 1 * 86400000 },
  { _id: "3", hours: 8, quality: "great", date: Date.now() - 2 * 86400000 },
  { _id: "4", hours: 7, quality: "good", date: Date.now() - 3 * 86400000 },
  { _id: "5", hours: 5.5, quality: "bad", date: Date.now() - 4 * 86400000 },
  { _id: "6", hours: 8.5, quality: "great", date: Date.now() - 5 * 86400000 },
  { _id: "7", hours: 7, quality: "good", date: Date.now() - 6 * 86400000 },
];

const INITIAL_EXERCISE_LOGS: ExerciseLog[] = [
  {
    _id: "1",
    type: "running",
    duration: 30,
    calories: 300,
    date: Date.now() - 0 * 86400000,
  },
  {
    _id: "2",
    type: "gym",
    duration: 45,
    calories: 400,
    date: Date.now() - 1 * 86400000,
  },
  {
    _id: "3",
    type: "yoga",
    duration: 60,
    calories: 200,
    date: Date.now() - 2 * 86400000,
  },
  {
    _id: "4",
    type: "cycling",
    duration: 40,
    calories: 350,
    date: Date.now() - 3 * 86400000,
  },
  {
    _id: "5",
    type: "running",
    duration: 25,
    calories: 250,
    date: Date.now() - 5 * 86400000,
  },
  {
    _id: "6",
    type: "gym",
    duration: 50,
    calories: 450,
    date: Date.now() - 6 * 86400000,
  },
];

const INITIAL_MOOD_LOGS: MoodLog[] = [
  { _id: "1", score: 4, label: "Good", date: Date.now() - 0 * 86400000 },
  { _id: "2", score: 3, label: "Okay", date: Date.now() - 1 * 86400000 },
  { _id: "3", score: 5, label: "Great", date: Date.now() - 2 * 86400000 },
  { _id: "4", score: 4, label: "Good", date: Date.now() - 3 * 86400000 },
  { _id: "5", score: 2, label: "Bad", date: Date.now() - 4 * 86400000 },
  { _id: "6", score: 5, label: "Great", date: Date.now() - 5 * 86400000 },
  { _id: "7", score: 4, label: "Good", date: Date.now() - 6 * 86400000 },
];

const INITIAL_WATER_LOGS: WaterLog[] = [
  { _id: "1", glasses: 8, date: Date.now() - 0 * 86400000 },
  { _id: "2", glasses: 6, date: Date.now() - 1 * 86400000 },
  { _id: "3", glasses: 10, date: Date.now() - 2 * 86400000 },
  { _id: "4", glasses: 7, date: Date.now() - 3 * 86400000 },
  { _id: "5", glasses: 5, date: Date.now() - 4 * 86400000 },
  { _id: "6", glasses: 9, date: Date.now() - 5 * 86400000 },
  { _id: "7", glasses: 8, date: Date.now() - 6 * 86400000 },
];

export default function HealthDashboard() {
  const { lang } = useLang();
  const [quickLogType, setQuickLogType] = useState<string | null>(null);

  const [sleepLogs] = useState<SleepLog[]>(INITIAL_SLEEP_LOGS);

  const [exerciseLogs] = useState<ExerciseLog[]>(INITIAL_EXERCISE_LOGS);

  const [moodLogs] = useState<MoodLog[]>(INITIAL_MOOD_LOGS);

  const [waterLogs] = useState<WaterLog[]>(INITIAL_WATER_LOGS);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      const sleep = sleepLogs[i];
      const exercise = exerciseLogs.find(
        (e) => new Date(e.date).getDay() === (i + 1) % 7,
      );
      const mood = moodLogs[i];
      const water = waterLogs[i];
      return {
        day,
        sleep: sleep?.hours || 0,
        exercise: exercise?.duration || 0,
        mood: mood?.score || 0,
        water: water?.glasses || 0,
      };
    });
  }, [sleepLogs, exerciseLogs, moodLogs, waterLogs]);

  const stats = useMemo(() => {
    const avgSleep =
      sleepLogs.reduce((sum, l) => sum + l.hours, 0) / sleepLogs.length;
    const totalWorkouts = exerciseLogs.length;
    const totalCalories = exerciseLogs.reduce((sum, e) => sum + e.calories, 0);
    const avgMood =
      moodLogs.reduce((sum, m) => sum + m.score, 0) / moodLogs.length;
    const moodCounts = moodLogs.reduce(
      (acc, m) => {
        acc[m.label] = (acc[m.label] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostCommonMood =
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Good";
    const avgWater =
      waterLogs.reduce((sum, w) => sum + w.glasses, 0) / waterLogs.length;

    const waterStreak = waterLogs.reduce((streak, log) => {
      if (log.glasses >= 8) return streak + 1;
      return 0;
    }, 0);

    const healthScore = Math.round(
      (avgSleep / 8) * 25 +
        Math.min(totalWorkouts / 5, 1) * 25 +
        (avgMood / 5) * 25 +
        Math.min(avgWater / 8, 1) * 25,
    );

    return {
      avgSleep: avgSleep.toFixed(1),
      sleepTrend: sleepLogs[0]?.hours > sleepLogs[1]?.hours ? "up" : "down",
      totalWorkouts,
      totalCalories,
      avgMood: avgMood.toFixed(1),
      mostCommonMood,
      avgWater: avgWater.toFixed(1),
      waterStreak,
      healthScore,
    };
  }, [sleepLogs, exerciseLogs, moodLogs, waterLogs]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    if (sleepLogs[0]) {
      activities.push({
        id: `sleep-${sleepLogs[0]._id}`,
        type: "sleep",
        title: lang === "bn" ? "ঘুমের লগ" : "Sleep Logged",
        detail: `${sleepLogs[0].hours}h - ${sleepLogs[0].quality}`,
        time: "Today",
        icon: Moon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      });
    }

    if (exerciseLogs[0]) {
      const exInfo =
        EXERCISE_TYPES[exerciseLogs[0].type] || EXERCISE_TYPES.running;
      activities.push({
        id: `exercise-${exerciseLogs[0]._id}`,
        type: "exercise",
        title: lang === "bn" ? "ব্যায়াম লগ" : "Workout Logged",
        detail: `${exInfo.icon} ${exerciseLogs[0].duration}min`,
        time: "Today",
        icon: Dumbbell,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      });
    }

    if (moodLogs[0]) {
      activities.push({
        id: `mood-${moodLogs[0]._id}`,
        type: "mood",
        title: lang === "bn" ? "মনোভাব লগ" : "Mood Logged",
        detail: `${MOOD_LABELS[moodLogs[0].score]?.emoji} ${MOOD_LABELS[moodLogs[0].score]?.label}`,
        time: "Today",
        icon: Smile,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      });
    }

    if (waterLogs[0]) {
      activities.push({
        id: `water-${waterLogs[0]._id}`,
        type: "water",
        title: lang === "bn" ? "পানির লগ" : "Water Logged",
        detail: `${waterLogs[0].glasses}/8 glasses`,
        time: "Today",
        icon: Droplets,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      });
    }

    return activities;
  }, [sleepLogs, exerciseLogs, moodLogs, waterLogs, lang]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          {lang === "bn" ? "স্বাস্থ্য ড্যাশবোর্ড" : "Health Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার সমগ্র স্বাস্থ্য ট্র্যাক করুন"
            : "Track your complete health metrics in one place"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            {lang === "bn" ? "স্বাস্থ্য স্কোর" : "Health Score"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {lang === "bn" ? "সমগ্র মূল্যায়ন" : "Overall Assessment"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-foreground/10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${stats.healthScore * 2.51} 251`}
                strokeLinecap="round"
                className={`${
                  stats.healthScore >= 75
                    ? "text-green-500"
                    : stats.healthScore >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{stats.healthScore}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="text-sm">
                {lang === "bn" ? "ঘুম" : "Sleep"}: {stats.avgSleep}h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {lang === "bn" ? "ব্যায়াম" : "Exercise"}: {stats.totalWorkouts}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {lang === "bn" ? "মনোভাব" : "Mood"}: {stats.avgMood}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {lang === "bn" ? "পানি" : "Water"}: {stats.avgWater}g
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <Moon className="h-5 w-5 mx-auto text-indigo-500 mb-2" />
          <p className="text-2xl font-bold">{stats.avgSleep}h</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "গড় ঘুম" : "Avg Sleep"}
          </p>
          {stats.sleepTrend === "up" ? (
            <ArrowUpRight className="h-3 w-3 mx-auto text-green-500 mt-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mx-auto text-red-500 mt-1" />
          )}
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Dumbbell className="h-5 w-5 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "ওয়ার্কআউট" : "Workouts"}
          </p>
          <p className="text-xs text-orange-500 mt-1">
            {stats.totalCalories} cal
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Smile className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.avgMood}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "গড় মনোভাব" : "Avg Mood"}
          </p>
          <p className="text-xs text-yellow-500 mt-1">{stats.mostCommonMood}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.avgWater}g</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "গড় পানি" : "Avg Water"}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {stats.waterStreak} {lang === "bn" ? "দিন স্ট্রিক" : "day streak"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          {lang === "bn" ? "সাপ্তাহিক প্রগ্রেস" : "Weekly Progress"}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{day.day}</span>
              <div className="w-full space-y-1">
                <div
                  className="w-full bg-indigo-500/20 rounded"
                  style={{ height: `${(day.sleep / 10) * 60}px` }}
                  title={`Sleep: ${day.sleep}h`}
                >
                  <div
                    className="w-full bg-indigo-500 rounded"
                    style={{ height: `${(day.sleep / 10) * 100}%` }}
                  />
                </div>
                <div
                  className="w-full bg-blue-500/20 rounded"
                  style={{ height: `${(day.water / 12) * 60}px` }}
                  title={`Water: ${day.water}g`}
                >
                  <div
                    className="w-full bg-blue-500 rounded"
                    style={{ height: `${(day.water / 12) * 100}%` }}
                  />
                </div>
                <div
                  className="w-full bg-yellow-500/20 rounded"
                  style={{ height: `${(day.mood / 5) * 60}px` }}
                  title={`Mood: ${day.mood}/5`}
                >
                  <div
                    className="w-full bg-yellow-500 rounded"
                    style={{ height: `${(day.mood / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "ঘুম" : "Sleep"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "পানি" : "Water"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "মনোভাব" : "Mood"}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          {lang === "bn" ? "দ্রুত লগ" : "Quick Log"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              type: "sleep",
              icon: Moon,
              label: lang === "bn" ? "ঘুম" : "Sleep",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              type: "exercise",
              icon: Dumbbell,
              label: lang === "bn" ? "ব্যায়াম" : "Exercise",
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
            {
              type: "mood",
              icon: Smile,
              label: lang === "bn" ? "মনোভাব" : "Mood",
              color: "text-yellow-500",
              bg: "bg-yellow-500/10",
            },
            {
              type: "water",
              icon: Droplets,
              label: lang === "bn" ? "পানি" : "Water",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => setQuickLogType(item.type)}
              className={`cursor-pointer glass rounded-xl p-4 text-center hover:scale-105 transition-transform ${
                quickLogType === item.type ? "ring-2 ring-primary" : ""
              }`}
            >
              <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {quickLogType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">
              {lang === "bn" ? "নতুন লগ যোগ করুন" : "Add New Log"}
            </h4>
            <button
              onClick={() => setQuickLogType(null)}
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:text-[var(--pv-blue)] transition-colors"
            >
              {lang === "bn" ? "বন্ধ করুন" : "Close"}
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {lang === "bn"
                ? `${quickLogType === "sleep" ? "ঘুম" : quickLogType === "exercise" ? "ব্যায়াম" : quickLogType === "mood" ? "মনোভাব" : "পানি"} লগ প্যানেল শীঘ্রই আসছে`
                : `The ${quickLogType} logging panel is coming soon`}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          {lang === "bn" ? "সাম্প্রতিক কার্যকলাপ" : "Recent Activity"}
        </h3>
        <div className="space-y-2">
          {recentActivity.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-3 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2 ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
