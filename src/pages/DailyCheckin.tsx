import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Sun,
  Moon,
  Coffee,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface DailyCheckin {
  _id: string;
  date: number;
  mood: string;
  energy: number;
  topGoal?: string;
  notes?: string;
}

const MOODS = [
  { value: "great", emoji: "😄", label: "Great", color: "text-green-500" },
  { value: "good", emoji: "🙂", label: "Good", color: "text-blue-500" },
  { value: "okay", emoji: "😐", label: "Okay", color: "text-yellow-500" },
  { value: "bad", emoji: "😔", label: "Bad", color: "text-orange-500" },
  { value: "terrible", emoji: "😢", label: "Terrible", color: "text-red-500" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DailyCheckin() {
  const { lang } = useLang();
  const [showCheckin, setShowCheckin] = useState(true);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([
    {
      _id: "1",
      date: Date.now() - 1 * 24 * 60 * 60 * 1000,
      mood: "good",
      energy: 4,
      topGoal: lang === "bn" ? "প্রজেক্ট সম্পন্ন করুন" : "Finish project",
    },
    {
      _id: "2",
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      mood: "great",
      energy: 5,
      topGoal: lang === "bn" ? "ব্যায়াম করুন" : "Exercise",
    },
  ]);

  const [formData, setFormData] = useState({
    mood: "good",
    energy: 3,
    topGoal: "",
    notes: "",
  });

  const stats = useMemo(() => {
    if (checkins.length === 0) return null;
    const avgEnergy =
      checkins.reduce((sum, c) => sum + c.energy, 0) / checkins.length;
    const greatDays = checkins.filter(
      (c) => c.mood === "great" || c.mood === "good",
    ).length;
    return {
      totalCheckins: checkins.length,
      avgEnergy: avgEnergy.toFixed(1),
      greatDays,
      streak: calculateStreak(),
    };
  }, [checkins]);

  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const hasCheckin = checkins.some((c) => {
        const checkinDate = new Date(c.date);
        checkinDate.setHours(0, 0, 0, 0);
        return checkinDate.getTime() === currentDate.getTime();
      });

      if (hasCheckin) {
        streak++;
      } else if (i > 0) {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const handleCheckin = () => {
    const newCheckin: DailyCheckin = {
      _id: Date.now().toString(),
      date: Date.now(),
      mood: formData.mood,
      energy: formData.energy,
      topGoal: formData.topGoal || undefined,
      notes: formData.notes || undefined,
    };
    setCheckins([newCheckin, ...checkins]);
    setShowCheckin(false);
    setFormData({ mood: "good", energy: 3, topGoal: "", notes: "" });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sun className="h-6 w-6 text-yellow-500" />
          {lang === "bn" ? "দৈনিক চেক-ইন" : "Daily Check-in"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "প্রতিদিন আপনার মূল্যায়ন করুন"
            : "Rate your day and set your top goal"}
        </p>
      </motion.div>

      {stats && (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="glass rounded-xl p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalCheckins}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট চেক-ইন" : "Total Check-ins"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "দিন স্ট্রিক" : "Day Streak"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.avgEnergy}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় এনার্জি" : "Avg Energy"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stats.greatDays}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "ভালো দিন" : "Good Days"}
            </p>
          </div>
        </motion.div>
      )}

      {showCheckin ? (
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            {lang === "bn" ? "আজকের চেক-ইন" : "Today's Check-in"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === "bn"
                  ? "আজ আপনার মনোভাব কেমন?"
                  : "How are you feeling today?"}
              </label>
              <div className="flex gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() =>
                      setFormData({ ...formData, mood: mood.value })
                    }
                    className={`cursor-pointer flex-1 flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                      formData.mood === mood.value
                        ? "bg-primary/10 border-2 border-primary scale-105"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === "bn" ? "এনার্জি লেভেল" : "Energy Level"}
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {lang === "bn" ? "কম" : "Low"}
                </span>
                <div className="flex-1 flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setFormData({ ...formData, energy: level })
                      }
                      className={`cursor-pointer flex-1 h-8 rounded-lg transition-all ${
                        formData.energy >= level
                          ? "bg-primary"
                          : "bg-foreground/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {lang === "bn" ? "বেশি" : "High"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === "bn" ? "আজকের শীর্ষ লক্ষ্য" : "Top Goal for Today"}
              </label>
              <input
                type="text"
                value={formData.topGoal}
                onChange={(e) =>
                  setFormData({ ...formData, topGoal: e.target.value })
                }
                placeholder={
                  lang === "bn"
                    ? "আজ আপনি কী করতে চান?"
                    : "What do you want to achieve?"
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === "bn" ? "অতিরিক্ত নোট" : "Additional Notes"}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={
                  lang === "bn"
                    ? "আজকের সম্পর্কে কিছু লিখুন..."
                    : "Write about your day..."
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>

            <button
              onClick={handleCheckin}
              className="cursor-pointer w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {lang === "bn" ? "চেক-ইন সম্পন্ন" : "Complete Check-in"}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          className="glass rounded-2xl p-6 text-center"
        >
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="font-semibold mb-2">
            {lang === "bn"
              ? "আজকের চেক-ইন সম্পন্ন!"
              : "Today's check-in complete!"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "bn"
              ? "আপনি আজ ভালো কাজ করেছেন"
              : "Great job tracking your day"}
          </p>
          <button
            onClick={() => setShowCheckin(true)}
            className="cursor-pointer text-sm text-primary hover:underline"
          >
            {lang === "bn" ? "আবার চেক-ইন করুন" : "Check in again"}
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3">
          {lang === "bn" ? "সাম্প্রতিক চেক-ইন" : "Recent Check-ins"}
        </h2>
        <div className="space-y-3">
          {checkins.map((checkin) => {
            const moodConfig =
              MOODS.find((m) => m.value === checkin.mood) || MOODS[1];
            return (
              <motion.div
                key={checkin._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{moodConfig.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${moodConfig.color}`}>
                        {moodConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatDate(checkin.date)}
                      </span>
                    </div>
                    {checkin.topGoal && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {checkin.topGoal}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          checkin.energy >= level
                            ? "bg-primary"
                            : "bg-foreground/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
