import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listPartners = query({
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

    const partnerships = await ctx.db
      .query("partnerships")
      .filter((q) =>
        q.or(
          q.eq(q.field("user1Id"), user._id),
          q.eq(q.field("user2Id"), user._id),
        ),
      )
      .collect();

    const partners = [];
    for (const partnership of partnerships) {
      const partnerId =
        partnership.user1Id === user._id
          ? partnership.user2Id
          : partnership.user1Id;
      const partner = await ctx.db.get(partnerId);
      if (partner) {
        partners.push({
          partnershipId: partnership._id,
          partner,
          status: partnership.status,
          sharedHabits: partnership.sharedHabits,
          createdAt: partnership.createdAt,
        });
      }
    }

    return partners;
  },
});

export const sendInvitation = mutation({
  args: { partnerEmail: v.string() },
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

    const partner = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.partnerEmail))
      .unique();

    if (!partner) throw new Error("Partner not found with this email");
    if (partner._id === user._id) throw new Error("Cannot partner with yourself");

    const existing = await ctx.db
      .query("partnerships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("user1Id"), user._id),
            q.eq(q.field("user2Id"), partner._id),
          ),
          q.and(
            q.eq(q.field("user1Id"), partner._id),
            q.eq(q.field("user2Id"), user._id),
          ),
        ),
      )
      .unique();

    if (existing) throw new Error("Partnership already exists");

    return await ctx.db.insert("partnerships", {
      user1Id: user._id,
      user2Id: partner._id,
      status: "pending",
      sharedHabits: [],
      createdAt: Date.now(),
    });
  },
});

export const acceptInvitation = mutation({
  args: { partnershipId: v.id("partnerships") },
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

    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.user2Id !== user._id) throw new Error("Unauthorized");
    if (partnership.status !== "pending") throw new Error("Invitation already processed");

    await ctx.db.patch(args.partnershipId, {
      status: "active",
    });

    return args.partnershipId;
  },
});

export const declineInvitation = mutation({
  args: { partnershipId: v.id("partnerships") },
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

    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.user2Id !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.partnershipId);

    return args.partnershipId;
  },
});

export const removePartner = mutation({
  args: { partnershipId: v.id("partnerships") },
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

    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.user1Id !== user._id && partnership.user2Id !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.partnershipId);

    return args.partnershipId;
  },
});

export const toggleSharedHabit = mutation({
  args: {
    partnershipId: v.id("partnerships"),
    habitId: v.string(),
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

    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.user1Id !== user._id && partnership.user2Id !== user._id) {
      throw new Error("Unauthorized");
    }

    const sharedHabits = partnership.sharedHabits || [];
    const index = sharedHabits.indexOf(args.habitId);

    if (index === -1) {
      sharedHabits.push(args.habitId);
    } else {
      sharedHabits.splice(index, 1);
    }

    await ctx.db.patch(args.partnershipId, {
      sharedHabits,
    });

    return args.partnershipId;
  },
});

export const getPartnerProgress = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const partnership = await ctx.db.get(args.partnershipId);
    if (!partnership) return null;

    const partnerId =
      partnership.user1Id === user._id
        ? partnership.user2Id
        : partnership.user1Id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const partnerHabits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", partnerId))
      .collect();

    const todayCheckins = partnerHabits.filter((h) => {
      const checkIns = h.checkIns || [];
      return checkIns.some((c: number) => c >= todayStart);
    }).length;

    const myHabits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const myTodayCheckins = myHabits.filter((h) => {
      const checkIns = h.checkIns || [];
      return checkIns.some((c: number) => c >= todayStart);
    }).length;

    const partnerTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", partnerId))
      .collect();

    const partnerCompletedTasks = partnerTasks.filter((t) => t.completed).length;

    const myTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const myCompletedTasks = myTasks.filter((t) => t.completed).length;

    return {
      partner: {
        habits: partnerHabits.length,
        todayCheckins,
        completedTasks: partnerCompletedTasks,
      },
      me: {
        habits: myHabits.length,
        todayCheckins: myTodayCheckins,
        completedTasks: myCompletedTasks,
      },
    };
  },
});
