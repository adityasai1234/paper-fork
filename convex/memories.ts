import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const listByOwner = query({
  args: { repoOwner: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("memories")
      .withIndex("by_owner", (q) => q.eq("repoOwner", args.repoOwner))
      .collect(),
});

export const upsertFromLedger = internalMutation({
  args: {
    repoOwner: v.string(),
    patterns: v.array(
      v.object({
        pattern: v.string(),
        checklistBoost: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const p of args.patterns) {
      const existing = await ctx.db
        .query("memories")
        .withIndex("by_owner", (q) => q.eq("repoOwner", args.repoOwner))
        .filter((q) => q.eq(q.field("pattern"), p.pattern))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          occurrences: existing.occurrences + 1,
          lastSeenAt: Date.now(),
          checklistBoost: p.checklistBoost,
        });
      } else {
        await ctx.db.insert("memories", {
          repoOwner: args.repoOwner,
          pattern: p.pattern,
          occurrences: 1,
          lastSeenAt: Date.now(),
          checklistBoost: p.checklistBoost,
        });
      }
    }
  },
});
