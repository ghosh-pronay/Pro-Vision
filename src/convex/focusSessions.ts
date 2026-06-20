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
      .query("focusSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    duration: v.number(),
    type: v.union(v.literal("pomodoro"), v.literal("shortBreak"), v.literal("longBreak"), v.literal("custom")),
    tags: v.optional(v.array(v.string())),
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
    return await ctx.db.insert("focusSessions", {
      userId: user._id,
      duration: args.duration,
      completedAt: now,
      type: args.type,
      tags: args.tags,
      createdAt: now,
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { sessions: 0, totalMinutes: 0, totalHours: 0, todayMinutes: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return { sessions: 0, totalMinutes: 0, totalHours: 0, todayMinutes: 0 };

    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMinutes = sessions
      .filter((s) => s.completedAt >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0);

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      sessions: sessions.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      todayMinutes,
    };
  },
});
