import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
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

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return {
      ...profile,
      isPremium: user.isPremium ?? false,
      premiumExpiresAt: user.premiumExpiresAt,
    };
  },
});

export const upsert = mutation({
  args: {
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    avatarConfig: v.optional(
      v.object({
        skin: v.string(),
        hair: v.string(),
        outfit: v.string(),
        accessories: v.array(v.string()),
        background: v.string(),
      }),
    ),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    ),
    currency: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("bn"))),
    theme: v.optional(
      v.union(
        v.literal("light"),
        v.literal("dark"),
        v.literal("oled"),
        v.literal("system"),
      ),
    ),
    notificationsEnabled: v.optional(v.boolean()),
    weeklyEmailReport: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    onboarded: v.optional(v.boolean()),
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

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existing) {
      const updates: Record<string, unknown> = { updatedAt: now };
      if (args.displayName !== undefined)
        updates.displayName = args.displayName;
      if (args.email !== undefined) updates.email = args.email;
      if (args.avatar !== undefined) updates.avatar = args.avatar;
      if (args.avatarConfig !== undefined)
        updates.avatarConfig = args.avatarConfig;
      if (args.phone !== undefined) updates.phone = args.phone;
      if (args.dateOfBirth !== undefined)
        updates.dateOfBirth = args.dateOfBirth;
      if (args.gender !== undefined) updates.gender = args.gender;
      if (args.currency !== undefined) updates.currency = args.currency;
      if (args.language !== undefined) updates.language = args.language;
      if (args.theme !== undefined) updates.theme = args.theme;
      if (args.notificationsEnabled !== undefined)
        updates.notificationsEnabled = args.notificationsEnabled;
      if (args.weeklyEmailReport !== undefined)
        updates.weeklyEmailReport = args.weeklyEmailReport;
      if (args.timezone !== undefined) updates.timezone = args.timezone;
      if (args.onboarded !== undefined) updates.onboarded = args.onboarded;

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId: user._id,
      displayName: args.displayName,
      email: args.email,
      avatar: args.avatar,
      avatarConfig: args.avatarConfig,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      currency: args.currency ?? "BDT",
      language: args.language ?? "en",
      theme: args.theme ?? "light",
      notificationsEnabled: args.notificationsEnabled ?? true,
      weeklyEmailReport: args.weeklyEmailReport ?? false,
      timezone: args.timezone ?? "Asia/Dhaka",
      onboarded: args.onboarded ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});
