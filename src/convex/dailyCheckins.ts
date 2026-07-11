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
      .query("dailyCheckins")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()
  },
})

export const create = mutation({
  args: {
    date: v.number(),
    mood: v.union(
      v.literal("great"),
      v.literal("good"),
      v.literal("okay"),
      v.literal("bad"),
      v.literal("terrible"),
    ),
    energy: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    topGoal: v.string(),
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

    const now = Date.now()
    const energyMap: Record<string, number> = { high: 3, medium: 2, low: 1 }
    return await ctx.db.insert("dailyCheckins", {
      userId: user._id,
      date: args.date,
      mood: args.mood,
      energy: energyMap[args.energy] || 2,
      topGoal: args.topGoal,
      notes: args.notes,
      createdAt: now,
    })
  },
})

export const today = query({
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

    const todayDate = new Date().setHours(0, 0, 0, 0)
    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    return (
      checkins.find(
        (c) => new Date(c.date).setHours(0, 0, 0, 0) === todayDate,
      ) || null
    )
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { avgMood: 0, avgEnergy: 0, streak: 0 }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return { avgMood: 0, avgEnergy: 0, streak: 0 }

    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()

    if (checkins.length === 0) return { avgMood: 0, avgEnergy: 0, streak: 0 }

    const moodMap: Record<string, number> = {
      great: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    }
    const energyMap: Record<string, number> = { high: 3, medium: 2, low: 1 }

    const totalMood = checkins.reduce(
      (sum, c) => sum + (moodMap[c.mood] || 3),
      0,
    )
    const totalEnergy = checkins.reduce(
      (sum, c) => sum + (energyMap[c.energy] || 2),
      0,
    )

    let streak = 0
    const today = new Date().setHours(0, 0, 0, 0)
    let checkDate = today

    for (const checkin of checkins) {
      const checkinDate = new Date(checkin.date).setHours(0, 0, 0, 0)
      if (checkinDate === checkDate) {
        streak++
        checkDate = new Date(checkDate - 24 * 60 * 60 * 1000).setHours(
          0,
          0,
          0,
          0,
        )
      } else if (checkinDate < checkDate) {
        break
      }
    }

    return {
      avgMood: Math.round((totalMood / checkins.length) * 10) / 10,
      avgEnergy: Math.round((totalEnergy / checkins.length) * 10) / 10,
      streak,
    }
  },
})
