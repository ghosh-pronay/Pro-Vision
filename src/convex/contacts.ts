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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    relationship: v.string(),
    birthday: v.optional(v.number()),
    notes: v.optional(v.string()),
    strength: v.optional(
      v.union(v.literal("strong"), v.literal("medium"), v.literal("weak")),
    ),
    tags: v.optional(v.array(v.string())),
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

    const now = Date.now();
    return await ctx.db.insert("contacts", {
      userId: user._id,
      name: args.name,
      phone: args.phone,
      email: args.email,
      relationship: args.relationship,
      birthday: args.birthday,
      notes: args.notes,
      strength: args.strength,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    relationship: v.optional(v.string()),
    birthday: v.optional(v.number()),
    notes: v.optional(v.string()),
    strength: v.optional(
      v.union(v.literal("strong"), v.literal("medium"), v.literal("weak")),
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const contact = await ctx.db.get(args.id);
    if (!contact) throw new Error("Contact not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || contact.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email;
    if (args.relationship !== undefined)
      updates.relationship = args.relationship;
    if (args.birthday !== undefined) updates.birthday = args.birthday;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.strength !== undefined) updates.strength = args.strength;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const contact = await ctx.db.get(args.id);
    if (!contact) throw new Error("Contact not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || contact.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const upcomingBirthdays = query({
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

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    return contacts.filter((c) => {
      if (!c.birthday) return false;
      const birthday = new Date(c.birthday);
      const thisYearBirthday = new Date(
        now.getFullYear(),
        birthday.getMonth(),
        birthday.getDate(),
      );
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
      }
      return thisYearBirthday <= thirtyDaysFromNow;
    });
  },
});
