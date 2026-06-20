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
      .query("gratitudeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    mood: v.optional(v.string()),
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
    return await ctx.db.insert("gratitudeEntries", {
      userId: user._id,
      content: args.content,
      mood: args.mood,
      date: args.date,
      createdAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("gratitudeEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || entry.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, thisWeek: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return { total: 0, thisWeek: 0 };

    const entries = await ctx.db
      .query("gratitudeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = entries.filter((e) => e.createdAt >= weekAgo).length;

    return {
      total: entries.length,
      thisWeek,
    };
  },
});
