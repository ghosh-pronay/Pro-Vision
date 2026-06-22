import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Star,
  Zap,
  Trophy,
  Target,
  Flame,
  Shield,
  Crown,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
  icon: LucideIcon;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  isCurrentUser: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const LEVEL_TIERS = [
  { level: 1, name: { en: "Beginner", bn: "শিক্ষার্থী" }, xpRequired: 0 },
  { level: 2, name: { en: "Apprentice", bn: "শিক্ষানিষ্ঠ" }, xpRequired: 500 },
  { level: 3, name: { en: "Skilled", bn: "দক্ষ" }, xpRequired: 1500 },
  { level: 4, name: { en: "Expert", bn: "বিশেষজ্ঞ" }, xpRequired: 3500 },
  { level: 5, name: { en: "Master", bn: "মাস্টার" }, xpRequired: 7000 },
  { level: 6, name: { en: "Champion", bn: "চ্যাম্পিয়ন" }, xpRequired: 12000 },
  { level: 7, name: { en: "Elite", bn: "এলিট" }, xpRequired: 20000 },
  {
    level: 8,
    name: { en: "Productivity Warrior", bn: "উৎপাদকতা যোদ্ধা" },
    xpRequired: 35000,
  },
  { level: 9, name: { en: "Legend", bn: "কিংবদন্তী" }, xpRequired: 55000 },
  {
    level: 10,
    name: { en: "Grandmaster", bn: "গ্র্যান্ডমাস্টার" },
    xpRequired: 80000,
  },
];

export default function Gamification() {
  const { lang } = useLang();
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    {
      id: "1",
      name: lang === "bn" ? "৩টি কাজ সম্পন্ন করুন" : "Complete 3 Tasks",
      description:
        lang === "bn" ? "আজ ৩টি কাজ সম্পন্ন করুন" : "Finish 3 tasks today",
      xpReward: 50,
      progress: 2,
      goal: 3,
      completed: false,
      claimed: false,
      icon: Target,
    },
    {
      id: "2",
      name: lang === "bn" ? "৩০ মিনিট ফোকাস" : "30 Min Focus",
      description:
        lang === "bn"
          ? "৩০ মিনিট ফোকাস সেশন সম্পন্ন করুন"
          : "Complete a 30 min focus session",
      xpReward: 75,
      progress: 30,
      goal: 30,
      completed: true,
      claimed: false,
      icon: Clock,
    },
    {
      id: "3",
      name: lang === "bn" ? "অভ্যাস ট্র্যাক করুন" : "Track Habits",
      description: lang === "bn" ? "৩টি অভ্যাস ট্র্যাক করুন" : "Track 3 habits",
      xpReward: 40,
      progress: 1,
      goal: 3,
      completed: false,
      claimed: false,
      icon: Flame,
    },
    {
      id: "4",
      name: lang === "bn" ? "পানি পান করুন" : "Drink Water",
      description:
        lang === "bn" ? "৮ গ্লাস পানি পান করুন" : "Drink 8 glasses of water",
      xpReward: 30,
      progress: 5,
      goal: 8,
      completed: false,
      claimed: false,
      icon: Shield,
    },
    {
      id: "5",
      name: lang === "bn" ? "কৃতজ্ঞতা লিখুন" : "Write Gratitude",
      description:
        lang === "bn" ? "আজকের কৃতজ্ঞতা লিখুন" : "Write today's gratitude",
      xpReward: 25,
      progress: 1,
      goal: 1,
      completed: true,
      claimed: true,
      icon: Star,
    },
  ]);

  const [weeklyChallenge] = useState({
    name:
      lang === "bn" ? "সাপ্তাহিক মাস্টারচ্যালেঞ্জ" : "Weekly Master Challenge",
    description:
      lang === "bn"
        ? "৭ দিন ধারাবাহিক ৫টি অভ্যাস করুন"
        : "Track 5 habits for 7 consecutive days",
    xpReward: 500,
    progress: 4,
    goal: 7,
    icon: Crown,
  });

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const currentLevel = 8;
  const currentXP = 38750;
  const nextLevelXP = 55000;
  const xpProgress =
    ((currentXP - LEVEL_TIERS[currentLevel - 1].xpRequired) /
      (nextLevelXP - LEVEL_TIERS[currentLevel - 1].xpRequired)) *
    100;

  const totalXPEarned = 38750;
  const xpSources = [
    {
      source: lang === "bn" ? "কাজ সম্পন্ন" : "Tasks Completed",
      xp: 12500,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      source: lang === "bn" ? "অভ্যাস ট্র্যাক" : "Habits Tracked",
      xp: 9200,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      source: lang === "bn" ? "ফোকাস সেশন" : "Focus Sessions",
      xp: 8500,
      icon: Clock,
      color: "text-red-500",
    },
    {
      source: lang === "bn" ? "চ্যালেঞ্জ সম্পন্ন" : "Challenges Completed",
      xp: 5800,
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      source: lang === "bn" ? "দৈনিক বোনাস" : "Daily Bonuses",
      xp: 2750,
      icon: Zap,
      color: "text-purple-500",
    },
  ];

  const xpMultipliers = [
    {
      label: lang === "bn" ? "স্ট্রিক বোনাস" : "Streak Bonus",
      multiplier: "1.5x",
      active: true,
    },
    {
      label: lang === "bn" ? "প্রিমিয়াম" : "Premium",
      multiplier: "2x",
      active: false,
    },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Arif H.", xp: 72500, level: 9, isCurrentUser: false },
    { rank: 2, name: "Sumaiya K.", xp: 68200, level: 9, isCurrentUser: false },
    { rank: 3, name: "Rahul M.", xp: 61800, level: 8, isCurrentUser: false },
    { rank: 4, name: "Nusrat J.", xp: 55400, level: 8, isCurrentUser: false },
    {
      rank: 5,
      name: lang === "bn" ? "আপনি" : "You",
      xp: 38750,
      level: 8,
      isCurrentUser: true,
    },
    { rank: 6, name: "Tanvir R.", xp: 35200, level: 7, isCurrentUser: false },
    { rank: 7, name: "Fatima A.", xp: 31800, level: 7, isCurrentUser: false },
    { rank: 8, name: "Imran S.", xp: 28500, level: 7, isCurrentUser: false },
    { rank: 9, name: "Samiha P.", xp: 24100, level: 6, isCurrentUser: false },
    { rank: 10, name: "Kamal H.", xp: 21300, level: 6, isCurrentUser: false },
  ];

  const badges: Badge[] = [
    {
      id: "first_steps",
      name: lang === "bn" ? "প্রথম পদক্ষেপ" : "First Steps",
      description:
        lang === "bn" ? "প্রথম কাজ সম্পন্ন করুন" : "Complete your first task",
      icon: Target,
      color: "text-green-500",
      unlocked: true,
    },
    {
      id: "streak_7",
      name: lang === "bn" ? "৭ দিনের আগুন" : "7 Day Fire",
      description: lang === "bn" ? "৭ দিন স্ট্রিক" : "7 day streak",
      icon: Flame,
      color: "text-orange-500",
      unlocked: true,
    },
    {
      id: "focus_fury",
      name: lang === "bn" ? "ফোকাস ফিউরি" : "Focus Fury",
      description: lang === "bn" ? "১০ ঘন্টা ফোকাস" : "10 hours focus",
      icon: Clock,
      color: "text-red-500",
      unlocked: true,
    },
    {
      id: "task_titan",
      name: lang === "bn" ? "কাজের টাইটান" : "Task Titan",
      description: lang === "bn" ? "৫০টি কাজ সম্পন্ন" : "Complete 50 tasks",
      icon: CheckCircle,
      color: "text-blue-500",
      unlocked: true,
    },
    {
      id: "habit_hero",
      name: lang === "bn" ? "অভ্যাস হিরো" : "Habit Hero",
      description: lang === "bn" ? "৩০ দিনের স্ট্রিক" : "30 day streak",
      icon: Shield,
      color: "text-purple-500",
      unlocked: false,
      progress: 18,
      maxProgress: 30,
    },
    {
      id: "xp_hunter",
      name: lang === "bn" ? "XP শিকারি" : "XP Hunter",
      description: lang === "bn" ? "৫০,০০০ XP অর্জন" : "Earn 50,000 XP",
      icon: Zap,
      color: "text-yellow-500",
      unlocked: false,
      progress: 38750,
      maxProgress: 50000,
    },
    {
      id: "challenge_champ",
      name: lang === "bn" ? "চ্যালেঞ্জ চ্যাম্প" : "Challenge Champ",
      description:
        lang === "bn" ? "২০টি চ্যালেঞ্জ সম্পন্ন" : "Complete 20 challenges",
      icon: Trophy,
      color: "text-amber-500",
      unlocked: false,
      progress: 14,
      maxProgress: 20,
    },
    {
      id: "level_master",
      name: lang === "bn" ? "লেভেল মাস্টার" : "Level Master",
      description: lang === "bn" ? "লেভেল ১০ এ পৌঁছান" : "Reach Level 10",
      icon: Crown,
      color: "text-cyan-500",
      unlocked: false,
      progress: 8,
      maxProgress: 10,
    },
    {
      id: "social_star",
      name: lang === "bn" ? "সোশ্যাল স্টার" : "Social Star",
      description: lang === "bn" ? "৫ জন বন্ধু যোগ করুন" : "Add 5 friends",
      icon: Users,
      color: "text-pink-500",
      unlocked: false,
      progress: 3,
      maxProgress: 5,
    },
    {
      id: "elite_earner",
      name: lang === "bn" ? "এলিট আর্নার" : "Elite Earner",
      description: lang === "bn" ? "১,০০,০০০ XP অর্জন" : "Earn 100,000 XP",
      icon: Award,
      color: "text-indigo-500",
      unlocked: false,
      progress: 38750,
      maxProgress: 100000,
    },
  ];

  const totalUnclaimedXP = useMemo(() => {
    return dailyChallenges
      .filter((c) => c.completed && !c.claimed)
      .reduce((sum, c) => sum + c.xpReward, 0);
  }, [dailyChallenges]);

  const handleClaim = (challengeId: string) => {
    setClaimingId(challengeId);
    setTimeout(() => {
      setDailyChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c)),
      );
      setClaimingId(null);
    }, 500);
  };

  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {lang === "bn" ? "গেমিফিকেশন" : "Gamification"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার উৎপাদকতা যাত্রা এবং অর্জন"
            : "Your productivity journey and achievements"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-3 bg-yellow-500/10">
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === "bn" ? "বর্তমান লেভেল" : "Current Level"}
              </p>
              <h2 className="text-2xl font-bold">
                {LEVEL_TIERS[currentLevel - 1].name[lang]}
              </h2>
              <p className="text-sm text-yellow-500">
                {lang === "bn"
                  ? `লেভেল ${currentLevel}`
                  : `Level ${currentLevel}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-500">
              {currentXP.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{lang === "bn" ? "পরবর্তী লেভেল" : "Next Level"}</span>
            <span className="text-muted-foreground">
              {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">
            {lang === "bn" ? "লেভেল ইতিহাস" : "Level History"}
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_TIERS.map((tier) => (
              <div
                key={tier.level}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tier.level <= currentLevel
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-foreground/5 text-muted-foreground"
                }`}
              >
                {tier.level}. {tier.name[lang]}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            {lang === "bn" ? "XP ব্রেকডাউন" : "XP Breakdown"}
          </h2>
          <div className="text-right">
            <p className="text-xl font-bold text-purple-500">
              {totalXPEarned.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট XP অর্জিত" : "Total XP Earned"}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {xpSources.map((source, index) => {
            const Icon = source.icon;
            const percentage = (source.xp / totalXPEarned) * 100;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${source.color}`} />
                    <span className="text-sm">{source.source}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {source.xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: index * 0.1,
                    }}
                    className={`h-full rounded-full ${
                      index === 0
                        ? "bg-green-500"
                        : index === 1
                          ? "bg-orange-500"
                          : index === 2
                            ? "bg-red-500"
                            : index === 3
                              ? "bg-yellow-500"
                              : "bg-purple-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          {xpMultipliers.map((mult, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                mult.active
                  ? "bg-green-500/10 text-green-500"
                  : "bg-foreground/5 text-muted-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{mult.label}</span>
              <span className="font-bold">{mult.multiplier}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {lang === "bn" ? "দৈনিক চ্যালেঞ্জ" : "Daily Challenges"}
          </h2>
          {totalUnclaimedXP > 0 && (
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm rounded-full font-medium">
              +{totalUnclaimedXP} XP {lang === "bn" ? "দাবি করুন" : "to claim"}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {dailyChallenges.map((challenge) => {
            const Icon = challenge.icon;
            const progressPercent = (challenge.progress / challenge.goal) * 100;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border ${
                  challenge.completed && !challenge.claimed
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-foreground/10 bg-foreground/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${challenge.completed ? "bg-green-500/10" : "bg-foreground/10"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${challenge.completed ? "text-green-500" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{challenge.name}</h3>
                      <span className="text-sm font-bold text-yellow-500">
                        +{challenge.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            challenge.completed ? "bg-green-500" : "bg-blue-500"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {challenge.progress}/{challenge.goal}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2">
                    {challenge.completed && !challenge.claimed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClaim(challenge.id)}
                        disabled={claimingId === challenge.id}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {claimingId === challenge.id
                          ? lang === "bn"
                            ? "দাবি হচ্ছে..."
                            : "Claiming..."
                          : lang === "bn"
                            ? "দাবি করুন"
                            : "Claim"}
                      </motion.button>
                    )}
                    {challenge.claimed && (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">
                          {lang === "bn" ? "দাবি করা হয়েছে" : "Claimed"}
                        </span>
                      </div>
                    )}
                    {!challenge.completed && (
                      <span className="text-xs text-muted-foreground">
                        {challenge.progress}/{challenge.goal}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-orange-500/10 rounded-xl">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-500">
            {lang === "bn"
              ? "৫ দিনের স্ট্রিক বোনাস: 1.5x XP!"
              : "5 Day Streak Bonus: 1.5x XP!"}
          </span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            {lang === "bn" ? "সাপ্তাহিক চ্যালেঞ্জ" : "Weekly Challenge"}
          </h2>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-sm rounded-full font-medium">
            +{weeklyChallenge.xpReward} XP
          </span>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg p-2 bg-amber-500/10">
              <weeklyChallenge.icon className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium">{weeklyChallenge.name}</h3>
              <p className="text-sm text-muted-foreground">
                {weeklyChallenge.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-foreground/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(weeklyChallenge.progress / weeklyChallenge.goal) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
              />
            </div>
            <span className="text-sm font-medium">
              {weeklyChallenge.progress}/{weeklyChallenge.goal}{" "}
              {lang === "bn" ? "দিন" : "days"}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          {lang === "bn" ? "লিডারবোর্ড" : "Leaderboard"}
        </h2>

        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                entry.isCurrentUser
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-foreground/5"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1
                    ? "bg-yellow-500 text-white"
                    : entry.rank === 2
                      ? "bg-gray-300 text-gray-800"
                      : entry.rank === 3
                        ? "bg-amber-600 text-white"
                        : "bg-foreground/10 text-muted-foreground"
                }`}
              >
                {entry.rank}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${entry.isCurrentUser ? "text-yellow-500" : ""}`}
                >
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-yellow-500/20 px-2 py-0.5 rounded-full">
                      {lang === "bn" ? "আপনি" : "You"}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "bn"
                    ? `লেভেল ${entry.level}`
                    : `Level ${entry.level}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  {entry.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500" />
            {lang === "bn" ? "ব্যাজ সংগ্রহ" : "Badge Collection"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {unlockedBadges}/{badges.length}{" "}
            {lang === "bn" ? "অনলক" : "unlocked"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl text-center ${
                  badge.unlocked
                    ? "bg-foreground/5"
                    : "bg-foreground/5 opacity-60"
                }`}
              >
                <div
                  className={`rounded-xl p-3 mx-auto w-fit mb-2 ${
                    badge.unlocked ? "bg-foreground/10" : "bg-foreground/5"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${badge.unlocked ? badge.color : "text-muted-foreground"}`}
                  />
                </div>
                <p className="font-medium text-xs mb-1">{badge.name}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {badge.description}
                </p>
                {!badge.unlocked &&
                  badge.progress !== undefined &&
                  badge.maxProgress !== undefined && (
                    <div>
                      <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-foreground/30 rounded-full"
                          style={{
                            width: `${(badge.progress / badge.maxProgress) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {badge.progress.toLocaleString()} /{" "}
                        {badge.maxProgress.toLocaleString()}
                      </p>
                    </div>
                  )}
                {badge.unlocked && (
                  <div className="flex items-center justify-center gap-1 text-green-500">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">
                      {lang === "bn" ? "অনলক" : "Unlocked"}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
