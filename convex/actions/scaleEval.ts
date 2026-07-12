"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.actions.helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const scaleRound = audit.scaleRound ?? 0;
    if (scaleRound >= 2) return;

    await ctx.runMutation(internal.actions.helpers.incrementScaleRound, {
      auditId: args.auditId,
    });

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "eval-scaler",
      event: "start",
      payload: { round: scaleRound + 1 },
    });

    await ctx.scheduler.runAfter(0, internal.actions.runRuntimeVerify.run, {
      auditId: args.auditId,
    });
    await ctx.scheduler.runAfter(0, internal.actions.runWeb.run, {
      auditId: args.auditId,
    });

    await ctx.scheduler.runAfter(5_000, internal.actions.runJudge.run, {
      auditId: args.auditId,
    });
  },
});
