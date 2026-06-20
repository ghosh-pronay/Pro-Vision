import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listGroups = query({
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

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const groups = [];
    for (const membership of memberships) {
      const group = await ctx.db.get(membership.groupId);
      if (group) {
        groups.push({ ...group, role: membership.role });
      }
    }

    return groups;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.optional(v.string()),
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

    const groupId = await ctx.db.insert("expenseGroups", {
      name: args.name,
      description: args.description,
      currency: args.currency || "BDT",
      createdBy: user._id,
      memberCount: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      role: "admin",
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

export const inviteMember = mutation({
  args: {
    groupId: v.id("expenseGroups"),
    email: v.string(),
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

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can invite members");
    }

    const invitee = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (!invitee) throw new Error("User not found with this email");

    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), invitee._id))
      .unique();

    if (existingMember) throw new Error("User is already a member");

    await ctx.db.insert("groupInvitations", {
      groupId: args.groupId,
      inviterId: user._id,
      inviteeId: invitee._id,
      status: "pending",
      createdAt: Date.now(),
    });

    return invitee._id;
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.id("groupInvitations") },
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

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");
    if (invitation.inviteeId !== user._id) throw new Error("Unauthorized");
    if (invitation.status !== "pending") throw new Error("Invitation already processed");

    await ctx.db.patch(args.invitationId, { status: "accepted" });

    await ctx.db.insert("groupMembers", {
      groupId: invitation.groupId,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    const group = await ctx.db.get(invitation.groupId);
    if (group) {
      await ctx.db.patch(invitation.groupId, {
        memberCount: group.memberCount + 1,
      });
    }

    return invitation.groupId;
  },
});

export const addExpense = mutation({
  args: {
    groupId: v.id("expenseGroups"),
    description: v.string(),
    amount: v.number(),
    paidBy: v.id("users"),
    splitAmong: v.array(v.id("users")),
    category: v.optional(v.string()),
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

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (!membership) throw new Error("Not a member of this group");

    const splitAmount = args.amount / args.splitAmong.length;

    const expenseId = await ctx.db.insert("groupExpenses", {
      groupId: args.groupId,
      description: args.description,
      amount: args.amount,
      paidBy: args.paidBy,
      splitAmong: args.splitAmong,
      splitAmount,
      category: args.category,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    for (const memberId of args.splitAmong) {
      if (memberId !== args.paidBy) {
        await ctx.db.insert("groupBalances", {
          groupId: args.groupId,
          expenseId,
          fromUser: memberId,
          toUser: args.paidBy,
          amount: splitAmount,
          settled: false,
          createdAt: Date.now(),
        });
      }
    }

    return expenseId;
  },
});

export const settleBalance = mutation({
  args: {
    balanceId: v.id("groupBalances"),
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

    const balance = await ctx.db.get(args.balanceId);
    if (!balance) throw new Error("Balance not found");

    if (balance.fromUser !== user._id && balance.toUser !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.balanceId, {
      settled: true,
      settledAt: Date.now(),
    });

    return args.balanceId;
  },
});

export const getBalances = query({
  args: { groupId: v.id("expenseGroups") },
  handler: async (ctx, args) => {
    const balances = await ctx.db
      .query("groupBalances")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("settled"), false))
      .collect();

    const balanceMap: Record<string, Record<string, number>> = {};

    for (const balance of balances) {
      if (!balanceMap[balance.fromUser]) balanceMap[balance.fromUser] = {};
      if (!balanceMap[balance.toUser]) balanceMap[balance.toUser] = {};

      balanceMap[balance.fromUser][balance.toUser] =
        (balanceMap[balance.fromUser][balance.toUser] || 0) + balance.amount;
      balanceMap[balance.toUser][balance.fromUser] =
        (balanceMap[balance.toUser][balance.fromUser] || 0) - balance.amount;
    }

    const simplified: Array<{ from: string; to: string; amount: number }> = [];
    const users = Object.keys(balanceMap);

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        const balance = (balanceMap[user1][user2] || 0) - (balanceMap[user2][user1] || 0);

        if (balance > 0) {
          simplified.push({ from: user2, to: user1, amount: balance });
        } else if (balance < 0) {
          simplified.push({ from: user1, to: user2, amount: Math.abs(balance) });
        }
      }
    }

    return simplified;
  },
});

export const getGroupStats = query({
  args: { groupId: v.id("expenseGroups") },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("groupExpenses")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
    });

    const byUser: Record<string, number> = {};
    expenses.forEach((e) => {
      byUser[e.paidBy] = (byUser[e.paidBy] || 0) + e.amount;
    });

    return {
      totalExpenses,
      expenseCount: expenses.length,
      avgExpense,
      byCategory,
      byUser,
    };
  },
});
