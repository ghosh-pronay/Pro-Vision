import { StoredRecord, getStore, setStore, generateId, now } from "./types"
import { tasks } from "./tasks"
import { habits } from "./habits"
import { wallets } from "./wallets"
import { transactions } from "./transactions"
import { goals } from "./goals"
import { focusSessions } from "./focus"
import { moods } from "./mood"
import { sleepLogs } from "./sleep"
import { gratitudeEntries, exerciseLogs, waterLogs } from "./wellness"
import { journal } from "./journal"
import { readingList } from "./reading"
import { kanban } from "./kanban"
import { notifications } from "./notifications"
import { apiManagement } from "./api-management"
import {
  receivables,
  payables,
  loans,
  investments,
  savingsGoals,
  expenseGroups,
  recurringTransactions,
  financialReports,
} from "./finance"
import { contacts, userProfiles, users } from "./social"

const studySessions = {
  list(): StoredRecord[] {
    return getStore("studySessions")
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("studySessions")
    const item = { _id: generateId(), createdAt: now(), ...data }
    items.unshift(item)
    setStore("studySessions", items)
    return item
  },
  remove(id: string): void {
    setStore(
      "studySessions",
      getStore("studySessions").filter((s) => s._id !== id),
    )
  },
  stats(): Record<string, unknown> {
    const items = getStore("studySessions")
    return {
      totalHours:
        Math.round(
          (items.reduce((sum, s) => sum + ((s.duration as number) || 0), 0) /
            60) *
            10,
        ) / 10,
      sessionsCount: items.length,
      subjectsBreakdown: [],
    }
  },
}

const dailyCheckins = {
  list(): StoredRecord[] {
    return getStore("dailyCheckins")
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("dailyCheckins")
    const item = { _id: generateId(), createdAt: now(), ...data }
    items.unshift(item)
    setStore("dailyCheckins", items)
    return item
  },
  today(): StoredRecord | null {
    const items = getStore("dailyCheckins")
    const todayStart = new Date().setHours(0, 0, 0, 0)
    return items.find((c) => (c.date as number) >= todayStart) || null
  },
  stats(): Record<string, unknown> {
    const items = getStore("dailyCheckins")
    return {
      avgMood: 0,
      avgEnergy:
        items.length > 0
          ? Math.round(
              items.reduce((sum, c) => sum + ((c.energy as number) || 0), 0) /
                items.length,
            )
          : 0,
      streak: 0,
    }
  },
}

const mealLogs = {
  list(): StoredRecord[] {
    return getStore("mealLogs")
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("mealLogs")
    const item = { _id: generateId(), createdAt: now(), ...data }
    items.unshift(item)
    setStore("mealLogs", items)
    return item
  },
  remove(id: string): void {
    setStore(
      "mealLogs",
      getStore("mealLogs").filter((m) => m._id !== id),
    )
  },
  stats(): Record<string, unknown> {
    const items = getStore("mealLogs")
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    for (const m of items) {
      totalCalories += (m.calories as number) || 0
      totalProtein += (m.protein as number) || 0
      totalCarbs += (m.carbs as number) || 0
      totalFat += (m.fat as number) || 0
    }
    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    }
  },
}

const admin = {
  listUsers(): StoredRecord[] {
    return []
  },
  getStats(): Record<string, number> {
    return {
      totalUsers: 0,
      activeToday: 0,
      totalTasks: 0,
      totalHabits: 0,
      totalTransactions: 0,
    }
  },
  grantPremium(): void {},
  revokePremium(): void {},
  deleteUser(): void {},
}

const automation = {
  listRules(): StoredRecord[] {
    return getStore("automationRules")
  },
  createRule(data: Record<string, unknown>): StoredRecord {
    const items = getStore("automationRules")
    const item = {
      _id: generateId(),
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    }
    items.push(item)
    setStore("automationRules", items)
    return item
  },
  updateRule(): void {},
  deleteRule(id: string): void {
    setStore(
      "automationRules",
      getStore("automationRules").filter((r) => r._id !== id),
    )
  },
  getSmartSuggestions(): string[] {
    return []
  },
}

const challenges = {
  listChallenges(): StoredRecord[] {
    return getStore("challenges")
  },
  listUserChallenges(): StoredRecord[] {
    return getStore("challenges")
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("challenges")
    const item = {
      _id: generateId(),
      isActive: true,
      createdAt: now(),
      ...data,
    }
    items.unshift(item)
    setStore("challenges", items)
    return item
  },
  join(_args?: Record<string, unknown>): void {},
  joinChallenge(_args?: Record<string, unknown>): void {},
  leave(): void {},
  updateProgress(): void {},
  getLeaderboard(): StoredRecord[] {
    return []
  },
}

const achievements = {
  listAchievements(): StoredRecord[] {
    return getStore("achievements")
  },
  listUserAchievements(): StoredRecord[] {
    return getStore("userAchievements")
  },
  unlockAchievement(data: Record<string, unknown>): void {
    const items = getStore("userAchievements")
    const exists = items.find((a) => a.achievementId === data.achievementId)
    if (!exists) {
      items.push({
        _id: generateId(),
        unlockedAt: now(),
        ...data,
      } as StoredRecord)
      setStore("userAchievements", items)
    }
  },
  checkAndUnlockAchievements(): void {},
}

const insights = {
  getMoodInsights(): Record<string, unknown> {
    return { topMoods: [], averageValue: 0, trend: [] }
  },
  getHabitInsights(): Record<string, unknown> {
    return { completionRate: 0, bestDay: "", topHabits: [] }
  },
}

const news = {
  fetchNews(): Record<string, unknown> {
    return { articles: [], source: "demo" }
  },
}

const weeklyReport = {
  sendWeeklyReport(): void {},
  sendWeeklyReportEmail(): void {},
}

export const localDB = {
  tasks,
  habits,
  wallets,
  transactions,
  goals,
  focusSessions,
  moods,
  sleepLogs,
  gratitudeEntries,
  journal,
  readingList,
  contacts,
  savingsGoals,
  studySessions,
  dailyCheckins,
  exerciseLogs,
  waterLogs,
  mealLogs,
  investments,
  loans,
  notifications,
  userProfiles,
  users,
  admin,
  kanban,
  recurringTransactions,
  automation,
  challenges,
  achievements,
  insights,
  expenseGroups,
  receivables,
  payables,
  news,
  weeklyReport,
  financialReports,
  apiManagement,
}
