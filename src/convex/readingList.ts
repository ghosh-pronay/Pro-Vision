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
      .query("readingList")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    type: v.union(
      v.literal("book"),
      v.literal("article"),
      v.literal("audiobook"),
      v.literal("podcast"),
    ),
    status: v.union(
      v.literal("to_read"),
      v.literal("reading"),
      v.literal("completed"),
      v.literal("paused"),
    ),
    progress: v.optional(v.number()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    url: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    totalPages: v.optional(v.number()),
    currentPage: v.optional(v.number()),
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
    return await ctx.db.insert("readingList", {
      userId: user._id,
      title: args.title,
      author: args.author,
      type: args.type,
      status: args.status,
      progress: args.progress,
      rating: args.rating,
      notes: args.notes,
      url: args.url,
      coverUrl: args.coverUrl,
      totalPages: args.totalPages,
      currentPage: args.currentPage,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("readingList"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("book"),
        v.literal("article"),
        v.literal("audiobook"),
        v.literal("podcast"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("to_read"),
        v.literal("reading"),
        v.literal("completed"),
        v.literal("paused"),
      ),
    ),
    progress: v.optional(v.number()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    url: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    totalPages: v.optional(v.number()),
    currentPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || item.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.author !== undefined) updates.author = args.author;
    if (args.type !== undefined) updates.type = args.type;
    if (args.status !== undefined) updates.status = args.status;
    if (args.progress !== undefined) updates.progress = args.progress;
    if (args.rating !== undefined) updates.rating = args.rating;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.url !== undefined) updates.url = args.url;
    if (args.coverUrl !== undefined) updates.coverUrl = args.coverUrl;
    if (args.totalPages !== undefined) updates.totalPages = args.totalPages;
    if (args.currentPage !== undefined) updates.currentPage = args.currentPage;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("readingList") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user || item.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
