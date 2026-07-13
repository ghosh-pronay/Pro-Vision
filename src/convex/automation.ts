import { v } from "convex/values"
import { query, mutation, internalAction } from "./_generated/server"
import { api } from "./_generated/api"
import type { Doc } from "./_generated/dataModel"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex shim internal API requires any cast
type AnyApi = typeof api & Record<string, any>

// Habits don't store a "streak" field directly — it's derived from
// completedDates (counts consecutive days up to today/yesterday).
function currentStreak(completedDates: number[]): number {
  const days = new Set(completedDates.map((d) => new Date(d).toDateString()))
  let streak = 0
  const cursor = new Date()
  // Allow today to be incomplete without breaking the streak.
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: "time" | "event" | "pattern"
  action: "notify" | "create" | "update" | "suggest"
  enabled: boolean
}

export const listRules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return []

    return await ctx.db
      .query("automationRules")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const createRule = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    trigger: v.union(
      v.literal("time"),
      v.literal("event"),
      v.literal("pattern"),
    ),
    triggerConfig: v.any(),
    action: v.union(
      v.literal("notify"),
      v.literal("create"),
      v.literal("update"),
      v.literal("suggest"),
    ),
    actionConfig: v.any(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new Error("User not found")

    return await ctx.db.insert("automationRules", {
      userId: user._id,
      name: args.name,
      type: args.trigger,
      config: {
        triggerType: args.trigger,
        conditions: args.triggerConfig,
        actions: args.actionConfig,
      },
      isActive: args.enabled,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const updateRule = mutation({
  args: {
    id: v.id("automationRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    triggerConfig: v.optional(v.any()),
    actionConfig: v.optional(v.any()),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new Error("User not found")

    const rule = await ctx.db.get(args.id)
    if (!rule) throw new Error("Rule not found")
    if (rule.userId !== user._id) throw new Error("Unauthorized")

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.triggerConfig !== undefined)
      updates.triggerConfig = args.triggerConfig
    if (args.actionConfig !== undefined)
      updates.actionConfig = args.actionConfig
    if (args.enabled !== undefined) updates.enabled = args.enabled

    await ctx.db.patch(args.id, updates)
    return args.id
  },
})

export const deleteRule = mutation({
  args: { id: v.id("automationRules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) throw new Error("User not found")

    const rule = await ctx.db.get(args.id)
    if (!rule) throw new Error("Rule not found")
    if (rule.userId !== user._id) throw new Error("Unauthorized")

    await ctx.db.delete(args.id)
    return args.id
  },
})

export const generateSuggestions = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000

    const transactions = await ctx.runQuery(
      (api as AnyApi).internal.transactions.listByDateRange,
      {
        userId: args.userId,
        startDate: weekAgo,
        endDate: now,
      },
    )

    const habits = await ctx.runQuery(
      (api as AnyApi).internal.habits.listByUser,
      {
        userId: args.userId,
      },
    )

    const tasks = await ctx.runQuery(
      (api as AnyApi).internal.tasks.listByUser,
      {
        userId: args.userId,
      },
    )

    const suggestions = []

    const dailyExpenses: Record<string, number> = {}
    transactions
      .filter((t: Doc<"transactions">) => t.type === "expense")
      .forEach((t: Doc<"transactions">) => {
        const day = new Date(t.date).toDateString()
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount
      })

    const avgDailyExpense =
      Object.values(dailyExpenses).reduce((sum, val) => sum + val, 0) /
      Math.max(Object.keys(dailyExpenses).length, 1)

    if (avgDailyExpense > 1000) {
      suggestions.push({
        type: "finance",
        title: "High Daily Spending",
        description: `Your average daily spending is ৳${Math.round(avgDailyExpense)}. Consider setting a daily budget.`,
        priority: "medium",
      })
    }

    const incompleteTasks = tasks.filter((t: Doc<"tasks">) => !t.completed)
    if (incompleteTasks.length > 10) {
      suggestions.push({
        type: "productivity",
        title: "Task Overload",
        description: `You have ${incompleteTasks.length} incomplete tasks. Consider prioritizing or delegating.`,
        priority: "high",
      })
    }

    const lowStreakHabits = habits.filter((h: Doc<"habits">) => {
      const streak = currentStreak(h.completedDates)
      return streak < 3 && streak > 0
    })
    if (lowStreakHabits.length > 0) {
      suggestions.push({
        type: "habits",
        title: "Habits Need Attention",
        description: `${lowStreakHabits.length} habits have low streaks. Focus on consistency.`,
        priority: "medium",
      })
    }

    const lateTasks = tasks.filter(
      (t: Doc<"tasks">) => !t.completed && t.dueDate && t.dueDate < now,
    )
    if (lateTasks.length > 0) {
      suggestions.push({
        type: "productivity",
        title: "Overdue Tasks",
        description: `You have ${lateTasks.length} overdue tasks. Consider updating their due dates.`,
        priority: "high",
      })
    }

    return suggestions
  },
})

export const getSmartSuggestions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return []

    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(q.gte(q.field("date"), weekAgo), q.lte(q.field("date"), now)),
      )
      .collect()

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const suggestions = []

    const dailyExpenses: Record<string, number> = {}
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = new Date(t.date).toDateString()
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount
      })

    const avgDailyExpense =
      Object.values(dailyExpenses).reduce((sum, val) => sum + val, 0) /
      Math.max(Object.keys(dailyExpenses).length, 1)

    if (avgDailyExpense > 1000) {
      suggestions.push({
        type: "finance",
        title: "High Daily Spending",
        description: `Your average daily spending is ৳${Math.round(avgDailyExpense)}. Consider setting a daily budget.`,
        priority: "medium",
        icon: "💰",
      })
    }

    const incompleteTasks = tasks.filter((t) => !t.completed)
    if (incompleteTasks.length > 10) {
      suggestions.push({
        type: "productivity",
        title: "Task Overload",
        description: `You have ${incompleteTasks.length} incomplete tasks. Consider prioritizing or delegating.`,
        priority: "high",
        icon: "📋",
      })
    }

    const lowStreakHabits = habits.filter((h) => {
      const streak = currentStreak(h.completedDates)
      return streak < 3 && streak > 0
    })
    if (lowStreakHabits.length > 0) {
      suggestions.push({
        type: "habits",
        title: "Habits Need Attention",
        description: `${lowStreakHabits.length} habits have low streaks. Focus on consistency.`,
        priority: "medium",
        icon: "🔥",
      })
    }

    const lateTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now,
    )
    if (lateTasks.length > 0) {
      suggestions.push({
        type: "productivity",
        title: "Overdue Tasks",
        description: `You have ${lateTasks.length} overdue tasks. Consider updating their due dates.`,
        priority: "high",
        icon: "⏰",
      })
    }

    const habitsWithoutStreak = habits.filter(
      (h) => currentStreak(h.completedDates) === 0,
    )
    if (habitsWithoutStreak.length > 0) {
      suggestions.push({
        type: "habits",
        title: "Start Your Streak",
        description: `You have ${habitsWithoutStreak.length} habits waiting to start. Begin today!`,
        priority: "low",
        icon: "✨",
      })
    }

    return suggestions
  },
})
