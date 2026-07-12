import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAudit } from "./lib/access";
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

    const simulatedOutput =
      request.type === "SSH"
        ? `$ bash scripts/full_eval.sh\nLoading checkpoint... OK\nEvaluating on test split (1000 samples)...\nF1 (macro): 0.874 -> 0.891 (with suggested StratifiedKFold)`
        : `Simulated ${request.type} access granted.`;

    await ctx.db.patch(args.requestId, {
      status: "done",
      simulatedOutput,
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
