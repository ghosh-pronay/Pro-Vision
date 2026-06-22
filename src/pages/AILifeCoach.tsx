import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  Target,
  Brain,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  BarChart3,
  BookOpen,
  Star,
  Heart,
} from "lucide-react";

const NOW = Date.now();

interface Goal {
  id: number;
  title: string;
  progress: number;
  weeklyCheckin: string;
}

interface ActionItem {
  id: number;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface MoodEntry {
  value: number;
  emoji: string;
  timestamp: Date;
}

interface WeeklyReflection {
  moodAvg: number;
  goalsCompleted: number;
  habitsStreak: number;
  summary: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const MOODS = [
  { value: 1, emoji: "😞", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const MOTIVATIONAL_QUOTES = [
  {
    en: "The only way to do great work is to love what you do. — Steve Jobs",
    bn: "মহান কাজ করার একমাত্র উপায় হলো যা আপনি করেন তা ভালোবাসা। — স্টিভ জবস",
  },
  {
    en: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    bn: "সফলতা চূড়ান্ত নয়, ব্যর্থতা প্রাণঘাতী নয়: চালিয়ে যাওয়ার সাহসই গুরুত্বপূর্ণ।",
  },
  {
    en: "Believe you can and you're halfway there. — Theodore Roosevelt",
    bn: "বিশ্বাস করুন আপনি পারেন এবং আপনি অর্ধেই পৌঁছে গেছেন। — থিওডোর রুজভেল্ট",
  },
  {
    en: "The future belongs to those who believe in the beauty of their dreams.",
    bn: "ভবিষ্যত তাদের যারা তাদের স্বপ্নের সৌন্দর্যে বিশ্বাস করে তাদের।",
  },
  {
    en: "It does not matter how slowly you go as long as you do not stop.",
    bn: "আপনি কত ধীরে যাচ্ছেন তা গুরুত্বহীন, যতক্ষণ না আপনি থামছেন না।",
  },
  {
    en: "Hard work beats talent when talent doesn't work hard.",
    bn: "কঠোর পরিশ্রম প্রতিভাকে হারায় যখন প্রতিভা কঠোর পরিশ্রম করে না।",
  },
  {
    en: "Your limitation—it's only your imagination.",
    bn: "আপনার সীমাবদ্ধতা—এটি শুধু আপনার কল্পনা।",
  },
  {
    en: "Great things never come from comfort zones.",
    bn: "মহান কিছু কখনোই আরামের এলাকা থেকে আসে না।",
  },
];

const AI_INSIGHTS = [
  {
    en: "Based on your mood patterns, mornings are your most productive time. Consider scheduling important tasks before noon.",
    bn: "আপনার মেজাজের ধরনের উপর ভিত্তি করে, সকাল আপনার সবচেয়ে উৎপাদনশীল সময়। দুপুরের আগে গুরুত্বপূর্ণ কাজ শেডিউল করার চেষ্টা করুন।",
    color: "text-blue-500",
    icon: Clock,
  },
  {
    en: "Your energy levels dip around 3 PM. A 10-minute walk could boost your afternoon productivity by 40%.",
    bn: "বিকাল ৩টার দিকে আপনার শক্তির মাত্রা কমে যায়। ১০ মিনিট হাঁটা আপনার বিকেলের উৎপাদনশীলতা ৪০% বাড়াতে পারে।",
    color: "text-green-500",
    icon: Zap,
  },
  {
    en: "You've maintained a consistent routine this week. Keep it up — consistency is the key to long-term success!",
    bn: "আপনি এই সপ্তাহে একটি ধারাবাহিক রুটিন বজায় রেখেছেন। চালিয়ে যান — ধারাবাহিকতাই দীর্ঘমেয়াদী সফলতার চাবি!",
    color: "text-purple-500",
    icon: TrendingUp,
  },
];

export default function AILifeCoach() {
  const { lang } = useLang();
  const [mood, setMood] = useState<number>(3);
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: "", progress: 0, weeklyCheckin: "" },
    { id: 2, title: "", progress: 0, weeklyCheckin: "" },
    { id: 3, title: "", progress: 0, weeklyCheckin: "" },
  ]);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: 1, text: "", completed: false, priority: "high" },
    { id: 2, text: "", completed: false, priority: "medium" },
    { id: 3, text: "", completed: false, priority: "low" },
  ]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    { value: 4, emoji: "🙂", timestamp: new Date(NOW - 86400000) },
    { value: 3, emoji: "😐", timestamp: new Date(NOW - 172800000) },
    { value: 5, emoji: "😄", timestamp: new Date(NOW - 259200000) },
    { value: 4, emoji: "🙂", timestamp: new Date(NOW - 345600000) },
    { value: 3, emoji: "😐", timestamp: new Date(NOW - 432000000) },
    { value: 5, emoji: "😄", timestamp: new Date(NOW - 518400000) },
    { value: 4, emoji: "🙂", timestamp: new Date(NOW - 604800000) },
  ]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [moodLogged, setMoodLogged] = useState(false);

  const dailyMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6)
      return lang === "bn"
        ? "🌙 রাতের প্রহরে বিশ্রাম নিন। আগামীকাল নতুন সুযোগ নিয়ে আসবে।"
        : "🌙 Night hours — rest well. Tomorrow brings new opportunities.";
    if (hour < 12)
      return lang === "bn"
        ? "🌅 সুপ্রভাত! আজকের জন্য ৩টি লক্ষ্য নির্ধারণ করুন এবং শুরু করুন!"
        : "🌅 Good morning! Set 3 goals for today and get started!";
    if (hour < 17)
      return lang === "bn"
        ? "☀️ দুপুর! আপনি আজ ভালো কাজ করছেন। একটি ছোট বিরতি নিন।"
        : "☀️ Afternoon! You're doing great today. Take a short break.";
    if (hour < 21)
      return lang === "bn"
        ? "🌆 সন্ধ্যা! আজকের কাজ পর্যালোচনা করুন এবং আগামীকাল পরিকল্পনা করুন।"
        : "🌆 Evening! Review today's work and plan for tomorrow.";
    return lang === "bn"
      ? "🌃 শুভরাত্রি! আজকের অগ্রগতি নিয়ে গর্বিত হোন। ঘুমানোর আগে ৩টি কৃতজ্ঞতা লিখুন।"
      : "🌃 Good night! Be proud of today's progress. Write 3 gratitudes before sleep.";
  }, [lang]);

  const currentQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const weeklyReflection: WeeklyReflection = useMemo(
    () => ({
      moodAvg:
        moodHistory.reduce((sum, m) => sum + m.value, 0) / moodHistory.length,
      goalsCompleted: goals.filter((g) => g.progress >= 100).length,
      habitsStreak: 5,
      summary:
        lang === "bn"
          ? "এই সপ্তাহে আপনি গড়ে ৪.০ মুড স্কোর বজায় রেখেছেন। আপনার ${goals.filter((g) => g.progress >= 100).length}টি লক্ষ্য সম্পন্ন হয়েছে। ধারাবাহিকতা বজায় রাখুন!"
          : `This week you maintained an average mood score of 4.0. ${goals.filter((g) => g.progress >= 100).length} goals were completed. Keep up the consistency!`,
    }),
    [moodHistory, goals, lang],
  );

  const toggleActionItem = (id: number) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const updateGoalProgress = (id: number, progress: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: Math.min(100, progress) } : g,
      ),
    );
  };

  const updateGoalCheckin = (id: number, checkin: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, weeklyCheckin: checkin } : g)),
    );
  };

  const updateActionItemText = (id: number, text: string) => {
    setActionItems((items) =>
      items.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const updateGoalTitle = (id: number, title: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, title } : g)));
  };

  const logMood = () => {
    const selectedMoodObj = MOODS.find((m) => m.value === mood);
    if (selectedMoodObj) {
      setMoodHistory((prev) => [
        { value: mood, emoji: selectedMoodObj.emoji, timestamp: new Date() },
        ...prev.slice(0, 6),
      ]);
      setMoodLogged(true);
      setTimeout(() => setMoodLogged(false), 2000);
    }
  };

  const refreshQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "bn" ? "সুপ্রভাত" : "Good Morning";
    if (hour < 17) return lang === "bn" ? "শুভ অপরাহ্ন" : "Good Afternoon";
    return lang === "bn" ? "শুভ সন্ধ্যা" : "Good Evening";
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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
      <motion.div variants={fadeUp} className="text-center">
        <h1 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {t("lifeCoach.dailyMessage" as TranslationKey, lang)}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getFormattedDate()}
        </p>
        <p className="text-lg font-semibold mt-2">{getGreeting()}</p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {dailyMessage}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {t("lifeCoach.moodCheckIn" as TranslationKey, lang)}
        </h3>
        <div className="flex justify-between mb-4">
          {MOODS.map((m) => (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(m.value)}
              className={`cursor-pointer flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                mood === m.value
                  ? "bg-primary/10 border-2 border-primary scale-110"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </motion.button>
          ))}
        </div>
        {moodLogged && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-green-500 font-medium"
          >
            {lang === "bn" ? "মুড লগ হয়েছে!" : "Mood logged!"}
          </motion.div>
        )}
        {!moodLogged && (
          <button
            onClick={logMood}
            className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {lang === "bn" ? "মুড লগ করুন" : "Log Mood"}
          </button>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          {lang === "bn" ? "এনার্জি ট্র্যাকিং" : "Energy Level Tracking"}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {lang === "bn" ? "কম" : "Low"}
          </span>
          <div className="flex-1 flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={`cursor-pointer flex-1 h-10 rounded-lg transition-all ${
                  energyLevel >= level ? "bg-primary" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {lang === "bn" ? "বেশি" : "High"}
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {lang === "bn"
            ? `এনার্জি: ${energyLevel}/5`
            : `Energy: ${energyLevel}/5`}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          {lang === "bn" ? "দৈনিক কাজ" : "Daily Action Items"}
        </h3>
        <div className="space-y-3">
          {actionItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <button
                onClick={() => toggleActionItem(item.id)}
                className={`cursor-pointer w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                  item.completed
                    ? "bg-primary border-primary"
                    : "border-foreground/20 hover:border-primary"
                }`}
              >
                {item.completed && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateActionItemText(item.id, e.target.value)}
                placeholder={
                  lang === "bn"
                    ? `কাজ ${item.id} লিখুন...`
                    : `Task ${item.id}...`
                }
                className={`flex-1 bg-transparent text-sm outline-none ${
                  item.completed ? "line-through text-muted-foreground" : ""
                }`}
              />
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  item.priority === "high"
                    ? "bg-red-500/10 text-red-500"
                    : item.priority === "medium"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-green-500/10 text-green-500"
                }`}
              >
                {item.priority === "high"
                  ? lang === "bn"
                    ? "উচ্চ"
                    : "High"
                  : item.priority === "medium"
                    ? lang === "bn"
                      ? "মাঝারি"
                      : "Med"
                    : lang === "bn"
                      ? "নিম্ন"
                      : "Low"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {actionItems.filter((i) => i.completed).length}/{actionItems.length}{" "}
          {lang === "bn" ? "সম্পন্ন" : "completed"}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {lang === "bn" ? "জীবনের লক্ষ্য" : "Life Goals"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {lang === "bn"
            ? "সাপ্তাহিক চেক-ইন সহ ৩টি লক্ষ্য নির্ধারণ করুন"
            : "Set 3 life goals with weekly check-ins"}
        </p>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="glass rounded-xl p-4 hover-lift hover-teal"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold text-primary">
                  {goal.id}
                </span>
                <input
                  type="text"
                  value={goal.title}
                  onChange={(e) => updateGoalTitle(goal.id, e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? `লক্ষ্য ${goal.id} লিখুন...`
                      : `Goal ${goal.id}...`
                  }
                  className="flex-1 bg-transparent text-sm font-medium outline-none"
                />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
              <div className="flex gap-2 mb-3">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => updateGoalProgress(goal.id, p)}
                    className={`cursor-pointer text-xs px-2 py-1 rounded ${
                      goal.progress >= p
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/5 text-muted-foreground"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {lang === "bn" ? "সাপ্তাহিক চেক-ইন" : "Weekly Check-in"}
                </label>
                <textarea
                  value={goal.weeklyCheckin}
                  onChange={(e) => updateGoalCheckin(goal.id, e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "এই সপ্তাহের অগ্রগতি..."
                      : "This week's progress..."
                  }
                  className="w-full bg-transparent text-sm outline-none resize-none min-h-[60px] rounded-lg p-2 border border-foreground/10"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          {t("lifeCoach.aiInsights" as TranslationKey, lang)}
        </h3>
        <div className="space-y-3">
          {AI_INSIGHTS.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5"
              >
                <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <p className="text-sm text-muted-foreground">
                  {lang === "bn" ? insight.bn : insight.en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-500" />
          {t("lifeCoach.weeklyReflection" as TranslationKey, lang)}
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {weeklyReflection.moodAvg.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় মুড" : "Avg Mood"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {weeklyReflection.goalsCompleted}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "লক্ষ্য সম্পন্ন" : "Goals Done"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">
              {weeklyReflection.habitsStreak}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "দিন স্ট্রিক" : "Day Streak"}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {lang === "bn" ? weeklyReflection.summary : weeklyReflection.summary}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t("lifeCoach.motivation" as TranslationKey, lang)}
          </h3>
          <button
            onClick={refreshQuote}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm italic text-muted-foreground leading-relaxed"
          >
            "{lang === "bn" ? currentQuote.bn : currentQuote.en}"
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          {lang === "bn" ? "অগ্রগতি ট্র্যাকিং" : "Progress Tracking"}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {lang === "bn" ? "সাপ্তাহিক মুড ট্রেন্ড" : "Weekly Mood Trend"}
              </span>
              <span className="font-medium">
                {weeklyReflection.moodAvg.toFixed(1)}/5
              </span>
            </div>
            <div className="flex items-end gap-1 h-20">
              {moodHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${(entry.value / 5) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 bg-primary/20 rounded-t relative group"
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t"
                      style={{ height: `${(entry.value / 5) * 100}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {entry.emoji}
                    </div>
                  </motion.div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{lang === "bn" ? "৭ দিন আগে" : "7 days ago"}</span>
              <span>{lang === "bn" ? "আজ" : "Today"}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {lang === "bn" ? "লক্ষ্যের অগ্রগতি" : "Goal Progress"}
              </span>
            </div>
            <div className="space-y-2">
              {goals
                .filter((g) => g.title)
                .map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 truncate">
                      {goal.title}
                    </span>
                    <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {goal.progress}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {lang === "bn" ? "দৈনিক কাজ সম্পন্ন" : "Daily Tasks Completed"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-4 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      (actionItems.filter((i) => i.completed).length /
                        actionItems.length) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-sm font-medium">
                {actionItems.filter((i) => i.completed).length}/
                {actionItems.length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
