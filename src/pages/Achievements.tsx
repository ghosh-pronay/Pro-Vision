import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Award,
  Star,
  Trophy,
  Flame,
  Target,
  Clock,
  CheckCircle,
  Zap,
  Heart,
  BookOpen,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Achievements() {
  const { lang } = useLang();

  const achievements: Achievement[] = [
    {
      id: "first_task",
      name: lang === "bn" ? "প্রথম কাজ" : "First Task",
      description:
        lang === "bn"
          ? "আপনার প্রথম কাজ সম্পন্ন করুন"
          : "Complete your first task",
      icon: CheckCircle,
      color: "text-green-500",
      unlocked: true,
      unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: "task_master",
      name: lang === "bn" ? "কাজ মাস্টার" : "Task Master",
      description:
        lang === "bn" ? "১০০টি কাজ সম্পন্ন করুন" : "Complete 100 tasks",
      icon: Trophy,
      color: "text-yellow-500",
      unlocked: true,
      unlockedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: "habit_streak_7",
      name: lang === "bn" ? "৭ দিনের স্ট্রিক" : "7 Day Streak",
      description:
        lang === "bn"
          ? "৭ দিন ধারাবাহিক অভ্যাস"
          : "7 consecutive days of habits",
      icon: Flame,
      color: "text-orange-500",
      unlocked: true,
      unlockedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
    {
      id: "habit_streak_30",
      name: lang === "bn" ? "৩০ দিনের স্ট্রিক" : "30 Day Streak",
      description:
        lang === "bn"
          ? "৩০ দিন ধারাবাহিক অভ্যাস"
          : "30 consecutive days of habits",
      icon: Zap,
      color: "text-purple-500",
      unlocked: false,
      progress: 15,
      maxProgress: 30,
    },
    {
      id: "early_bird",
      name: lang === "bn" ? "সকালের পাখি" : "Early Bird",
      description: lang === "bn" ? "৫টার আগে উঠুন" : "Wake up before 5 AM",
      icon: Clock,
      color: "text-blue-500",
      unlocked: false,
      progress: 3,
      maxProgress: 7,
    },
    {
      id: "bookworm",
      name: lang === "bn" ? "বইপোকা" : "Bookworm",
      description: lang === "bn" ? "১০টি বই পড়ুন" : "Read 10 books",
      icon: BookOpen,
      color: "text-indigo-500",
      unlocked: false,
      progress: 4,
      maxProgress: 10,
    },
    {
      id: "fitness_fanatic",
      name: lang === "bn" ? "ফিটনেস পাগল" : "Fitness Fanatic",
      description:
        lang === "bn" ? "৩০টি ওয়ার্কআউট সম্পন্ন করুন" : "Complete 30 workouts",
      icon: Target,
      color: "text-red-500",
      unlocked: false,
      progress: 12,
      maxProgress: 30,
    },
    {
      id: "gratitude_guru",
      name: lang === "bn" ? "কৃতজ্ঞতা গুরু" : "Gratitude Guru",
      description:
        lang === "bn"
          ? "১০০ দিন কৃতজ্ঞতা লিখুন"
          : "Write gratitude for 100 days",
      icon: Heart,
      color: "text-pink-500",
      unlocked: false,
      progress: 42,
      maxProgress: 100,
    },
    {
      id: "savings_saver",
      name: lang === "bn" ? "সঞ্চয়কারী" : "Savings Star",
      description: lang === "bn" ? "৫০,০০৳ সঞ্চয় করুন" : "Save ৳50,000",
      icon: Star,
      color: "text-amber-500",
      unlocked: false,
      progress: 32000,
      maxProgress: 50000,
    },
    {
      id: "focus_master",
      name: lang === "bn" ? "ফোকাস মাস্টার" : "Focus Master",
      description:
        lang === "bn" ? "১০০ ঘন্টা ফোকাস সেশন" : "100 hours of focus sessions",
      icon: Zap,
      color: "text-cyan-500",
      unlocked: false,
      progress: 67,
      maxProgress: 100,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-500" />
          {lang === "bn" ? "অর্জন" : "Achievements"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? `আপনি ${unlockedCount}/${totalAchievements} অর্জন পেয়েছেন`
            : `You've unlocked ${unlockedCount}/${totalAchievements} achievements`}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {lang === "bn" ? "সমগ্র অগ্রগতি" : "Overall Progress"}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((unlockedCount / totalAchievements) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3">
          {lang === "bn" ? "অনলক করা" : "Unlocked"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements
            .filter((a) => a.unlocked)
            .map((achievement) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 flex items-center gap-4"
                >
                  <div
                    className={`rounded-xl p-3 bg-foreground/5 ${achievement.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-green-500 mt-1">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3">
          {lang === "bn" ? "ইন প্রগ্রেস" : "In Progress"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements
            .filter((a) => !a.unlocked)
            .map((achievement) => {
              const Icon = achievement.icon;
              const progressPercent = achievement.maxProgress
                ? (achievement.progress || 0) / achievement.maxProgress
                : 0;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`rounded-xl p-3 bg-foreground/5 ${achievement.color} opacity-50`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 rounded-full bg-foreground/30"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {achievement.progress} / {achievement.maxProgress}
                  </p>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </motion.div>
  );
}
