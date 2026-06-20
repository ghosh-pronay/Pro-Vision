import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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
      .query("loans")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("given"), v.literal("taken")),
    amount: v.number(),
    interestRate: v.optional(v.number()),
    personName: v.string(),
    startDate: v.number(),
    dueDate: v.optional(v.number()),
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

    return await ctx.db.insert("loans", {
      userId: user._id,
      type: args.type,
      amount: args.amount,
      paidAmount: 0,
      interestRate: args.interestRate,
      personName: args.personName,
      startDate: args.startDate,
      dueDate: args.dueDate,
      notes: args.notes,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("loans"),
    interestRate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
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

    const loan = await ctx.db.get(args.id);
    if (!loan) throw new Error("Loan not found");
    if (loan.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.interestRate !== undefined) updates.interestRate = args.interestRate;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const addPayment = mutation({
  args: {
    id: v.id("loans"),
    amount: v.number(),
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

    const loan = await ctx.db.get(args.id);
    if (!loan) throw new Error("Loan not found");
    if (loan.userId !== user._id) throw new Error("Unauthorized");

    const newPaidAmount = loan.paidAmount + args.amount;
    const isCompleted = newPaidAmount >= loan.amount;

    await ctx.db.patch(args.id, {
      paidAmount: newPaidAmount,
      status: isCompleted ? "completed" : "active",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("loans") },
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

    const loan = await ctx.db.get(args.id);
    if (!loan) throw new Error("Loan not found");
    if (loan.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const activeLoans = loans.filter((l) => l.status === "active");

    const totalGiven = loans
      .filter((l) => l.type === "given")
      .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0);

    const totalTaken = loans
      .filter((l) => l.type === "taken")
      .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0);

    const overdueLoans = activeLoans.filter(
      (l) => l.dueDate && l.dueDate < Date.now(),
    );

    return {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalGiven,
      totalTaken,
      netPosition: totalGiven - totalTaken,
      overdueLoans: overdueLoans.length,
    };
  },
});
