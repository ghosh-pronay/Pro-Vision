import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { calculateStreak } from "./dashboard-utils"

export function useDashboardStats() {
  const tasks = useQuery(api.tasks.list)
  const habits = useQuery(api.habits.list)
  const transactions = useQuery(api.transactions.list)
  const focusSessions = useQuery(api.focusSessions.list)
  const goals = useQuery(api.goals.list)
  const wallets = useQuery(api.wallets.list)
  const moods = useQuery(api.moods.list)
  const sleepLogs = useQuery(api.sleepLogs.list)
  const profile = useQuery(api.userProfiles.get)

  const taskStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 }
    // eslint-disable-next-line react-hooks/purity -- time snapshot is intentional
    const now = Date.now()
    let completed = 0
    let pending = 0
    let overdue = 0
    for (const t of tasks) {
      if (t.completed) {
        completed++
      } else {
        pending++
        if (t.dueDate && t.dueDate < now) overdue++
      }
    }
    return { total: tasks.length, completed, pending, overdue }
  }, [tasks])

  const habitStats = useMemo(() => {
    if (!habits)
      return { total: 0, totalStreak: 0, avgRate: 0, todayCompleted: 0 }
    const today = new Date().setHours(0, 0, 0, 0)
    const todayCompleted = habits.filter((h) =>
      h.completedDates.some((d) => new Date(d).setHours(0, 0, 0, 0) === today),
    ).length
    let bestStreak = 0
    for (const habit of habits) {
      const streak = calculateStreak(habit.completedDates)
      if (streak > bestStreak) bestStreak = streak
    }
    return {
      total: habits.length,
      totalStreak: bestStreak,
      avgRate:
        habits.length > 0
          ? Math.round((todayCompleted / habits.length) * 100)
          : 0,
      todayCompleted,
    }
  }, [habits])

  const transactionStats = useMemo(() => {
    if (!transactions)
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        thisMonthIncome: 0,
        thisMonthExpense: 0,
        expenseScore: 0,
      }
    const now = new Date()
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
    let totalIncome = 0
    let totalExpense = 0
    let thisMonthIncome = 0
    let thisMonthExpense = 0
    let lastMonthExpense = 0
    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncome += tx.amount
        if (tx.date >= thisMonthStart) thisMonthIncome += tx.amount
      } else if (tx.type === "expense") {
        totalExpense += tx.amount
        if (tx.date >= thisMonthStart) {
          thisMonthExpense += tx.amount
        } else if (tx.date >= lastMonthStart) {
          lastMonthExpense += tx.amount
        }
      }
    }
    let expenseScore = 0
    if (lastMonthExpense === 0) {
      expenseScore = thisMonthExpense > 0 ? 50 : 0
    } else {
      const change =
        ((lastMonthExpense - thisMonthExpense) / lastMonthExpense) * 100
      expenseScore = Math.max(0, Math.min(100, Math.round(change + 50)))
    }
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      thisMonthIncome,
      thisMonthExpense,
      expenseScore,
    }
  }, [transactions])

  const focusStats = useMemo(() => {
    if (!focusSessions)
      return { sessions: 0, totalMinutes: 0, totalHours: 0, todayMinutes: 0 }
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const todayMinutes = focusSessions
      .filter((s) => s.completedAt >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0)
    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0)
    return {
      sessions: focusSessions.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      todayMinutes,
    }
  }, [focusSessions])

  const goalStats = useMemo(() => {
    if (!goals) return { total: 0, completed: 0, active: 0 }
    return {
      total: goals.length,
      completed: goals.filter((g) => g.status === "completed").length,
      active: goals.filter((g) => g.status === "active").length,
    }
  }, [goals])

  const walletBalance = useMemo(() => {
    if (!wallets) return 0
    return wallets.reduce((sum, w) => sum + w.balance, 0)
  }, [wallets])

  const moodStats = useMemo(() => {
    if (!moods) return { todayMood: null, avgMood: 0, totalLogged: 0 }
    const today = new Date().setHours(0, 0, 0, 0)
    const todayMood = moods.find(
      (m) => new Date(m.date).setHours(0, 0, 0, 0) === today,
    )
    const avgMood =
      moods.length > 0
        ? Math.round(moods.reduce((sum, m) => sum + m.value, 0) / moods.length)
        : 0
    return {
      todayMood: todayMood?.mood ?? null,
      avgMood,
      totalLogged: moods.length,
    }
  }, [moods])

  const sleepStats = useMemo(() => {
    if (!sleepLogs) return { todayHours: 0, avgHours: 0, totalLogged: 0 }
    const today = new Date().setHours(0, 0, 0, 0)
    const todayLog = sleepLogs.find(
      (l) => new Date(l.date).setHours(0, 0, 0, 0) === today,
    )
    const avgHours =
      sleepLogs.length > 0
        ? Math.round(
            (sleepLogs.reduce((sum, l) => sum + l.hours, 0) /
              sleepLogs.length) *
              10,
          ) / 10
        : 0
    return {
      todayHours: todayLog?.hours ?? 0,
      avgHours,
      totalLogged: sleepLogs.length,
    }
  }, [sleepLogs])

  const isLoading =
    tasks === undefined ||
    habits === undefined ||
    transactions === undefined ||
    focusSessions === undefined ||
    goals === undefined ||
    wallets === undefined ||
    moods === undefined ||
    sleepLogs === undefined

  return {
    tasks,
    habits,
    transactions,
    focusSessions,
    goals,
    wallets,
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
  }
}
