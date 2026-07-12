import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByAudit = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("userRequests")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect(),
});

export const approveRequest = mutation({
  args: { requestId: v.id("userRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") return;

    const simulatedOutput =
      request.type === "SSH"
        ? `$ bash scripts/full_eval.sh\nLoading checkpoint... OK\nEvaluating on test split (1000 samples)...\nF1 (macro): 0.874 -> 0.891 (with suggested StratifiedKFold)`
        : `Simulated ${request.type} access granted.`;

    await ctx.db.patch(args.requestId, {
      status: "done",
      simulatedOutput,
    });
  },
});

export const denyRequest = mutation({
  args: { requestId: v.id("userRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") return;
    await ctx.db.patch(args.requestId, { status: "denied" });
  },
});
