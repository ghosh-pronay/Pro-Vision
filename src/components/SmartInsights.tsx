import { motion } from "framer-motion"
import { useI18n } from "@/hooks/use-i18n"
import React, { useMemo, type ElementType } from "react"
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Wallet,
  Moon,
  Brain,
  Trophy,
} from "lucide-react"

interface Insight {
  id: string
  icon: ElementType
  title: string
  value: string
  trend: "up" | "down" | "neutral"
  color: string
}

interface InsightTranslations {
  weeklyTasksDone: string
  weeklyFocus: string
  todaysHabits: string
  monthlySpending: string
  moodTrend: string
  avgSleep: string
  title: string
}

interface SmartTask {
  completed: boolean
  updatedAt?: number
}

interface SmartFocusSession {
  completedAt: number
  duration: number
}

interface SmartHabit {
  completedDates: number[]
}

interface SmartTransaction {
  type: string
  date: number
  amount: number
}

interface SmartMood {
  value: number
}

interface SmartSleepLog {
  hours: number
}

interface SmartInsightsProps {
  tasks: SmartTask[] | undefined
  habits: SmartHabit[] | undefined
  transactions: SmartTransaction[] | undefined
  focusSessions: SmartFocusSession[] | undefined
  moods: SmartMood[] | undefined
  sleepLogs: SmartSleepLog[] | undefined
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function SmartInsights({
  tasks,
  habits,
  transactions,
  focusSessions,
  moods,
  sleepLogs,
}: SmartInsightsProps) {
  const { t } = useI18n()

  const insights = useMemo(() => {
    const result: Insight[] = []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    if (tasks && tasks.length > 0) {
      const completedThisWeek = tasks.filter(
        (task) =>
          task.completed &&
          task.updatedAt !== undefined &&
          new Date(task.updatedAt).getTime() >= weekAgo.getTime(),
      ).length
      const completionRate = Math.round(
        (completedThisWeek / tasks.length) * 100,
      )

      result.push({
        id: "weekly-tasks",
        icon: Target,
        title: (t.insights as unknown as InsightTranslations).weeklyTasksDone,
        value: `${completionRate}%`,
        trend:
          completionRate > 50 ? "up" : completionRate < 30 ? "down" : "neutral",
        color: "text-blue-500",
      })
    }

    if (focusSessions && focusSessions.length > 0) {
      const thisWeekSessions = focusSessions.filter(
        (s) => new Date(s.completedAt).getTime() >= weekAgo.getTime(),
      )
      const totalMinutes = thisWeekSessions.reduce(
        (sum, s) => sum + s.duration,
        0,
      )
      const hours = Math.round(totalMinutes / 60)

      result.push({
        id: "weekly-focus",
        icon: Zap,
        title: (t.insights as unknown as InsightTranslations).weeklyFocus,
        value: `${hours}h`,
        trend: hours > 10 ? "up" : hours < 5 ? "down" : "neutral",
        color: "text-red-500",
      })
    }

    if (habits && habits.length > 0) {
      const today = new Date().setHours(0, 0, 0, 0)
      const completedToday = habits.filter((h) =>
        h.completedDates.some(
          (d) => new Date(d).setHours(0, 0, 0, 0) === today,
        ),
      ).length
      const consistency = Math.round((completedToday / habits.length) * 100)

      result.push({
        id: "todays-habits",
        icon: Trophy,
        title: (t.insights as unknown as InsightTranslations).todaysHabits,
        value: `${consistency}%`,
        trend: consistency > 70 ? "up" : consistency < 40 ? "down" : "neutral",
        color: "text-green-500",
      })
    }

    if (transactions && transactions.length > 0) {
      const thisMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).getTime()
      const lastMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      ).getTime()

      const thisMonthExpense = transactions
        .filter((tx) => tx.type === "expense" && tx.date >= thisMonthStart)
        .reduce((sum, tx) => sum + tx.amount, 0)

      const lastMonthExpense = transactions
        .filter(
          (tx) =>
            tx.type === "expense" &&
            tx.date >= lastMonthStart &&
            tx.date < thisMonthStart,
        )
        .reduce((sum, tx) => sum + tx.amount, 0)

      const change =
        lastMonthExpense > 0
          ? Math.round(
              ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100,
            )
          : 0

      result.push({
        id: "monthly-spending",
        icon: Wallet,
        title: (t.insights as unknown as InsightTranslations).monthlySpending,
        value: `৳${thisMonthExpense.toLocaleString()}`,
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        color: "text-yellow-500",
      })
    }

    if (moods && moods.length > 0) {
      const recentMoods = moods.slice(0, 7)
      const avgMood =
        recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length
      const moodLabel =
        avgMood > 4
          ? "Great"
          : avgMood > 3
            ? "Good"
            : avgMood > 2
              ? "Okay"
              : "Low"

      result.push({
        id: "mood-trend",
        icon: Brain,
        title: (t.insights as unknown as InsightTranslations).moodTrend,
        value: `${moodLabel} (${avgMood.toFixed(1)}/5)`,
        trend: avgMood > 3.5 ? "up" : avgMood < 2.5 ? "down" : "neutral",
        color: "text-purple-500",
      })
    }

    if (sleepLogs && sleepLogs.length > 0) {
      const recentSleep = sleepLogs.slice(0, 7)
      const avgHours =
        recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length

      result.push({
        id: "avg-sleep",
        icon: Moon,
        title: (t.insights as unknown as InsightTranslations).avgSleep,
        value: `${avgHours.toFixed(1)}h`,
        trend: avgHours > 7 ? "up" : avgHours < 6 ? "down" : "neutral",
        color: "text-indigo-500",
      })
    }

    return result
  }, [tasks, habits, transactions, focusSessions, moods, sleepLogs, t])

  if (insights.length === 0) return null

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-2">
          <Brain className="h-4 w-4 text-cyan-500" />
        </div>
        <h3 className="font-semibold text-sm">
          {(t.insights as unknown as InsightTranslations).title}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-3 hover-lift hover-blue"
          >
            <div className="flex items-center gap-2 mb-2">
              <insight.icon className={`h-4 w-4 ${insight.color}`} />
              <span className="text-xs text-muted-foreground">
                {insight.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{insight.value}</span>
              {insight.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
              {insight.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default React.memo(SmartInsights)
