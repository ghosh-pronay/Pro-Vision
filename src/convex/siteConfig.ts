import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("siteConfig").collect();
    const result: Record<string, any> = {};
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return result;
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("siteConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return config?.value;
  },
});
