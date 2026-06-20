import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

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
    if (args.isDefault) {
      const existing = await ctx.db
        .query("paymentMethods")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      for (const method of existing) {
        if (method.isDefault) {
          await ctx.db.patch(method._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("paymentMethods", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { methodId: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.methodId);
    return args.methodId;
  },
});

export const setDefault = mutation({
  args: { methodId: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    const method = await ctx.db.get(args.methodId);
    if (!method) throw new Error("Payment method not found");

    const existing = await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", method.userId))
      .collect();

    for (const m of existing) {
      if (m.isDefault) {
        await ctx.db.patch(m._id, { isDefault: false });
      }
    }

    await ctx.db.patch(args.methodId, { isDefault: true });
    return args.methodId;
  },
});
