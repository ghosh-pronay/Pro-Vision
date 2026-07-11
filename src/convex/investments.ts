import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

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
      .query("investments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("stock"),
      v.literal("mutual_fund"),
      v.literal("fd"),
      v.literal("rd"),
      v.literal("bond"),
      v.literal("crypto"),
      v.literal("real_estate"),
      v.literal("gold"),
      v.literal("other"),
    ),
    amount: v.number(),
    currentValue: v.number(),
    purchaseDate: v.number(),
    maturityDate: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
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

    return await ctx.db.insert("investments", {
      userId: user._id,
      name: args.name,
      type: args.type,
      amount: args.amount,
      currentValue: args.currentValue,
      purchaseDate: args.purchaseDate,
      maturityDate: args.maturityDate,
      interestRate: args.interestRate,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("investments"),
    name: v.optional(v.string()),
    currentValue: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
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

    const investment = await ctx.db.get(args.id)
    if (!investment) throw new Error("Investment not found")
    if (investment.userId !== user._id) throw new Error("Unauthorized")

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.currentValue !== undefined)
      updates.currentValue = args.currentValue
    if (args.interestRate !== undefined)
      updates.interestRate = args.interestRate
    if (args.notes !== undefined) updates.notes = args.notes

    await ctx.db.patch(args.id, updates)
    return args.id
  },
})

export const remove = mutation({
  args: { id: v.id("investments") },
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

    const investment = await ctx.db.get(args.id)
    if (!investment) throw new Error("Investment not found")
    if (investment.userId !== user._id) throw new Error("Unauthorized")

    await ctx.db.delete(args.id)
    return args.id
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return null

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0)
    const totalCurrentValue = investments.reduce(
      (sum, i) => sum + (i.currentValue || 0),
      0,
    )
    const totalReturns = totalCurrentValue - totalInvested
    const returnPercentage =
      totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

    const byType = investments.reduce(
      (acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + (i.currentValue || 0)
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalInvested,
      totalCurrentValue,
      totalReturns,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      investmentCount: investments.length,
      byType,
    }
  },
})
