import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";

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
      .query("recurringTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    walletId: v.id("wallets"),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
    nextDate: v.number(),
    isActive: v.boolean(),
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

    return await ctx.db.insert("recurringTransactions", {
      userId: user._id,
      walletId: args.walletId,
      type: args.type,
      amount: args.amount,
      category: args.category,
      description: args.description,
      frequency: args.frequency,
      nextDate: args.nextDate,
      lastProcessed: undefined,
      isActive: args.isActive,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("recurringTransactions"),
    walletId: v.optional(v.id("wallets")),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly"),
      ),
    ),
    nextDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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

    const recurring = await ctx.db.get(args.id);
    if (!recurring) throw new Error("Recurring transaction not found");
    if (recurring.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = {};
    if (args.walletId !== undefined) updates.walletId = args.walletId;
    if (args.type !== undefined) updates.type = args.type;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.category !== undefined) updates.category = args.category;
    if (args.description !== undefined) updates.description = args.description;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.nextDate !== undefined) updates.nextDate = args.nextDate;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("recurringTransactions") },
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

    const recurring = await ctx.db.get(args.id);
    if (!recurring) throw new Error("Recurring transaction not found");
    if (recurring.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const processDueRecurring = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const dueRecurring = await ctx.db
      .query("recurringTransactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.lte(q.field("nextDate"), now),
        ),
      )
      .collect();

    const results = [];

    for (const recurring of dueRecurring) {
      const wallet = await ctx.db.get(recurring.walletId);
      if (!wallet) continue;

      const transactionId = await ctx.db.insert("transactions", {
        userId: recurring.userId,
        walletId: recurring.walletId,
        type: recurring.type,
        amount: recurring.amount,
        category: recurring.category,
        description: recurring.description,
        date: now,
      });

      const balanceChange =
        recurring.type === "income" ? recurring.amount : -recurring.amount;
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + balanceChange,
      });

      let nextDate = recurring.nextDate;
      if (recurring.frequency === "daily") {
        nextDate = now + 24 * 60 * 60 * 1000;
      } else if (recurring.frequency === "weekly") {
        nextDate = now + 7 * 24 * 60 * 60 * 1000;
      } else if (recurring.frequency === "monthly") {
        const date = new Date(now);
        date.setMonth(date.getMonth() + 1);
        nextDate = date.getTime();
      } else if (recurring.frequency === "yearly") {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() + 1);
        nextDate = date.getTime();
      }

      await ctx.db.patch(recurring._id, {
        lastProcessed: now,
        nextDate,
      });

      results.push({ recurringId: recurring._id, transactionId });
    }

    return results;
  },
});
