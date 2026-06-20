import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Used internally by weeklyReport.ts to build the per-user weekly summary.
export const listByDateRange = internalQuery({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("moods")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return all.filter((m) => m.date >= args.startDate && m.date <= args.endDate);
  },
});

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
      .query("moods")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    mood: v.union(v.literal("great"), v.literal("good"), v.literal("okay"), v.literal("bad"), v.literal("terrible")),
    value: v.number(),
    note: v.optional(v.string()),
    date: v.number(),
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
    return await ctx.db.insert("moods", {
      userId: user._id,
      mood: args.mood,
      value: args.value,
      note: args.note,
      date: args.date,
      createdAt: now,
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { moodStreak: 0, todayMood: null, avgMood: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return { moodStreak: 0, todayMood: null, avgMood: 0 };

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const today = new Date().setHours(0, 0, 0, 0);
    const todayMood = moods.find(
      (m) => new Date(m.date).setHours(0, 0, 0, 0) === today
    );

    const avgMood = moods.length > 0
      ? Math.round(moods.reduce((sum, m) => sum + m.value, 0) / moods.length)
      : 0;

    return {
      moodStreak: 0,
      todayMood: todayMood?.mood ?? null,
      avgMood,
    };
  },
});
