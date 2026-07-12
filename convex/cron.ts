import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

export const schedule = mutation({
  args: {
    auditId: v.id("audits"),
    githubUrl: v.string(),
    scheduledAt: v.number(),
    notifyEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cronJobs", {
      ...args,
      status: "pending",
    });
  },
});

export const listPending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const jobs = await ctx.db
      .query("cronJobs")
      .withIndex("by_scheduled")
      .collect();

    for (const job of jobs) {
      if (job.status === "pending" && job.scheduledAt <= now) {
        await ctx.db.patch(job._id, { status: "fired" });
        const audit = await ctx.db.get(job.auditId);
        if (!audit) continue;
        await ctx.scheduler.runAfter(0, internal.actions.runJudge.run, {
          auditId: job.auditId,
          isReaudit: true,
        });
      }
    }
  },
});

export const listByAudit = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("cronJobs")
      .filter((q) => q.eq(q.field("auditId"), args.auditId))
      .collect(),
});
