import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrent = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return subs.find((s) => s.status === "active") || null;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    plan: v.string(),
    paymentMethod: v.optional(v.string()),
    autoRenew: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const durationMs =
      args.plan === "pro"
        ? 30 * 24 * 60 * 60 * 1000
        : 365 * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("subscriptions", {
      ...args,
      status: "active",
      startDate: now,
      endDate: now + durationMs,
    });
  },
});

export const cancel = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, { status: "canceled" });
    return args.subscriptionId;
  },
});

export const renew = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    const durationMs =
      sub.plan === "pro" ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;

    const newStart = sub.endDate || Date.now();

    await ctx.db.patch(args.subscriptionId, {
      status: "active",
      startDate: newStart,
      endDate: newStart + durationMs,
    });
    return args.subscriptionId;
  },
});

export const getPlans = query({
  args: {},
  handler: async () => {
    return [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "BDT",
        interval: "monthly",
        features: ["Basic tracking", "Limited storage", "1 workspace"],
      },
      {
        id: "pro",
        name: "Pro",
        price: 299,
        currency: "BDT",
        interval: "monthly",
        features: [
          "Unlimited tracking",
          "AI insights",
          "Priority support",
          "Custom themes",
          "Export data",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 2499,
        currency: "BDT",
        interval: "yearly",
        features: [
          "Everything in Pro",
          "Team collaboration",
          "API access",
          "Custom integrations",
          "Dedicated support",
          "White label",
        ],
      },
    ];
  },
});
