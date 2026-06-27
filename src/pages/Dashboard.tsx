import { Suspense, lazy, useMemo } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/use-i18n";
import {
  CheckCircle,
  Target,
  Timer,
  Heart,
  Wallet,
  Trophy,
} from "lucide-react";
const DailyInspiration = lazy(() => import("@/components/DailyInspiration"));
import SmartInsights from "@/components/SmartInsights";
import SectionSuggestion from "@/components/SectionSuggestion";
import DashboardDateTime from "@/components/DashboardDateTime";
import { getUpcomingHolidays } from "@/lib/bangladesh-holidays";
import { getTimeBasedGreeting, getNameWithTitle } from "@/lib/bangla-greetings";
import { useDashboardStats } from "./use-dashboard-stats";
import { formatFocusTime } from "./dashboard-utils";
import {
  LifeScoreRing,
  ModuleCard,
  StreaksCard,
  TodaySummaryCard,
  FinancesCard,
  WellbeingCard,
  RecentActivitySection,
  HolidayCard,
  QuickActionBanner,
  buildRecentActivity,
} from "./dashboard-sections";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className ?? "h-32"}`}>
      <div className="h-4 bg-muted-foreground/10 rounded w-1/3 m-4" />
      <div className="h-8 bg-muted-foreground/10 rounded w-2/3 m-4" />
    </div>
  );
}

export default function Dashboard() {
  const { t, lang } = useI18n();

  const {
    tasks,
    habits,
    transactions,
    focusSessions,
    goals,
    moods,
    sleepLogs,
    profile,
    taskStats,
    habitStats,
    transactionStats,
    focusStats,
    goalStats,
    walletBalance,
    moodStats,
    sleepStats,
    isLoading,
  } = useDashboardStats();

  const taskScore =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;
  const habitScore =
    habitStats.total > 0
      ? Math.round((habitStats.todayCompleted / habitStats.total) * 100)
      : 0;
  const focusScore =
    focusStats.todayMinutes > 0
      ? Math.min(100, Math.round((focusStats.todayMinutes / 120) * 100))
      : 0;
  const wellbeingScore =
    moodStats.avgMood > 0 ? Math.round((moodStats.avgMood / 5) * 100) : 0;

  const scores = [taskScore, habitScore, focusScore, wellbeingScore];
  const activeScores = scores.filter((s) => s > 0);
  const lifeScore =
    activeScores.length > 0
      ? Math.round(
          activeScores.reduce((a, b) => a + b, 0) / activeScores.length,
        )
      : 0;

  const greeting = getTimeBasedGreeting(new Date().getHours());
  const nameWithTitle = getNameWithTitle(
    profile?.displayName,
    profile?.gender,
    lang,
  );
  const userAvatar = profile?.avatar || "👋";
  const upcomingHolidays = useMemo(() => {
    const holidays = getUpcomingHolidays();
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return holidays.filter((h) => {
      const hDate = new Date(h.date + "T00:00:00");
      return hDate >= now && hDate <= sevenDaysLater;
    });
  }, []);

  const modules = useMemo(
    () => [
      {
        icon: CheckCircle,
        title: "todo",
        desc: `${taskStats.total} tasks · ${taskStats.completed} done`,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        path: "/todo",
        score: taskScore,
        glow: "glow-blue",
      },
      {
        icon: Target,
        title: "habits",
        desc: `${habitStats.total} habits · ${habitStats.todayCompleted} done`,
        color: "text-green-500",
        bg: "bg-green-500/10",
        path: "/habits",
        score: habitScore,
        glow: "glow-green",
      },
      {
        icon: Timer,
        title: "focus",
        desc: `${formatFocusTime(focusStats.todayMinutes)} today`,
        color: "text-red-500",
        bg: "bg-red-500/10",
        path: "/focus",
        score: focusScore,
        glow: "glow-orange",
      },
      {
        icon: Heart,
        title: "wellbeing",
        desc: moodStats.todayMood
          ? `Mood: ${moodStats.todayMood}`
          : "No mood logged",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        path: "/wellbeing",
        score: wellbeingScore,
        glow: "glow-orange",
      },
      {
        icon: Wallet,
        title: "expense",
        desc: `৳${transactionStats.thisMonthExpense.toLocaleString()} this month`,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        path: "/expense",
        score: transactionStats.expenseScore,
        glow: "glow-green",
      },
      {
        icon: Trophy,
        title: "goals",
        desc: `${goalStats.active} active · ${goalStats.completed} done`,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        path: "/goals",
        score:
          goalStats.total > 0
            ? Math.round((goalStats.completed / goalStats.total) * 100)
            : 0,
        glow: "glow-blue",
      },
    ],
    [
      taskStats,
      habitStats,
      focusStats,
      moodStats,
      transactionStats,
      goalStats,
      taskScore,
      habitScore,
      focusScore,
      wellbeingScore,
      transactionStats.expenseScore,
    ],
  );

  const recentActivity = useMemo(
    () =>
      buildRecentActivity(
        tasks,
        focusSessions,
        transactions,
        moods,
        habits,
        sleepLogs,
      ),
    [tasks, focusSessions, transactions, moods, habits, sleepLogs],
  );

  const profileFlags = useMemo(() => {
    if (!profile)
      return {
        hasAge: false,
        hasGender: false,
        hasGoals: false,
        hasBudget: false,
        hasCurrency: false,
      };
    return {
      hasAge: !!profile.dateOfBirth,
      hasGender: !!profile.gender,
      hasGoals: goals !== undefined && goals.length > 0,
      hasBudget: false,
      hasCurrency: !!profile.currency && profile.currency !== "BDT",
    };
  }, [profile, goals]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto"
    >
      {profile ? (
        <motion.div
          variants={item}
          className="glass rounded-2xl p-6 glass-accent-top"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="mr-2">{userAvatar}</span>
                {lang === "bn" ? greeting.bn : greeting.en}
                {nameWithTitle ? ` ${nameWithTitle}` : ""}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.dash.lifeScore}
              </p>
            </div>
            <LifeScoreRing score={lifeScore} label={t.dash.lifeScore} />
          </div>

          <div className="flex justify-center sm:justify-end mb-2">
            <DashboardDateTime />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div>
              <CheckCircle className="mx-auto h-4 w-4 text-blue-500 mb-1" />
              <p className="font-semibold">{taskScore}%</p>
              <p className="text-muted-foreground">{t.nav.todo}</p>
            </div>
            <div>
              <Target className="mx-auto h-4 w-4 text-green-500 mb-1" />
              <p className="font-semibold">{habitScore}%</p>
              <p className="text-muted-foreground">{t.nav.habits}</p>
            </div>
            <div>
              <Timer className="mx-auto h-4 w-4 text-red-500 mb-1" />
              <p className="font-semibold">{focusScore}%</p>
              <p className="text-muted-foreground">{t.dash.focus}</p>
            </div>
            <div>
              <Heart className="mx-auto h-4 w-4 text-pink-500 mb-1" />
              <p className="font-semibold">{wellbeingScore}%</p>
              <p className="text-muted-foreground">{t.dash.wellbeing}</p>
            </div>
          </div>
          {!profileFlags.hasAge && !profileFlags.hasGender && (
            <SectionSuggestion
              type="profile"
              text={t.dash.suggest.profileAgeGender}
            />
          )}
          {profileFlags.hasAge && wellbeingScore === 0 && (
            <SectionSuggestion type="tip" text={t.dash.suggest.tipMoodSleep} />
          )}
        </motion.div>
      ) : (
        <SectionSkeleton className="h-48" />
      )}

      <motion.div variants={item}>
        <QuickActionBanner />
      </motion.div>
      {habitStats.todayCompleted === 0 && habitStats.total > 0 && (
        <SectionSuggestion type="tip" text={t.dash.suggest.tipHabitStreak} />
      )}

      {upcomingHolidays.length > 0 && (
        <motion.div variants={item}>
          <HolidayCard holiday={upcomingHolidays[0]} lang={lang} />
        </motion.div>
      )}

      <Suspense fallback={<SectionSkeleton className="h-32" />}>
        <DailyInspiration />
      </Suspense>

      <Suspense fallback={<SectionSkeleton className="h-40" />}>
        <SmartInsights
          tasks={tasks}
          habits={habits}
          transactions={transactions}
          focusSessions={focusSessions}
          moods={moods}
          sleepLogs={sleepLogs}
        />
      </Suspense>

      {!isLoading ? (
        <motion.div
          variants={container}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((mod) => (
            <motion.div key={mod.title} variants={item}>
              <ModuleCard
                mod={mod}
                taskStats={taskStats}
                habitStats={habitStats}
                focusStats={focusStats}
                moodStats={moodStats}
                transactions={transactions}
                goalStats={goalStats}
                profileFlags={profileFlags}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SectionSkeleton key={i} />
          ))}
        </div>
      )}

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <StreaksCard habitStats={habitStats} goalStats={goalStats} />
        <TodaySummaryCard taskStats={taskStats} focusStats={focusStats} />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <FinancesCard
          walletBalance={walletBalance}
          transactionStats={transactionStats}
        />
        <WellbeingCard moodStats={moodStats} sleepStats={sleepStats} />
      </motion.div>

      <motion.div variants={item}>
        <RecentActivitySection activities={recentActivity} />
      </motion.div>
    </motion.div>
  );
}
