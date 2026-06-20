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
      .query("studySessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    duration: v.number(),
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
    return await ctx.db.insert("studySessions", {
      userId: user._id,
      subject: args.subject,
      duration: args.duration,
      notes: args.notes,
      date: args.date,
      createdAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("studySessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.id);
    if (!session) throw new Error("Session not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || session.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return { totalHours: 0, sessionsCount: 0, subjectsBreakdown: [] };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user)
      return { totalHours: 0, sessionsCount: 0, subjectsBreakdown: [] };

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const subjectMap = new Map<string, number>();
    sessions.forEach((s) => {
      const current = subjectMap.get(s.subject) || 0;
      subjectMap.set(s.subject, current + s.duration);
    });

    const subjectsBreakdown = Array.from(subjectMap.entries())
      .map(([subject, minutes]) => ({
        subject,
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      totalHours,
      sessionsCount: sessions.length,
      subjectsBreakdown,
    };
  },
});
