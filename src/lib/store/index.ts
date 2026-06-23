import { StoredRecord, getStore, setStore, generateId, now } from "./types";
import { tasks } from "./tasks";
import { habits } from "./habits";
import { wallets, wallets_extra } from "./wallets";
import { transactions, transactions_extra } from "./transactions";
import { goals } from "./goals";
import { focusSessions } from "./focus";
import { moods } from "./mood";
import { sleepLogs } from "./sleep";
import { gratitudeEntries, exerciseLogs, waterLogs } from "./wellness";
import { journal } from "./journal";
import { readingList } from "./reading";
import { kanban } from "./kanban";
import { notifications } from "./notifications";
import {
  receivables,
  payables,
  loans,
  investments,
  savingsGoals,
  expenseGroups,
  recurringTransactions,
  financialReports,
} from "./finance";
import { contacts, userProfiles, users } from "./social";

const studySessions = {
  list(): StoredRecord[] {
    return getStore("studySessions");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("studySessions");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("studySessions", items);
    return item;
  },
  remove(id: string): void {
    setStore(
      "studySessions",
      getStore("studySessions").filter((s) => s._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("studySessions");
    return {
      totalHours:
        Math.round(
          (items.reduce((sum, s) => sum + ((s.duration as number) || 0), 0) /
            60) *
            10,
        ) / 10,
      sessionsCount: items.length,
      subjectsBreakdown: [],
    };
  },
};

const dailyCheckins = {
  list(): StoredRecord[] {
    return getStore("dailyCheckins");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("dailyCheckins");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("dailyCheckins", items);
    return item;
  },
  today(): StoredRecord | null {
    const items = getStore("dailyCheckins");
    const todayStart = new Date().setHours(0, 0, 0, 0);
    return items.find((c) => (c.date as number) >= todayStart) || null;
  },
  stats(): Record<string, unknown> {
    const items = getStore("dailyCheckins");
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
    };
  },
};

const mealLogs = {
  list(): StoredRecord[] {
    return getStore("mealLogs");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("mealLogs");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("mealLogs", items);
    return item;
  },
  remove(id: string): void {
    setStore(
      "mealLogs",
      getStore("mealLogs").filter((m) => m._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("mealLogs");
    return {
      totalCalories: items.reduce(
        (sum, m) => sum + ((m.calories as number) || 0),
        0,
      ),
      totalProtein: items.reduce(
        (sum, m) => sum + ((m.protein as number) || 0),
        0,
      ),
      totalCarbs: items.reduce((sum, m) => sum + ((m.carbs as number) || 0), 0),
      totalFat: items.reduce((sum, m) => sum + ((m.fat as number) || 0), 0),
    };
  },
};

const admin = {
  listUsers(): StoredRecord[] {
    return [];
  },
  getStats(): Record<string, number> {
    return {
      totalUsers: 0,
      activeToday: 0,
      totalTasks: 0,
      totalHabits: 0,
      totalTransactions: 0,
    };
  },
  grantPremium(): void {},
  revokePremium(): void {},
  deleteUser(): void {},
};

const automation = {
  listRules(): StoredRecord[] {
    return getStore("automationRules");
  },
  createRule(data: Record<string, unknown>): StoredRecord {
    const items = getStore("automationRules");
    const item = {
      _id: generateId(),
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.push(item);
    setStore("automationRules", items);
    return item;
  },
  updateRule(): void {},
  deleteRule(id: string): void {
    setStore(
      "automationRules",
      getStore("automationRules").filter((r) => r._id !== id),
    );
  },
  getSmartSuggestions(): string[] {
    return [];
  },
};

const challenges = {
  listChallenges(): StoredRecord[] {
    return getStore("challenges");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("challenges");
    const item = {
      _id: generateId(),
      isActive: true,
      createdAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("challenges", items);
    return item;
  },
  join(): void {},
  leave(): void {},
  updateProgress(): void {},
  getLeaderboard(): StoredRecord[] {
    return [];
  },
};

const achievements = {
  listAchievements(): StoredRecord[] {
    return getStore("achievements");
  },
  listUserAchievements(): StoredRecord[] {
    return getStore("userAchievements");
  },
  unlockAchievement(data: Record<string, unknown>): void {
    const items = getStore("userAchievements");
    const exists = items.find((a) => a.achievementId === data.achievementId);
    if (!exists) {
      items.push({
        _id: generateId(),
        unlockedAt: now(),
        ...data,
      } as StoredRecord);
      setStore("userAchievements", items);
    }
  },
  checkAndUnlockAchievements(): void {},
};

const insights = {
  getMoodInsights(): Record<string, unknown> {
    return { topMoods: [], averageValue: 0, trend: [] };
  },
  getHabitInsights(): Record<string, unknown> {
    return { completionRate: 0, bestDay: "", topHabits: [] };
  },
};

const news = {
  fetchNews(): Record<string, unknown> {
    return { articles: [], source: "demo" };
  },
};

const weeklyReport = {
  sendWeeklyReport(): void {},
  sendWeeklyReportEmail(): void {},
};

const apiManagement = {
  getConfig(): StoredRecord[] {
    const configs = getStore("apiConfig");
    if (configs.length === 0) {
      const defaults = [
        {
          endpoint: "/api/tasks",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "core",
          description: "List user tasks",
        },
        {
          endpoint: "/api/tasks",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "core",
          description: "Create a task",
        },
        {
          endpoint: "/api/habits",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "core",
          description: "List user habits",
        },
        {
          endpoint: "/api/habits",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "core",
          description: "Create a habit",
        },
        {
          endpoint: "/api/transactions",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "finance",
          description: "List transactions",
        },
        {
          endpoint: "/api/transactions",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "finance",
          description: "Create transaction",
        },
        {
          endpoint: "/api/wallets",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "finance",
          description: "List wallets",
        },
        {
          endpoint: "/api/wallets",
          method: "POST",
          enabled: true,
          rateLimit: 20,
          timeout: 5000,
          category: "finance",
          description: "Create wallet",
        },
        {
          endpoint: "/api/moods",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "wellbeing",
          description: "List mood entries",
        },
        {
          endpoint: "/api/moods",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "wellbeing",
          description: "Log mood",
        },
        {
          endpoint: "/api/sleep",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "wellbeing",
          description: "List sleep logs",
        },
        {
          endpoint: "/api/sleep",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "wellbeing",
          description: "Log sleep",
        },
        {
          endpoint: "/api/goals",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "core",
          description: "List goals",
        },
        {
          endpoint: "/api/goals",
          method: "POST",
          enabled: true,
          rateLimit: 20,
          timeout: 5000,
          category: "core",
          description: "Create goal",
        },
        {
          endpoint: "/api/focus",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "productivity",
          description: "List focus sessions",
        },
        {
          endpoint: "/api/focus",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "productivity",
          description: "Start focus session",
        },
        {
          endpoint: "/api/journal",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "wellbeing",
          description: "List journal entries",
        },
        {
          endpoint: "/api/journal",
          method: "POST",
          enabled: true,
          rateLimit: 30,
          timeout: 5000,
          category: "wellbeing",
          description: "Create journal entry",
        },
        {
          endpoint: "/api/reading",
          method: "GET",
          enabled: true,
          rateLimit: 60,
          timeout: 5000,
          category: "learning",
          description: "List reading items",
        },
        {
          endpoint: "/api/reading",
          method: "POST",
          enabled: true,
          rateLimit: 20,
          timeout: 5000,
          category: "learning",
          description: "Add reading item",
        },
        {
          endpoint: "/api/admin/stats",
          method: "GET",
          enabled: true,
          rateLimit: 10,
          timeout: 10000,
          category: "admin",
          description: "Get admin statistics",
        },
        {
          endpoint: "/api/admin/users",
          method: "GET",
          enabled: true,
          rateLimit: 10,
          timeout: 10000,
          category: "admin",
          description: "List all users",
        },
        {
          endpoint: "/api/admin/config",
          method: "GET",
          enabled: true,
          rateLimit: 10,
          timeout: 5000,
          category: "admin",
          description: "Get system config",
        },
        {
          endpoint: "/api/admin/config",
          method: "PUT",
          enabled: true,
          rateLimit: 5,
          timeout: 5000,
          category: "admin",
          description: "Update system config",
        },
        {
          endpoint: "/api/news",
          method: "GET",
          enabled: true,
          rateLimit: 20,
          timeout: 15000,
          category: "content",
          description: "Fetch news feed",
        },
      ];
      const items = defaults.map((d) => ({
        _id: generateId(),
        ...d,
        updatedAt: now(),
      }));
      setStore("apiConfig", items);
      return items;
    }
    return configs;
  },
  updateConfig(data: Record<string, unknown>): void {
    const items = getStore("apiConfig");
    const existing = items.find(
      (i) => i.endpoint === data.endpoint && i.method === data.method,
    );
    if (existing) {
      if (data.enabled !== undefined) existing.enabled = data.enabled;
      if (data.rateLimit !== undefined) existing.rateLimit = data.rateLimit;
      if (data.timeout !== undefined) existing.timeout = data.timeout;
      existing.updatedAt = now();
      setStore("apiConfig", items);
    } else {
      items.push({
        _id: generateId(),
        endpoint: data.endpoint as string,
        method: data.method as string,
        enabled: (data.enabled as boolean) ?? true,
        rateLimit: (data.rateLimit as number) ?? 60,
        timeout: (data.timeout as number) ?? 5000,
        category: (data.category as string) ?? "core",
        description: data.description as string,
        updatedAt: now(),
      });
      setStore("apiConfig", items);
    }
  },
  getHealth(): StoredRecord[] {
    const configs = getStore("apiConfig");
    const logs = getStore("apiLogs");
    const oneHourAgo = now() - 3600000;
    return configs.map((config) => {
      const endpointLogs = logs.filter(
        (l) =>
          l.endpoint === config.endpoint &&
          l.method === config.method &&
          (l.timestamp as number) >= oneHourAgo,
      );
      const totalRequests = endpointLogs.length;
      const errorRequests = endpointLogs.filter(
        (l) => (l.status as number) >= 400,
      ).length;
      const avgResponseTime =
        totalRequests > 0
          ? endpointLogs.reduce(
              (sum, l) => sum + (l.responseTime as number),
              0,
            ) / totalRequests
          : 0;
      return {
        ...config,
        totalRequests,
        errorRequests,
        errorRate:
          totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime),
        uptime:
          totalRequests > 0
            ? ((totalRequests - errorRequests) / totalRequests) * 100
            : 100,
      };
    });
  },
  listKeys(): StoredRecord[] {
    return getStore("apiKeys");
  },
  createKey(data: Record<string, unknown>): StoredRecord {
    const items = getStore("apiKeys");
    const key = `pv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const item = {
      _id: generateId(),
      key,
      name: data.name as string,
      permissions: (data.permissions as string[]) ?? [],
      active: true,
      createdAt: now(),
      usageCount: 0,
    };
    items.unshift(item);
    setStore("apiKeys", items);
    return item;
  },
  revokeKey(data: Record<string, unknown>): void {
    const items = getStore("apiKeys");
    const item = items.find((i) => i._id === data.id);
    if (item) {
      item.active = false;
      setStore("apiKeys", items);
    }
  },
  deleteKey(data: Record<string, unknown>): void {
    let items = getStore("apiKeys");
    items = items.filter((i) => i._id !== data.id);
    setStore("apiKeys", items);
  },
  getLogs(data: Record<string, unknown>): StoredRecord[] {
    let logs = getStore("apiLogs");
    logs.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
    if (data.endpoint) {
      logs = logs.filter((l) => l.endpoint === data.endpoint);
    }
    if (data.status) {
      logs = logs.filter((l) => l.status === data.status);
    }
    const limit = (data.limit as number) ?? 100;
    return logs.slice(0, limit);
  },
  getStats(): Record<string, unknown> {
    const logs = getStore("apiLogs");
    const now_ = now();
    const oneDayAgo = now_ - 86400000;
    const oneWeekAgo = now_ - 604800000;
    const todayLogs = logs.filter((l) => (l.timestamp as number) >= oneDayAgo);
    const weekLogs = logs.filter((l) => (l.timestamp as number) >= oneWeekAgo);
    const totalErrors = logs.filter((l) => (l.status as number) >= 400).length;
    const todayErrors = todayLogs.filter(
      (l) => (l.status as number) >= 400,
    ).length;
    const avgResponseTime =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.responseTime as number), 0) /
          logs.length
        : 0;
    const endpointCounts: Record<string, number> = {};
    logs.forEach((l) => {
      endpointCounts[l.endpoint as string] =
        (endpointCounts[l.endpoint as string] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
    const dailyCounts: Record<string, number> = {};
    weekLogs.forEach((l) => {
      const day = new Date(l.timestamp as number).toISOString().split("T")[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const keys = getStore("apiKeys");
    return {
      totalRequests: logs.length,
      todayRequests: todayLogs.length,
      weekRequests: weekLogs.length,
      totalErrors,
      todayErrors,
      errorRate: logs.length > 0 ? (totalErrors / logs.length) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      topEndpoints,
      dailyCounts,
      activeKeys: keys.filter((k) => k.active).length,
      totalKeys: keys.length,
    };
  },
  getDeploymentInfo(): Record<string, unknown> {
    const configs = getStore("apiConfig");
    const keys = getStore("apiKeys");
    const logs = getStore("apiLogs");
    const categories = [...new Set(configs.map((c) => c.category))];
    return {
      totalEndpoints: configs.length,
      enabledEndpoints: configs.filter((c) => c.enabled).length,
      disabledEndpoints: configs.filter((c) => !c.enabled).length,
      categories,
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.active).length,
      totalLogs: logs.length,
      lastActivity:
        logs.length > 0
          ? Math.max(...logs.map((l) => l.timestamp as number))
          : null,
    };
  },
  logRequest(data: Record<string, unknown>): void {
    const items = getStore("apiLogs");
    items.unshift({
      _id: generateId(),
      endpoint: data.endpoint as string,
      method: data.method as string,
      status: data.status as number,
      responseTime: data.responseTime as number,
      payloadSize: data.payloadSize as number,
      userId: data.userId as string,
      error: data.error as string,
      timestamp: now(),
    });
    setStore("apiLogs", items);
  },
  clearLogs(): void {
    setStore("apiLogs", []);
  },
};

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
  wallets_extra,
  transactions_extra,
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
};
