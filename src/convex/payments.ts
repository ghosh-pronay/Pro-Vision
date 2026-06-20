import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    method: v.string(),
    category: v.string(),
    reference: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, { status: args.status });
    return args.paymentId;
  },
});

export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const completed = payments.filter((p) => p.status === "completed");

    const totalSpent = completed.reduce((sum, p) => sum + p.amount, 0);

    const byMethod: Record<string, number> = {};
    completed.forEach((p) => {
      byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
    });

    const byMonth: Record<string, number> = {};
    completed.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + p.amount;
    });

    return { totalSpent, byMethod, byMonth, totalPayments: completed.length };
  },
});

export const processPayment = action({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.runQuery(ctx, "payments:get", {
      paymentId: args.paymentId,
    });
    if (!payment) throw new Error("Payment not found");

    const success = Math.random() > 0.05;

    await ctx.runMutation(ctx, "payments:updateStatus", {
      paymentId: args.paymentId,
      status: success ? "completed" : "failed",
    });

    return { success, paymentId: args.paymentId };
  },
});

export const refundPayment = action({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.runQuery(ctx, "payments:get", {
      paymentId: args.paymentId,
    });
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "completed")
      throw new Error("Can only refund completed payments");

    await ctx.runMutation(ctx, "payments:updateStatus", {
      paymentId: args.paymentId,
      status: "refunded",
    });

    return { success: true, paymentId: args.paymentId };
  },
});
