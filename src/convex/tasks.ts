import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Used internally by weeklyReport.ts. Tasks have no "completedAt" field,
// so this approximates "this week's tasks" via createdAt.
export const listByDateRange = internalQuery({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return all.filter(
      (t) => t.createdAt >= args.startDate && t.createdAt <= args.endDate,
    );
  },
});

// Used internally by automation.ts to generate suggestions.
export const listByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
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
    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      completed: false,
      priority: args.priority ?? "medium",
      dueDate: args.dueDate,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || task.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      completed: !task.completed,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || task.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, completed: 0, pending: 0, overdue: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { total: 0, completed: 0, pending: 0, overdue: 0 };

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now,
    ).length;

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
    };
  },
});
