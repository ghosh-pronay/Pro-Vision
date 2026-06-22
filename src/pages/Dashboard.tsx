import { useMemo, type ElementType } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  CheckCircle,
  Target,
  Wallet,
  Timer,
  Heart,
  Flame,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Trophy,
  Moon,
  Calendar,
  Loader2,
} from "lucide-react";
import { Link } from "react-router";
import DailyInspiration from "@/components/DailyInspiration";
import SmartInsights from "@/components/SmartInsights";
import SectionSuggestion from "@/components/SectionSuggestion";
import DashboardDateTime from "@/components/DashboardDateTime";
import { getUpcomingHolidays } from "@/lib/bangladesh-holidays";
import { getTimeBasedGreeting, getNameWithTitle } from "@/lib/bangla-greetings";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function calculateStreak(completedDates: number[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  const sortedDates = [...completedDates]
    .sort((a, b) => b - a)
    .map((d) => new Date(d).setHours(0, 0, 0, 0));
  const uniqueDates = [...new Set(sortedDates)];
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const diff = (uniqueDates[i] as number) - (uniqueDates[i + 1] as number);
    if (diff === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function Dashboard() {
  const { t, lang } = useI18n();

  const tasks = useQuery(api.tasks.list);
  const habits = useQuery(api.habits.list);
  const transactions = useQuery(api.transactions.list);
  const focusSessions = useQuery(api.focusSessions.list);
  const goals = useQuery(api.goals.list);
  const wallets = useQuery(api.wallets.list);
  const moods = useQuery(api.moods.list);
  const sleepLogs = useQuery(api.sleepLogs.list);
  const profile = useQuery(api.userProfiles.get);

  const isLoading =
    tasks === undefined ||
    habits === undefined ||
    transactions === undefined ||
    focusSessions === undefined ||
    goals === undefined ||
    wallets === undefined ||
    moods === undefined ||
    sleepLogs === undefined ||
    profile === undefined;

  const taskStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    const now = Date.now();
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now,
    ).length;
    return { total: tasks.length, completed, pending, overdue };
  }, [tasks]);

  const habitStats = useMemo(() => {
    if (!habits)
      return { total: 0, totalStreak: 0, avgRate: 0, todayCompleted: 0 };
    const today = new Date().setHours(0, 0, 0, 0);
    const todayCompleted = habits.filter((h) =>
      h.completedDates.some((d) => new Date(d).setHours(0, 0, 0, 0) === today),
    ).length;
    let bestStreak = 0;
    for (const habit of habits) {
      const streak = calculateStreak(habit.completedDates);
      if (streak > bestStreak) bestStreak = streak;
    }
    return {
      total: habits.length,
      totalStreak: bestStreak,
      avgRate:
        habits.length > 0
          ? Math.round((todayCompleted / habits.length) * 100)
          : 0,
      todayCompleted,
    };
  }, [habits]);

  const transactionStats = useMemo(() => {
    if (!transactions)
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        thisMonthIncome: 0,
        thisMonthExpense: 0,
      };
    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();
    let totalIncome = 0;
    let totalExpense = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncome += tx.amount;
        if (tx.date >= thisMonthStart) thisMonthIncome += tx.amount;
      } else if (tx.type === "expense") {
        totalExpense += tx.amount;
        if (tx.date >= thisMonthStart) thisMonthExpense += tx.amount;
      }
    }
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      thisMonthIncome,
      thisMonthExpense,
    };
  }, [transactions]);

  const focusStats = useMemo(() => {
    if (!focusSessions)
      return { sessions: 0, totalMinutes: 0, totalHours: 0, todayMinutes: 0 };
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMinutes = focusSessions
      .filter((s) => s.completedAt >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0);
    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      sessions: focusSessions.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      todayMinutes,
    };
  }, [focusSessions]);

  const goalStats = useMemo(() => {
    if (!goals) return { total: 0, completed: 0, active: 0 };
    return {
      total: goals.length,
      completed: goals.filter((g) => g.status === "completed").length,
      active: goals.filter((g) => g.status === "active").length,
    };
  }, [goals]);

  const walletBalance = useMemo(() => {
    if (!wallets) return 0;
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const moodStats = useMemo(() => {
    if (!moods) return { todayMood: null, avgMood: 0, totalLogged: 0 };
    const today = new Date().setHours(0, 0, 0, 0);
    const todayMood = moods.find(
      (m) => new Date(m.date).setHours(0, 0, 0, 0) === today,
    );
    const avgMood =
      moods.length > 0
        ? Math.round(moods.reduce((sum, m) => sum + m.value, 0) / moods.length)
        : 0;
    return {
      todayMood: todayMood?.mood ?? null,
      avgMood,
      totalLogged: moods.length,
    };
  }, [moods]);

  const sleepStats = useMemo(() => {
    if (!sleepLogs) return { todayHours: 0, avgHours: 0, totalLogged: 0 };
    const today = new Date().setHours(0, 0, 0, 0);
    const todayLog = sleepLogs.find(
      (l) => new Date(l.date).setHours(0, 0, 0, 0) === today,
    );
    const avgHours =
      sleepLogs.length > 0
        ? Math.round(
            (sleepLogs.reduce((sum, l) => sum + l.hours, 0) /
              sleepLogs.length) *
              10,
          ) / 10
        : 0;
    return {
      todayHours: todayLog?.hours ?? 0,
      avgHours,
      totalLogged: sleepLogs.length,
    };
  }, [sleepLogs]);

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

  const expenseScore = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    ).getTime();
    const thisMonthExp = transactions
      .filter((t) => t.type === "expense" && t.date >= thisMonthStart)
      .reduce((s, t) => s + t.amount, 0);
    const lastMonthExp = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.date >= lastMonthStart &&
          t.date < thisMonthStart,
      )
      .reduce((s, t) => s + t.amount, 0);
    if (lastMonthExp === 0) return thisMonthExp > 0 ? 50 : 0;
    const change = ((lastMonthExp - thisMonthExp) / lastMonthExp) * 100;
    return Math.max(0, Math.min(100, Math.round(change + 50)));
  }, [transactions]);

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
        score: expenseScore,
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
      expenseScore,
    ],
  );

  const recentActivity = useMemo(() => {
    const activities: {
      id: string;
      icon: ElementType;
      text: string;
      time: string;
      color: string;
      timestamp: number;
    }[] = [];

    if (tasks && tasks.length > 0) {
      const sorted = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
      const recentTask = sorted[0];
      activities.push({
        id: `task-${recentTask._id}`,
        icon: CheckCircle,
        text: recentTask.completed
          ? `Completed "${recentTask.title}"`
          : `Added task "${recentTask.title}"`,
        time: getTimeAgo(recentTask.createdAt),
        color: "text-blue-500",
        timestamp: recentTask.createdAt,
      });
    }

    if (focusSessions && focusSessions.length > 0) {
      const sorted = [...focusSessions].sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const recentSession = sorted[0];
      activities.push({
        id: `focus-${recentSession._id}`,
        icon: Timer,
        text: `Completed ${formatFocusTime(recentSession.duration)} focus session`,
        time: getTimeAgo(recentSession.createdAt),
        color: "text-red-500",
        timestamp: recentSession.createdAt,
      });
    }

    if (transactions && transactions.length > 0) {
      const sorted = [...transactions].sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const recentTx = sorted[0];
      activities.push({
        id: `tx-${recentTx._id}`,
        icon: recentTx.type === "income" ? TrendingUp : TrendingDown,
        text: `${recentTx.type === "income" ? "Income" : "Expense"}: ৳${recentTx.amount.toLocaleString()} (${recentTx.category})`,
        time: getTimeAgo(recentTx.createdAt),
        color:
          recentTx.type === "income" ? "text-green-500" : "text-yellow-500",
        timestamp: recentTx.createdAt,
      });
    }

    if (moods && moods.length > 0) {
      const sorted = [...moods].sort((a, b) => b.createdAt - a.createdAt);
      const recentMood = sorted[0];
      activities.push({
        id: `mood-${recentMood._id}`,
        icon: Heart,
        text: `Logged mood: ${recentMood.mood}`,
        time: getTimeAgo(recentMood.createdAt),
        color: "text-pink-500",
        timestamp: recentMood.createdAt,
      });
    }

    if (habits && habits.length > 0) {
      const checkedHabit = habits.find((h) => {
        const today = new Date().setHours(0, 0, 0, 0);
        return h.completedDates.some(
          (d) => new Date(d).setHours(0, 0, 0, 0) === today,
        );
      });
      if (checkedHabit) {
        activities.push({
          id: `habit-${checkedHabit._id}`,
          icon: Target,
          text: `Checked in: "${checkedHabit.name}"`,
          time: "Today",
          color: "text-green-500",
          timestamp: Date.now(),
        });
      }
    }

    if (sleepLogs && sleepLogs.length > 0) {
      const sorted = [...sleepLogs].sort((a, b) => b.createdAt - a.createdAt);
      const recentSleep = sorted[0];
      activities.push({
        id: `sleep-${recentSleep._id}`,
        icon: Moon,
        text: `Logged ${recentSleep.hours}h sleep (${recentSleep.quality})`,
        time: getTimeAgo(recentSleep.createdAt),
        color: "text-indigo-500",
        timestamp: recentSleep.createdAt,
      });
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [tasks, focusSessions, transactions, moods, habits, sleepLogs]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto"
    >
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
            <p className="text-sm text-muted-foreground">{t.dash.lifeScore}</p>
          </div>
          <div className="relative h-24 w-24 shrink-0">
            <svg
              className="h-24 w-24 -rotate-90"
              viewBox="0 0 100 100"
              role="img"
              aria-label={`${t.dash.lifeScore}: ${lifeScore}`}
            >
              <title>
                {t.dash.lifeScore}: {lifeScore}
              </title>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/20"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-primary"
                strokeDasharray={`${(lifeScore / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {lifeScore}
              </span>
            </div>
          </div>
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

      <motion.div
        variants={item}
        className="glass rounded-2xl p-4 flex items-center justify-between glow-blue"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{t.dash.just2Minutes}</p>
            <p className="text-xs text-muted-foreground">
              {t.dash.quickActionsDesc}
            </p>
          </div>
        </div>
        <Link
          to="/habits"
          className="cursor-pointer rounded-xl bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t.dash.start}
        </Link>
      </motion.div>
      {habitStats.todayCompleted === 0 && habitStats.total > 0 && (
        <SectionSuggestion type="tip" text={t.dash.suggest.tipHabitStreak} />
      )}

      {upcomingHolidays.length > 0 && (
        <motion.div
          variants={item}
          className="glass rounded-2xl p-4 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {lang === "bn"
                  ? upcomingHolidays[0].name
                  : upcomingHolidays[0].nameEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(
                  upcomingHolidays[0].date + "T00:00:00",
                ).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <DailyInspiration />

      <SmartInsights
        tasks={tasks}
        habits={habits}
        transactions={transactions}
        focusSessions={focusSessions}
        moods={moods}
        sleepLogs={sleepLogs}
      />

      <motion.div
        variants={container}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {modules.map((mod) => {
          const getSuggestion = () => {
            if (mod.title === "todo" && taskStats.total === 0) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptyAddTask}
                  linkTo="/todo"
                />
              );
            }
            if (mod.title === "todo" && !profileFlags.hasGoals) {
              return (
                <SectionSuggestion
                  type="profile"
                  text={t.dash.suggest.profileGoals}
                />
              );
            }
            if (mod.title === "habits" && habitStats.total === 0) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptyAddHabit}
                  linkTo="/habits"
                />
              );
            }
            if (mod.title === "habits" && habitStats.total > 0) {
              return (
                <SectionSuggestion
                  type="tip"
                  text={t.dash.suggest.tipDailyCheckin}
                />
              );
            }
            if (mod.title === "focus" && focusStats.totalMinutes === 0) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptyStartFocus}
                  linkTo="/focus"
                />
              );
            }
            if (mod.title === "focus" && !profileFlags.hasAge) {
              return (
                <SectionSuggestion
                  type="profile"
                  text={t.dash.suggest.profileWorkSchedule}
                />
              );
            }
            if (mod.title === "wellbeing" && moodStats.totalLogged === 0) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptyLogMood}
                  linkTo="/wellbeing"
                />
              );
            }
            if (mod.title === "wellbeing" && moodStats.totalLogged > 0) {
              return (
                <SectionSuggestion
                  type="tip"
                  text={t.dash.suggest.tipMoodDaily}
                />
              );
            }
            if (
              mod.title === "expense" &&
              transactions &&
              transactions.length === 0
            ) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptyAddExpense}
                  linkTo="/expense"
                />
              );
            }
            if (mod.title === "expense" && !profileFlags.hasCurrency) {
              return (
                <SectionSuggestion
                  type="profile"
                  text={t.dash.suggest.profileCurrency}
                />
              );
            }
            if (mod.title === "goals" && goalStats.total === 0) {
              return (
                <SectionSuggestion
                  type="empty"
                  text={t.dash.suggest.emptySetGoal}
                  linkTo="/goals"
                />
              );
            }
            return null;
          };
          return (
            <motion.div key={mod.title} variants={item}>
              <Link
                to={mod.path}
                className={`block glass rounded-2xl p-4 glass-card-hover ${mod.glow}`}
                aria-label={`${t.nav[mod.title as keyof typeof t.nav]} - ${mod.desc}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`rounded-xl p-2 ${mod.bg}`}>
                    <mod.icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {mod.score}%
                  </span>
                </div>
                <h3 className="font-semibold tracking-tight mb-1">
                  {t.nav[mod.title as keyof typeof t.nav]}
                </h3>
                <p className="text-xs text-muted-foreground">{mod.desc}</p>
                {getSuggestion()}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-4 hover-lift hover-blue">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-orange-500/10 p-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.streaks}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.dash.habitStreak}
              </span>
              <span className="font-semibold">
                {habitStats.totalStreak} {t.dash.days}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.dash.goalsActive}
              </span>
              <span className="font-semibold">{goalStats.active}</span>
            </div>
          </div>
          {goalStats.active === 0 && (
            <SectionSuggestion type="tip" text={t.dash.suggest.tipAllModules} />
          )}
        </div>
        <div className="glass rounded-2xl p-4 hover-lift hover-blue">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-blue-500/10 p-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.todaySummary}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.dash.tasksDone}</span>
              <span className="font-semibold">
                {taskStats.completed} / {taskStats.total}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.dash.focusTime}</span>
              <span className="font-semibold">
                {formatFocusTime(focusStats.todayMinutes)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-4 hover-lift hover-orange">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-yellow-500/10 p-1.5">
              <Wallet className="h-4 w-4 text-yellow-500" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.finances}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.dash.totalBalance}
              </span>
              <span className="font-semibold">
                ৳{walletBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.dash.thisMonth}</span>
              <span className="font-semibold text-green-500">
                +৳{transactionStats.thisMonthIncome.toLocaleString()}
              </span>
              <span className="font-semibold text-red-500">
                -৳{transactionStats.thisMonthExpense.toLocaleString()}
              </span>
            </div>
          </div>
          {walletBalance === 0 && (
            <SectionSuggestion
              type="empty"
              text={t.dash.suggest.emptyAddWallet}
              linkTo="/expense"
            />
          )}
        </div>
        <div className="glass rounded-2xl p-4 hover-lift hover-teal">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-pink-500/10 p-1.5">
              <Moon className="h-4 w-4 text-pink-500" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.wellbeing}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.dash.avgMood}</span>
              <span className="font-semibold">
                {moodStats.avgMood > 0
                  ? `${moodStats.avgMood}/5`
                  : t.dash.noData}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.dash.avgSleep}</span>
              <span className="font-semibold">
                {sleepStats.avgHours > 0
                  ? `${sleepStats.avgHours}h`
                  : t.dash.noData}
              </span>
            </div>
          </div>
          {sleepStats.totalLogged === 0 && (
            <SectionSuggestion type="tip" text={t.dash.suggest.tipMoodSleep} />
          )}
          {sleepStats.totalLogged > 0 && sleepStats.totalLogged < 7 && (
            <SectionSuggestion type="tip" text={t.dash.suggest.tipSleep7days} />
          )}
        </div>
      </motion.div>

      {recentActivity.length > 0 && (
        <motion.div
          variants={item}
          className="glass rounded-2xl p-4 hover-lift"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.recentActivity}</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <activity.icon
                  className={`h-4 w-4 shrink-0 ${activity.color}`}
                />
                <p className="text-sm flex-1 truncate">{activity.text}</p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {recentActivity.length === 0 && (
        <motion.div
          variants={item}
          className="glass rounded-2xl p-4 hover-lift"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{t.dash.recentActivity}</h3>
          </div>
          <SectionSuggestion
            type="empty"
            text={t.dash.suggest.emptyStartModule}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
