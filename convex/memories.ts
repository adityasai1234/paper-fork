import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { memoryDoc } from "./lib/validators";

export const listRecallableByOwner = internalQuery({
  args: { repoOwner: v.string() },
  returns: v.array(memoryDoc),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("memories")
      .withIndex("by_owner", (q) => q.eq("repoOwner", args.repoOwner))
      .collect();

    return rows
      .filter((m) => m.occurrences >= 2)
      .sort((a, b) => b.occurrences - a.occurrences || b.lastSeenAt - a.lastSeenAt);
  },
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
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const p of args.patterns) {
      const existing = await ctx.db
        .query("memories")
        .withIndex("by_owner_pattern", (q) =>
          q.eq("repoOwner", args.repoOwner).eq("pattern", p.pattern)
        )
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
    return null;
  },
});
