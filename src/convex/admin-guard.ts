import { type QueryCtx, type MutationCtx } from "./_generated/server"

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Not authenticated")
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique()
  if (!user) throw new Error("User not found")
  return user
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx)
  if (user.role !== "admin") throw new Error("Unauthorized")
  return user
}
