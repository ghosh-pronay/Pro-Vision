import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Used internally by weeklyReport.ts. Habits are persistent records (not
// dated events), so this returns all of the user's habits; the caller
// counts completedDates that fall inside [startDate, endDate].
export const listByDateRange = internalQuery({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Used internally by automation.ts to generate suggestions.
export const listByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
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
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    reminderTime: v.optional(v.string()),
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
    return await ctx.db.insert("habits", {
      userId: user._id,
      name: args.name,
      description: args.description,
      frequency: args.frequency,
      completedDates: [],
      color: args.color,
      icon: args.icon,
      category: args.category,
      archived: false,
      reminderTime: args.reminderTime,
      checkInNotes: [],
      streakFreezes: 0,
      maxStreakFreezes: 3,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    frequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"))),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    reminderTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || habit.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.category !== undefined) updates.category = args.category;
    if (args.reminderTime !== undefined)
      updates.reminderTime = args.reminderTime;

    await ctx.db.patch(args.id, updates);
  },
});

export const archive = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || habit.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      archived: !habit.archived,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || habit.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const checkIn = mutation({
  args: {
    id: v.id("habits"),
    date: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || habit.userId !== user._id) throw new Error("Unauthorized");

    const dateOnly = new Date(args.date).setHours(0, 0, 0, 0);
    const alreadyChecked = habit.completedDates.some(
      (d) => new Date(d).setHours(0, 0, 0, 0) === dateOnly,
    );

    if (alreadyChecked) {
      await ctx.db.patch(args.id, {
        completedDates: habit.completedDates.filter(
          (d) => new Date(d).setHours(0, 0, 0, 0) !== dateOnly,
        ),
        checkInNotes: (habit.checkInNotes ?? []).filter(
          (n) => new Date(n.date).setHours(0, 0, 0, 0) !== dateOnly,
        ),
        updatedAt: Date.now(),
      });
    } else {
      const newNotes = [...(habit.checkInNotes ?? [])];
      if (args.note) {
        newNotes.push({ date: args.date, note: args.note });
      }
      await ctx.db.patch(args.id, {
        completedDates: [...habit.completedDates, args.date],
        checkInNotes: newNotes,
        updatedAt: Date.now(),
      });
    }
  },
});

export const useStreakFreeze = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || habit.userId !== user._id) throw new Error("Unauthorized");

    const freezes = habit.streakFreezes ?? 0;
    const maxFreezes = habit.maxStreakFreezes ?? 3;
    if (freezes >= maxFreezes) throw new Error("No streak freezes remaining");

    await ctx.db.patch(args.id, {
      streakFreezes: freezes + 1,
      updatedAt: Date.now(),
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return { total: 0, totalStreak: 0, avgRate: 0, todayCompleted: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user)
      return { total: 0, totalStreak: 0, avgRate: 0, todayCompleted: 0 };

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const activeHabits = habits.filter((h) => !h.archived);
    const today = new Date().setHours(0, 0, 0, 0);
    const todayCompleted = activeHabits.filter((h) =>
      h.completedDates.some((d) => new Date(d).setHours(0, 0, 0, 0) === today),
    ).length;

    return {
      total: activeHabits.length,
      totalStreak: 0,
      avgRate:
        activeHabits.length > 0
          ? Math.round((todayCompleted / activeHabits.length) * 100)
          : 0,
      todayCompleted,
    };
  },
});
