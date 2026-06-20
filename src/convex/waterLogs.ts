import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await ctx.db
      .query("waterLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return logs.filter(
      (log) => log.date >= startOfDay.getTime() && log.date <= endOfDay.getTime(),
    );
  },
});

export const getTodayTotal = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await ctx.db
      .query("waterLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const todayLogs = logs.filter(
      (log) => log.date >= today.getTime() && log.date < tomorrow.getTime(),
    );

    return todayLogs.reduce((sum, log) => sum + log.glasses, 0);
  },
});

export const addWater = mutation({
  args: { glasses: v.number(), date: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("waterLogs", {
      userId: user._id,
      glasses: args.glasses,
      date: args.date,
      createdAt: Date.now(),
    });
  },
});

export const removeWater = mutation({
  args: { logId: v.id("waterLogs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const log = await ctx.db.get(args.logId);
    if (!log) throw new Error("Water log not found");
    if (log.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.logId);
  },
});

export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const logs = await ctx.db
      .query("waterLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const weekLogs = logs.filter((log) => log.date >= weekAgo.getTime());

    const dailyTotals: Record<string, number> = {};
    weekLogs.forEach((log) => {
      const dateKey = new Date(log.date).toISOString().split("T")[0];
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.glasses;
    });

    return dailyTotals;
  },
});
