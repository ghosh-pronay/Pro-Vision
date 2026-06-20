import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Used internally by weeklyReport.ts to build the per-user weekly summary.
export const listByDateRange = internalQuery({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return all.filter((t) => t.date >= args.startDate && t.date <= args.endDate);
  },
});

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
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    walletId: v.id("wallets"),
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("receivable"),
      v.literal("payable"),
      v.literal("loanTaken"),
      v.literal("loanGiven"),
    ),
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    toWalletId: v.optional(v.id("wallets")),
    receiptUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
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

    const wallet = await ctx.db.get(args.walletId);
    if (!wallet || wallet.userId !== user._id) throw new Error("Unauthorized");

    if (args.toWalletId) {
      const toWallet = await ctx.db.get(args.toWalletId);
      if (!toWallet || toWallet.userId !== user._id)
        throw new Error("Unauthorized");
    }

    const now = Date.now();

    const transactionId = await ctx.db.insert("transactions", {
      userId: user._id,
      walletId: args.walletId,
      type: args.type,
      amount: args.amount,
      category: args.category,
      description: args.description,
      date: args.date,
      toWalletId: args.toWalletId,
      receiptUrl: args.receiptUrl,
      tags: args.tags,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    const amountChange =
      args.type === "expense" || args.type === "loanGiven"
        ? -args.amount
        : args.amount;

    await ctx.db.patch(args.walletId, {
      balance: wallet.balance + amountChange,
      updatedAt: now,
    });

    return transactionId;
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.id);
    if (!transaction) throw new Error("Transaction not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || transaction.userId !== user._id) throw new Error("Unauthorized");

    const wallet = await ctx.db.get(transaction.walletId);
    if (wallet) {
      const amountRevert = transaction.type === "expense" || transaction.type === "loanGiven"
        ? transaction.amount
        : -transaction.amount;

      await ctx.db.patch(transaction.walletId, {
        balance: wallet.balance + amountRevert,
        updatedAt: Date.now(),
      });
    }

    if (transaction.toWalletId) {
      const pairedTx = await ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();

      const paired = pairedTx.find(
        (t) =>
          t.walletId === transaction.toWalletId &&
          t.toWalletId === transaction.walletId &&
          t.amount === transaction.amount &&
          t.date === transaction.date &&
          t._id !== transaction._id,
      );

      if (paired) {
        const pairedWallet = await ctx.db.get(paired.walletId);
        if (pairedWallet) {
          const pairedRevert = paired.type === "expense" || paired.type === "loanGiven"
            ? paired.amount
            : -paired.amount;

          await ctx.db.patch(paired.walletId, {
            balance: pairedWallet.balance + pairedRevert,
            updatedAt: Date.now(),
          });
        }
        await ctx.db.delete(paired._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});
    }

    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: [],
        thisMonthIncome: 0,
        thisMonthExpense: 0,
      };

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user)
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: [],
        thisMonthIncome: 0,
        thisMonthExpense: 0,
      };

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();

    let totalIncome = 0;
    let totalExpense = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    const categoryMap: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += t.amount;
        if (t.date >= thisMonthStart) thisMonthIncome += t.amount;
      } else if (t.type === "expense") {
        totalExpense += t.amount;
        if (t.date >= thisMonthStart) thisMonthExpense += t.amount;
      }
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }

    const categories = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categories,
      thisMonthIncome,
      thisMonthExpense,
    };
  },
});
