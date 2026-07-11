import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
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
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
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

    const now = Date.now()
    return await ctx.db.insert("savingsGoals", {
      userId: user._id,
      name: args.name,
      targetAmount: args.targetAmount,
      currentAmount: args.currentAmount,
      status: "active",
      icon: args.icon,
      color: args.color,
      deadline: args.deadline,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("savingsGoals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const goal = await ctx.db.get(args.id)
    if (!goal) throw new Error("Goal not found")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user || goal.userId !== user._id) throw new Error("Unauthorized")

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.targetAmount !== undefined)
      updates.targetAmount = args.targetAmount
    if (args.currentAmount !== undefined)
      updates.currentAmount = args.currentAmount
    if (args.icon !== undefined) updates.icon = args.icon
    if (args.color !== undefined) updates.color = args.color
    if (args.deadline !== undefined) updates.deadline = args.deadline

    await ctx.db.patch(args.id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id("savingsGoals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const goal = await ctx.db.get(args.id)
    if (!goal) throw new Error("Goal not found")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user || goal.userId !== user._id) throw new Error("Unauthorized")

    await ctx.db.delete(args.id)
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      return { totalSaved: 0, totalTarget: 0, progressPercentage: 0 }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return { totalSaved: 0, totalTarget: 0, progressPercentage: 0 }

    const goals = await ctx.db
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const progressPercentage =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

    return {
      totalSaved,
      totalTarget,
      progressPercentage,
    }
  },
})
