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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    duration: v.number(),
    calories: v.optional(v.number()),
    distance: v.optional(v.number()),
    notes: v.optional(v.string()),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    return await ctx.db.insert("exerciseLogs", {
      userId: user._id,
      type: args.type,
      duration: args.duration,
      calories: args.calories,
      distance: args.distance,
      notes: args.notes,
      date: args.date,
      createdAt: now,
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalMinutes: 0, totalCalories: 0, thisWeek: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { totalMinutes: 0, totalCalories: 0, thisWeek: 0 };

    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);
    const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0);
    const thisWeek = logs.filter((l) => l.createdAt >= weekAgo).length;

    return {
      totalMinutes,
      totalCalories,
      thisWeek,
    };
  },
});
