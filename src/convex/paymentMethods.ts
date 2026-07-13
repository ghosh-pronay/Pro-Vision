import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex shim ctx.db requires any casts
type AnyDb = any

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await (ctx.db as AnyDb)
      .query("paymentMethods")
      .withIndex("by_user", (q: AnyDb) => q.eq("userId", args.userId))
      .collect()
  },
})

export const add = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    last4: v.optional(v.string()),
    brand: v.optional(v.string()),
    isDefault: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const db = ctx.db as AnyDb
    if (args.isDefault) {
      const existing = await db
        .query("paymentMethods")
        .withIndex("by_user", (q: AnyDb) => q.eq("userId", args.userId))
        .collect()
      for (const method of existing) {
        if (method.isDefault) {
          await db.patch(method._id, { isDefault: false })
        }
      }
    }

    return await db.insert("paymentMethods", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { methodId: v.string() },
  handler: async (ctx, args) => {
    await (ctx.db as AnyDb).delete(args.methodId)
    return args.methodId
  },
})

export const setDefault = mutation({
  args: { methodId: v.string() },
  handler: async (ctx, args) => {
    const db = ctx.db as AnyDb
    const method = await db.get(args.methodId)
    if (!method) throw new Error("Payment method not found")

    const existing = await db
      .query("paymentMethods")
      .withIndex("by_user", (q: AnyDb) => q.eq("userId", method.userId))
      .collect()

    for (const m of existing) {
      if (m.isDefault) {
        await db.patch(m._id, { isDefault: false })
      }
    }

    await db.patch(args.methodId, { isDefault: true })
    return args.methodId
  },
})
