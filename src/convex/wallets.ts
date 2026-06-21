import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("cash"), v.literal("bank"), v.literal("credit"), v.literal("savings"), v.literal("digital")),
    currency: v.string(),
    balance: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const existingWallets = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const isDefault = existingWallets.length === 0 || args.isDefault;

    if (isDefault) {
      for (const wallet of existingWallets) {
        await ctx.db.patch(wallet._id, { isDefault: false });
      }
    }

    const now = Date.now();
    return await ctx.db.insert("wallets", {
      userId: user._id,
      name: args.name,
      type: args.type,
      currency: args.currency,
      balance: args.balance,
      icon: args.icon,
      color: args.color,
      isDefault,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("wallets"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("cash"), v.literal("bank"), v.literal("credit"), v.literal("savings"), v.literal("digital"))),
    balance: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const wallet = await ctx.db.get(args.id);
    if (!wallet) throw new Error("Wallet not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || wallet.userId !== user._id) throw new Error("Unauthorized");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.balance !== undefined) updates.balance = args.balance;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.color !== undefined) updates.color = args.color;
    if (args.isDefault !== undefined) {
      updates.isDefault = args.isDefault;
      if (args.isDefault) {
        const allWallets = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();
        for (const w of allWallets) {
          if (w._id !== args.id) {
            await ctx.db.patch(w._id, { isDefault: false });
          }
        }
      }
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("wallets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const wallet = await ctx.db.get(args.id);
    if (!wallet) throw new Error("Wallet not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || wallet.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
