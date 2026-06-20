import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listChallenges = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("challenges")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublic"), true),
          q.gte(q.field("endDate"), now),
        ),
      )
      .collect();
  },
});

export const listUserChallenges = query({
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

    const participations = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const challenges = [];
    for (const p of participations) {
      const challenge = await ctx.db.get(p.challengeId);
      if (challenge) {
        challenges.push({ ...challenge, progress: p.progress, joinedAt: p.joinedAt });
      }
    }

    return challenges;
  },
});

export const createChallenge = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("habit"),
      v.literal("task"),
      v.literal("finance"),
      v.literal("focus"),
      v.literal("custom"),
    ),
    goal: v.number(),
    unit: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isPublic: v.boolean(),
    maxParticipants: v.optional(v.number()),
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

    const challengeId = await ctx.db.insert("challenges", {
      creatorId: user._id,
      title: args.title,
      description: args.description,
      type: args.type,
      goal: args.goal,
      unit: args.unit,
      startDate: args.startDate,
      endDate: args.endDate,
      isPublic: args.isPublic,
      maxParticipants: args.maxParticipants,
      participantCount: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("challengeParticipants", {
      userId: user._id,
      challengeId,
      progress: 0,
      joinedAt: Date.now(),
    });

    return challengeId;
  },
});

export const joinChallenge = mutation({
  args: { challengeId: v.id("challenges") },
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

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    if (challenge.endDate < Date.now()) {
      throw new Error("Challenge has ended");
    }

    if (
      challenge.maxParticipants &&
      challenge.participantCount >= challenge.maxParticipants
    ) {
      throw new Error("Challenge is full");
    }

    const existing = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("challengeId"), args.challengeId))
      .unique();

    if (existing) throw new Error("Already joined this challenge");

    await ctx.db.insert("challengeParticipants", {
      userId: user._id,
      challengeId: args.challengeId,
      progress: 0,
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.challengeId, {
      participantCount: challenge.participantCount + 1,
    });

    return args.challengeId;
  },
});

export const leaveChallenge = mutation({
  args: { challengeId: v.id("challenges") },
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

    const participation = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("challengeId"), args.challengeId))
      .unique();

    if (!participation) throw new Error("Not part of this challenge");

    await ctx.db.delete(participation._id);

    const challenge = await ctx.db.get(args.challengeId);
    if (challenge) {
      await ctx.db.patch(args.challengeId, {
        participantCount: Math.max(0, challenge.participantCount - 1),
      });
    }

    return args.challengeId;
  },
});

export const updateProgress = mutation({
  args: {
    challengeId: v.id("challenges"),
    progress: v.number(),
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

    const participation = await ctx.db
      .query("challengeParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("challengeId"), args.challengeId))
      .unique();

    if (!participation) throw new Error("Not part of this challenge");

    await ctx.db.patch(participation._id, {
      progress: args.progress,
    });

    return participation._id;
  },
});

export const getLeaderboard = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("challengeParticipants")
      .filter((q) => q.eq(q.field("challengeId"), args.challengeId))
      .collect();

    const leaderboard = [];
    for (const p of participants) {
      const user = await ctx.db.get(p.userId);
      if (user) {
        leaderboard.push({
          userId: user._id,
          name: user.name,
          image: user.image,
          progress: p.progress,
          joinedAt: p.joinedAt,
        });
      }
    }

    return leaderboard.sort((a, b) => b.progress - a.progress);
  },
});
