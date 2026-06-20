import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const columns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const columnsWithTasks = await Promise.all(
      columns.map(async (col) => {
        const tasks = await ctx.db
          .query("kanbanTasks")
          .withIndex("by_columnId", (q) => q.eq("columnId", col._id))
          .collect();
        return {
          ...col,
          tasks: tasks.sort((a, b) => a.order - b.order),
        };
      }),
    );

    return columnsWithTasks.sort((a, b) => a.order - b.order);
  },
});

export const createColumn = mutation({
  args: { title: v.string(), order: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const existingColumns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return await ctx.db.insert("kanbanColumns", {
      userId: user._id,
      title: args.title,
      order: args.order ?? existingColumns.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateColumn = mutation({
  args: { columnId: v.id("kanbanColumns"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const column = await ctx.db.get(args.columnId);
    if (!column) throw new Error("Column not found");
    if (column.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.columnId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const deleteColumn = mutation({
  args: { columnId: v.id("kanbanColumns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const column = await ctx.db.get(args.columnId);
    if (!column) throw new Error("Column not found");
    if (column.userId !== user._id) throw new Error("Unauthorized");

    const tasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_columnId", (q) => q.eq("columnId", args.columnId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.columnId);
  },
});

export const createTask = mutation({
  args: {
    columnId: v.id("kanbanColumns"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const columnTasks = await ctx.db
      .query("kanbanTasks")
      .withIndex("by_columnId", (q) => q.eq("columnId", args.columnId))
      .collect();

    return await ctx.db.insert("kanbanTasks", {
      userId: user._id,
      columnId: args.columnId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      tags: args.tags,
      order: columnTasks.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.taskId, updates);
  },
});

export const moveTask = mutation({
  args: {
    taskId: v.id("kanbanTasks"),
    targetColumnId: v.id("kanbanColumns"),
    targetOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.userId !== user._id) throw new Error("Unauthorized");

    const targetColumn = await ctx.db.get(args.targetColumnId);
    if (!targetColumn) throw new Error("Target column not found");
    if (targetColumn.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.taskId, {
      columnId: args.targetColumnId,
      order: args.targetOrder,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("kanbanTasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.taskId);
  },
});

export const initializeDefaultColumns = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const existingColumns = await ctx.db
      .query("kanbanColumns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existingColumns.length > 0) return;

    const defaultColumns = ["To Do", "In Progress", "Review", "Done"];
    for (let i = 0; i < defaultColumns.length; i++) {
      await ctx.db.insert("kanbanColumns", {
        userId: user._id,
        title: defaultColumns[i],
        order: i,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
