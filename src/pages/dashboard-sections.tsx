import { type ElementType } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  Target,
  Wallet,
  Timer,
  Heart,
  Flame,
  Clock,
  Moon,
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
} from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import SectionSuggestion from "@/components/SectionSuggestion";
import { getMostRecent } from "@/lib/utils";
import { getTimeAgo, formatFocusTime } from "./dashboard-utils";

export function LifeScoreRing({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg
        className="h-24 w-24 -rotate-90"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label}: ${score}`}
      >
        <title>
          {label}: {score}
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
          strokeDasharray={`${(score / 100) * 264} 264`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{score}</span>
      </div>
    </div>
  );
}

interface ModuleDef {
  icon: ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
  path: string;
  score: number;
  glow: string;
}

interface ModuleCardProps {
  mod: ModuleDef;
  taskStats: { total: number };
  habitStats: { total: number; todayCompleted: number };
  focusStats: { totalMinutes: number };
  moodStats: { totalLogged: number };
  transactions: unknown[] | undefined;
  goalStats: { total: number };
  profileFlags: {
    hasGoals: boolean;
    hasAge: boolean;
    hasCurrency: boolean;
  };
}

export function ModuleCard({
  mod,
  taskStats,
  habitStats,
  focusStats,
  moodStats,
  transactions,
  goalStats,
  profileFlags,
}: ModuleCardProps) {
  const { t } = useI18n();

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
        <SectionSuggestion type="profile" text={t.dash.suggest.profileGoals} />
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
        <SectionSuggestion type="tip" text={t.dash.suggest.tipDailyCheckin} />
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
        <SectionSuggestion type="tip" text={t.dash.suggest.tipMoodDaily} />
      );
    }
    if (mod.title === "expense" && transactions && transactions.length === 0) {
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
  );
}

export function StreaksCard({
  habitStats,
  goalStats,
}: {
  habitStats: { totalStreak: number };
  goalStats: { active: number };
}) {
  const { t } = useI18n();
  return (
    <div className="glass rounded-2xl p-4 hover-lift hover-blue">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-lg bg-orange-500/10 p-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
        </div>
        <h3 className="font-semibold text-sm">{t.dash.streaks}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.dash.habitStreak}</span>
          <span className="font-semibold">
            {habitStats.totalStreak} {t.dash.days}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.dash.goalsActive}</span>
          <span className="font-semibold">{goalStats.active}</span>
        </div>
      </div>
      {goalStats.active === 0 && (
        <SectionSuggestion type="tip" text={t.dash.suggest.tipAllModules} />
      )}
    </div>
  );
}

export function TodaySummaryCard({
  taskStats,
  focusStats,
}: {
  taskStats: { completed: number; total: number };
  focusStats: { todayMinutes: number };
}) {
  const { t } = useI18n();
  return (
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
  );
}

export function FinancesCard({
  walletBalance,
  transactionStats,
}: {
  walletBalance: number;
  transactionStats: { thisMonthIncome: number; thisMonthExpense: number };
}) {
  const { t } = useI18n();
  return (
    <div className="glass rounded-2xl p-4 hover-lift hover-orange">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-lg bg-yellow-500/10 p-1.5">
          <Wallet className="h-4 w-4 text-yellow-500" />
        </div>
        <h3 className="font-semibold text-sm">{t.dash.finances}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.dash.totalBalance}</span>
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
  );
}

export function WellbeingCard({
  moodStats,
  sleepStats,
}: {
  moodStats: { avgMood: number };
  sleepStats: { avgHours: number; totalLogged: number };
}) {
  const { t } = useI18n();
  return (
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
            {moodStats.avgMood > 0 ? `${moodStats.avgMood}/5` : t.dash.noData}
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
  );
}

export interface Activity {
  id: string;
  icon: ElementType;
  text: string;
  time: string;
  color: string;
  timestamp: number;
}

export function RecentActivitySection({
  activities,
}: {
  activities: Activity[];
}) {
  const { t } = useI18n();
  return (
    <div className="glass rounded-2xl p-4 hover-lift">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{t.dash.recentActivity}</h3>
      </div>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <a.icon className={`h-4 w-4 shrink-0 ${a.color}`} />
              <p className="text-sm flex-1 truncate">{a.text}</p>
              <span className="text-xs text-muted-foreground shrink-0">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <SectionSuggestion
          type="empty"
          text={t.dash.suggest.emptyStartModule}
        />
      )}
    </div>
  );
}

export function HolidayCard({
  holiday,
  lang,
}: {
  holiday: { name: string; nameEn: string; date: string };
  lang: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {lang === "bn" ? holiday.name : holiday.nameEn}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(holiday.date + "T00:00:00").toLocaleDateString(
              lang === "bn" ? "bn-BD" : "en-US",
              { month: "long", day: "numeric" },
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuickActionBanner() {
  const { t } = useI18n();
  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between glow-blue">
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
    </div>
  );
}

export function buildRecentActivity(
  tasks:
    | { _id: string; title: string; completed: boolean; createdAt: number }[]
    | undefined,
  focusSessions:
    | { _id: string; duration: number; createdAt: number }[]
    | undefined,
  transactions:
    | {
        _id: string;
        type: string;
        amount: number;
        category: string;
        createdAt: number;
      }[]
    | undefined,
  moods: { _id: string; mood: string; createdAt: number }[] | undefined,
  habits: { _id: string; name: string; completedDates: number[] }[] | undefined,
  sleepLogs:
    | { _id: string; hours: number; quality: string; createdAt: number }[]
    | undefined,
): Activity[] {
  const activities: Activity[] = [];

  if (tasks && tasks.length > 0) {
    const r = getMostRecent(tasks, "createdAt");
    if (r) {
      activities.push({
        id: `task-${r._id}`,
        icon: CheckCircle,
        text: r.completed
          ? `Completed "${r.title}"`
          : `Added task "${r.title}"`,
        time: getTimeAgo(r.createdAt),
        color: "text-blue-500",
        timestamp: r.createdAt,
      });
    }
  }

  if (focusSessions && focusSessions.length > 0) {
    const r = getMostRecent(focusSessions, "createdAt");
    if (r) {
      activities.push({
        id: `focus-${r._id}`,
        icon: Timer,
        text: `Completed ${formatFocusTime(r.duration)} focus session`,
        time: getTimeAgo(r.createdAt),
        color: "text-red-500",
        timestamp: r.createdAt,
      });
    }
  }

  if (transactions && transactions.length > 0) {
    const r = getMostRecent(transactions, "createdAt");
    if (r) {
      activities.push({
        id: `tx-${r._id}`,
        icon: r.type === "income" ? TrendingUp : TrendingDown,
        text: `${r.type === "income" ? "Income" : "Expense"}: ৳${r.amount.toLocaleString()} (${r.category})`,
        time: getTimeAgo(r.createdAt),
        color: r.type === "income" ? "text-green-500" : "text-yellow-500",
        timestamp: r.createdAt,
      });
    }
  }

  if (moods && moods.length > 0) {
    const r = getMostRecent(moods, "createdAt");
    if (r) {
      activities.push({
        id: `mood-${r._id}`,
        icon: Heart,
        text: `Logged mood: ${r.mood}`,
        time: getTimeAgo(r.createdAt),
        color: "text-pink-500",
        timestamp: r.createdAt,
      });
    }
  }

  if (habits && habits.length > 0) {
    const today = new Date().setHours(0, 0, 0, 0);
    const checked = habits.find((h) =>
      h.completedDates.some((d) => new Date(d).setHours(0, 0, 0, 0) === today),
    );
    if (checked) {
      activities.push({
        id: `habit-${checked._id}`,
        icon: Target,
        text: `Checked in: "${checked.name}"`,
        time: "Today",
        color: "text-green-500",
        timestamp: Date.now(),
      });
    }
  }

  if (sleepLogs && sleepLogs.length > 0) {
    const r = getMostRecent(sleepLogs, "createdAt");
    if (r) {
      activities.push({
        id: `sleep-${r._id}`,
        icon: Moon,
        text: `Logged ${r.hours}h sleep (${r.quality})`,
        time: getTimeAgo(r.createdAt),
        color: "text-indigo-500",
        timestamp: r.createdAt,
      });
    }
  }

  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
}
