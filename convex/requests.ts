import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAudit } from "./lib/access";
import { reportPageUrl } from "./lib/app_url";
import { userRequestDoc } from "./lib/validators";

export const listByAudit = query({
  args: {
    auditId: v.id("audits"),
    sessionId: v.optional(v.string()),
  },
  returns: v.array(userRequestDoc),
  handler: async (ctx, args) => {
    await requireAudit(ctx, args.auditId);
    return await ctx.db
      .query("userRequests")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect();
  },
});

export const approveRequest = mutation({
  args: {
    requestId: v.id("userRequests"),
    sessionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") return null;

    await requireAudit(ctx, request.auditId);

    const reportUrl = reportPageUrl(request.auditId);
    const approvalOutput =
      request.type === "SSH"
        ? `SSH/GPU access approved. Remote execution is not configured on this deployment — use the repro appendix in the fork report and run locally.\nReport: ${reportUrl}`
        : `${request.type} request approved. See fork report for next steps: ${reportUrl}`;

    await ctx.db.patch(args.requestId, {
      status: "done",
      simulatedOutput: approvalOutput,
    });

    if (request.type === "SSH" || request.type === "GPU") {
      await ctx.scheduler.runAfter(0, internal.actions.runRuntimeVerify.run, {
        auditId: request.auditId,
      });
    }

    return null;
  },
});

export const denyRequest = mutation({
  args: {
    requestId: v.id("userRequests"),
    sessionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") return null;

    await requireAudit(ctx, request.auditId);
    await ctx.db.patch(args.requestId, { status: "denied" });
    return null;
  },
});
