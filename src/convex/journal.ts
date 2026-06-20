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
      .query("journalEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    weather: v.optional(v.string()),
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
    return await ctx.db.insert("journalEntries", {
      userId: user._id,
      title: args.title,
      content: args.content,
      mood: args.mood,
      tags: args.tags,
      weather: args.weather,
      date: args.date,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("journalEntries"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    weather: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || entry.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.mood !== undefined) updates.mood = args.mood;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.weather !== undefined) updates.weather = args.weather;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || entry.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
