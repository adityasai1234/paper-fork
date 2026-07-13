import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAuditForUser } from "./lib/access";
import { cronJobDoc } from "./lib/validators";

export const schedule = mutation({
  args: {
    auditId: v.id("audits"),
    scheduledAt: v.number(),
    notifyEmail: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  returns: v.id("cronJobs"),
  handler: async (ctx, args) => {
    const audit = await requireAuditForUser(ctx, args.auditId, args.sessionId);
    return await ctx.db.insert("cronJobs", {
      auditId: args.auditId,
      githubUrl: audit.githubUrl,
      scheduledAt: args.scheduledAt,
      notifyEmail: args.notifyEmail,
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
      .withIndex("by_status_scheduled", (q) => q.eq("status", "pending"))
      .collect();

    for (const job of jobs) {
      if (job.scheduledAt <= now) {
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
  args: {
    auditId: v.id("audits"),
    sessionId: v.optional(v.string()),
  },
  returns: v.array(cronJobDoc),
  handler: async (ctx, args) => {
    await requireAuditForUser(ctx, args.auditId, args.sessionId);
    return await ctx.db
      .query("cronJobs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect();
  },
});
