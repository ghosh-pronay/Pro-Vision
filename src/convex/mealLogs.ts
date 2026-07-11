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
      .query("mealLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()
  },
})

export const create = mutation({
  args: {
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
    ),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    notes: v.optional(v.string()),
    date: v.number(),
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
    return await ctx.db.insert("mealLogs", {
      userId: user._id,
      mealType: args.mealType,
      name: args.name,
      calories: args.calories,
      protein: args.protein,
      carbs: args.carbs,
      fat: args.fat,
      notes: args.notes,
      date: args.date,
      createdAt: now,
    })
  },
})

export const remove = mutation({
  args: { id: v.id("mealLogs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const meal = await ctx.db.get(args.id)
    if (!meal) throw new Error("Meal not found")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user || meal.userId !== user._id) throw new Error("Unauthorized")

    await ctx.db.delete(args.id)
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user)
      return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }

    const today = new Date().setHours(0, 0, 0, 0)
    const meals = await ctx.db
      .query("mealLogs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const todayMeals = meals.filter(
      (m) => new Date(m.date).setHours(0, 0, 0, 0) === today,
    )

    return {
      totalCalories: todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      totalProtein: todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
      totalCarbs: todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
      totalFat: todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
    }
  },
})
