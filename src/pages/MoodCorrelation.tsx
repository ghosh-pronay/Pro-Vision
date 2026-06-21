import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Heart,
  Moon,
  Sun,
  Dumbbell,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MoodCorrelation() {
  const { lang } = useLang();

  const correlations = useMemo(
    () => [
      {
        factor: lang === "bn" ? "ঘুম" : "Sleep",
        icon: Moon,
        correlation: 0.85,
        insight:
          lang === "bn"
            ? "আপনি ৭+ ঘন্টা ঘুমালে ৪০% বেশি খুশি থাকেন"
            : "You're 40% happier when you sleep 7+ hours",
        positive: true,
      },
      {
        factor: lang === "bn" ? "ব্যায়াম" : "Exercise",
        icon: Dumbbell,
        correlation: 0.72,
        insight:
          lang === "bn"
            ? "ব্যায়ামের দিনে আপনার এনার্জি ২.৫গুণ বেশি"
            : "Your energy is 2.5x higher on exercise days",
        positive: true,
      },
      {
        factor: lang === "bn" ? "সকালের রুটিন" : "Morning Routine",
        icon: Sun,
        correlation: 0.65,
        insight:
          lang === "bn"
            ? "সকালে ৬টায় উঠলে দিনের শেষে ৩০% বেশি কাজ হয়"
            : "Waking at 6 AM leads to 30% more productivity",
        positive: true,
      },
      {
        factor: lang === "bn" ? "সামাজিক সময়" : "Social Time",
        icon: Heart,
        correlation: 0.58,
        insight:
          lang === "bn"
            ? "পরিবারের সাথে সময় কাটালে মনোভাব ২৫% ভালো হয়"
            : "Time with family improves mood by 25%",
        positive: true,
      },
      {
        factor: lang === "bn" ? "স্ক্রিন সময়" : "Screen Time",
        icon: Activity,
        correlation: -0.45,
        insight:
          lang === "bn"
            ? "রাত ১০টার পর ফোন ব্যবহার ঘুমের মান খারাপ করে"
            : "Phone use after 10 PM reduces sleep quality",
        positive: false,
      },
      {
        factor: lang === "bn" ? "ক্যাফেইন" : "Caffeine",
        icon: Minus,
        correlation: -0.32,
        insight:
          lang === "bn"
            ? "দুপুর ২টার পর চা/কফি ঘুমের সময়কে প্রভাবিত করে"
            : "Coffee after 2 PM affects your bedtime",
        positive: false,
      },
    ],
    [lang],
  );

  const weeklyMoodData = [
    { day: "Mon", mood: 4, sleep: 7, exercise: true },
    { day: "Tue", mood: 5, sleep: 8, exercise: true },
    { day: "Wed", mood: 3, sleep: 6, exercise: false },
    { day: "Thu", mood: 4, sleep: 7.5, exercise: true },
    { day: "Fri", mood: 4, sleep: 7, exercise: false },
    { day: "Sat", mood: 5, sleep: 9, exercise: true },
    { day: "Sun", mood: 4, sleep: 8, exercise: false },
  ];

  const maxMood = Math.max(...weeklyMoodData.map((d) => d.mood));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          {lang === "bn" ? "মুড সম্পর্ক" : "Mood Correlation"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার অভ্যাস এবং মনোভাবের সম্পর্ক বুঝুন"
            : "Understand how your habits affect your mood"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {lang === "bn" ? "সাপ্তাহিক মুড প্যাটার্ন" : "Weekly Mood Pattern"}
        </h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyMoodData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-1">
                {data.exercise && (
                  <Dumbbell className="h-3 w-3 text-green-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {data.mood}
                </span>
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.mood / maxMood) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full rounded-t-lg ${
                  data.mood >= 4
                    ? "bg-green-500"
                    : data.mood >= 3
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">{data.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {lang === "bn" ? "ভালো" : "Good"}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            {lang === "bn" ? "গড়" : "Average"}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {lang === "bn" ? "খারাপ" : "Bad"}
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3 w-3 text-green-500" />
            {lang === "bn" ? "ব্যায়াম" : "Exercise"}
          </span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-3">
          {lang === "bn" ? "আপনার সম্পর্ক" : "Your Correlations"}
        </h3>
        <div className="space-y-3">
          {correlations.map((item, index) => {
            const Icon = item.icon;
            const strength = Math.abs(item.correlation);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-4 hover-lift"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 ${
                      item.positive ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        item.positive ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.factor}</h4>
                      <div className="flex items-center gap-2">
                        {item.positive ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            item.positive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {Math.round(strength * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.insight}
                    </p>
                    <div className="mt-2 h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          item.positive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">
          {lang === "bn" ? "AI পরামর্শ" : "AI Recommendations"}
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <Sun className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn"
                  ? "সকালের রুটিন চালু করুন"
                  : "Start a morning routine"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "আপনার ডেটা দেখাচ্ছে যে সকালে কাজ করলে দিনের বাকি সময় ভালো যায়"
                  : "Your data shows morning activities boost your entire day"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <Moon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn"
                  ? "ঘুমের সময় নির্ধারণ করুন"
                  : "Set a consistent bedtime"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "নিয়মিত ঘুমের সময় আপনার ঘুমের মান ৩৫% বাড়াতে পারে"
                  : "Consistent bedtime can improve your sleep quality by 35%"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <Dumbbell className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">
                {lang === "bn"
                  ? "বিকেলে ব্যায়াম করুন"
                  : "Exercise in the afternoon"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "বিকেলে ব্যায়াম করলে রাতে ভালো ঘুম হয়"
                  : "Afternoon exercise leads to better sleep at night"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
