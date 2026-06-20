import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_ENDPOINTS = [
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

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const configs = await ctx.db.query("apiConfig").collect();
    if (configs.length === 0) {
      return DEFAULT_ENDPOINTS;
    }
    return configs;
  },
});

export const updateConfig = mutation({
  args: {
    endpoint: v.string(),
    method: v.string(),
    enabled: v.optional(v.boolean()),
    rateLimit: v.optional(v.number()),
    timeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("apiConfig")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.enabled !== undefined && { enabled: args.enabled }),
        ...(args.rateLimit !== undefined && { rateLimit: args.rateLimit }),
        ...(args.timeout !== undefined && { timeout: args.timeout }),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("apiConfig", {
        endpoint: args.endpoint,
        method: args.method,
        enabled: args.enabled ?? true,
        rateLimit: args.rateLimit ?? 60,
        timeout: args.timeout ?? 5000,
        category: "core",
        updatedAt: Date.now(),
      });
    }
  },
});

export const getHealth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const configs = await ctx.db.query("apiConfig").collect();
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const recentLogs = await ctx.db
      .query("apiLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .collect();

    return configs.map((config) => {
      const endpointLogs = recentLogs.filter(
        (l) => l.endpoint === config.endpoint && l.method === config.method,
      );
      const totalRequests = endpointLogs.length;
      const errorRequests = endpointLogs.filter((l) => l.status >= 400).length;
      const avgResponseTime =
        totalRequests > 0
          ? endpointLogs.reduce((sum, l) => sum + l.responseTime, 0) /
            totalRequests
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
});

export const listKeys = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db.query("apiKeys").collect();
  },
});

export const createKey = mutation({
  args: {
    name: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const key = `pv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    return await ctx.db.insert("apiKeys", {
      key,
      name: args.name,
      permissions: args.permissions,
      active: true,
      createdAt: Date.now(),
      usageCount: 0,
    });
  },
});

export const revokeKey = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.patch(args.id, { active: false });
  },
});

export const deleteKey = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});

export const getLogs = query({
  args: {
    endpoint: v.optional(v.string()),
    status: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let logs;
    if (args.endpoint) {
      logs = await ctx.db
        .query("apiLogs")
        .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint!))
        .order("desc")
        .take(args.limit ?? 100);
    } else {
      logs = await ctx.db
        .query("apiLogs")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit ?? 100);
    }

    if (args.status) {
      return logs.filter((l) => l.status === args.status);
    }
    return logs;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const oneWeekAgo = now - 604800000;

    const allLogs = await ctx.db.query("apiLogs").collect();
    const todayLogs = allLogs.filter((l) => l.timestamp >= oneDayAgo);
    const weekLogs = allLogs.filter((l) => l.timestamp >= oneWeekAgo);

    const totalRequests = allLogs.length;
    const todayRequests = todayLogs.length;
    const weekRequests = weekLogs.length;

    const totalErrors = allLogs.filter((l) => l.status >= 400).length;
    const todayErrors = todayLogs.filter((l) => l.status >= 400).length;

    const avgResponseTime =
      allLogs.length > 0
        ? allLogs.reduce((sum, l) => sum + l.responseTime, 0) / allLogs.length
        : 0;

    const endpointCounts: Record<string, number> = {};
    allLogs.forEach((l) => {
      endpointCounts[l.endpoint] = (endpointCounts[l.endpoint] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    const dailyCounts: Record<string, number> = {};
    weekLogs.forEach((l) => {
      const day = new Date(l.timestamp).toISOString().split("T")[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const keys = await ctx.db.query("apiKeys").collect();
    const activeKeys = keys.filter((k) => k.active).length;

    return {
      totalRequests,
      todayRequests,
      weekRequests,
      totalErrors,
      todayErrors,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      topEndpoints,
      dailyCounts,
      activeKeys,
      totalKeys: keys.length,
    };
  },
});

export const getDeploymentInfo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const configs = await ctx.db.query("apiConfig").collect();
    const keys = await ctx.db.query("apiKeys").collect();
    const logs = await ctx.db.query("apiLogs").collect();

    const categories = [...new Set(configs.map((c) => c.category))];
    const enabledCount = configs.filter((c) => c.enabled).length;

    return {
      totalEndpoints: configs.length,
      enabledEndpoints: enabledCount,
      disabledEndpoints: configs.length - enabledCount,
      categories,
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.active).length,
      totalLogs: logs.length,
      lastActivity:
        logs.length > 0 ? Math.max(...logs.map((l) => l.timestamp)) : null,
    };
  },
});

export const logRequest = mutation({
  args: {
    endpoint: v.string(),
    method: v.string(),
    status: v.number(),
    responseTime: v.number(),
    payloadSize: v.number(),
    userId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("apiLogs", {
      endpoint: args.endpoint,
      method: args.method,
      status: args.status,
      responseTime: args.responseTime,
      payloadSize: args.payloadSize,
      userId: args.userId,
      error: args.error,
      timestamp: Date.now(),
    });
  },
});

export const clearLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const logs = await ctx.db.query("apiLogs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});
