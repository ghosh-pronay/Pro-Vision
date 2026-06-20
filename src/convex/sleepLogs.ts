import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("sleepLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    hours: v.number(),
    quality: v.union(v.literal("great"), v.literal("good"), v.literal("okay"), v.literal("bad")),
    bedTime: v.string(),
    wakeTime: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    return await ctx.db.insert("sleepLogs", {
      userId: user._id,
      hours: args.hours,
      quality: args.quality,
      bedTime: args.bedTime,
      wakeTime: args.wakeTime,
      date: args.date,
      notes: args.notes,
      createdAt: now,
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { avgHours: 0, streak: 0, todayHours: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return { avgHours: 0, streak: 0, todayHours: 0 };

    const sleepLogs = await ctx.db
      .query("sleepLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const today = new Date().setHours(0, 0, 0, 0);
    const todayLog = sleepLogs.find(
      (l) => new Date(l.date).setHours(0, 0, 0, 0) === today
    );

    const avgHours = sleepLogs.length > 0
      ? Math.round(sleepLogs.reduce((sum, l) => sum + l.hours, 0) / sleepLogs.length * 10) / 10
      : 0;

    return {
      avgHours,
      streak: 0,
      todayHours: todayLog?.hours ?? 0,
    };
  },
});
