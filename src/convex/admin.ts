import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const admin = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!admin || admin.role !== "admin") throw new Error("Unauthorized");
  return admin;
}

export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    return admins.length > 0;
  },
});

export const setupFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    if (existingAdmins.length > 0) {
      throw new Error("Admin already exists.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const tasks = await ctx.db.query("tasks").collect();
    const habits = await ctx.db.query("habits").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const goals = await ctx.db.query("goals").collect();
    const focusSessions = await ctx.db.query("focusSessions").collect();

    const today = new Date().setHours(0, 0, 0, 0);
    const activeToday = users.filter(
      (u) => u.updatedAt && u.updatedAt >= today,
    ).length;
    const premiumUsers = users.filter((u) => u.isPremium).length;

    return {
      totalUsers: users.length,
      activeToday,
      premiumUsers,
      totalTasks: tasks.length,
      totalHabits: habits.length,
      totalTransactions: transactions.length,
      totalGoals: goals.length,
      totalFocusSessions: focusSessions.length,
    };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    return users.map((u) => {
      const profile = profiles.find((p) => p.userId === u._id);
      return {
        ...u,
        displayName: profile?.displayName,
        phone: profile?.phone,
        onboarded: profile?.onboarded,
      };
    });
  },
});

export const getUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return { user, profile, tasks, habits, transactions };
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const updates: Partial<{
      name: string;
      email: string;
      role: "user" | "admin";
      updatedAt: number;
    }> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.role !== undefined) updates.role = args.role;
    await ctx.db.patch(args.userId, updates);
  },
});

export const grantPremium = mutation({
  args: {
    userId: v.id("users"),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, {
      isPremium: true,
      premiumExpiresAt: args.expiresAt,
      updatedAt: Date.now(),
    });
  },
});

export const revokePremium = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, {
      isPremium: false,
      premiumExpiresAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.userId);
  },
});

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const configs = await ctx.db.query("siteConfig").collect();
    const result: Record<string, unknown> = {};
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return result;
  },
});

export const setConfig = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: admin._id,
      });
    } else {
      await ctx.db.insert("siteConfig", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: admin._id,
      });
    }
  },
});

export const bulkSetConfig = mutation({
  args: {
    configs: v.array(
      v.object({
        key: v.string(),
        value: v.any(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    for (const { key, value } of args.configs) {
      const existing = await ctx.db
        .query("siteConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          value,
          updatedAt: Date.now(),
          updatedBy: admin._id,
        });
      } else {
        await ctx.db.insert("siteConfig", {
          key,
          value,
          updatedAt: Date.now(),
          updatedBy: admin._id,
        });
      }
    }
  },
});

export const getChallenges = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("challenges").collect();
  },
});

export const createChallenge = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    goal: v.number(),
    unit: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.insert("challenges", {
      ...args,
      createdBy: admin._id,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { challengeId, ...updates } = args;
    await ctx.db.patch(challengeId, updates);
  },
});

export const deleteChallenge = mutation({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.challengeId);
  },
});

export const getFinanceStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      premiumUsers,
      freeUsers: users.length - premiumUsers,
      totalIncome,
      totalExpense,
      totalTransactions: transactions.length,
    };
  },
});
