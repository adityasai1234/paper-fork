"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, workerReportPayload } from "../lib/agent_hierarchy";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.lib.audit_helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const scaleRound = audit.scaleRound ?? 0;
    if (scaleRound >= 2) return;

    await ctx.runMutation(internal.lib.audit_helpers.incrementScaleRound, {
      auditId: args.auditId,
    });

    const nextRound = scaleRound + 1;

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.ruler,
      event: "delegate",
      payload: {
        action: "scaleEval",
        round: nextRound,
        workers: [AGENTS.workers.evalScaler, AGENTS.workers.runtime, AGENTS.workers.web],
      },
    });

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.evalScaler,
      event: "start",
      payload: { round: nextRound, reportsTo: AGENTS.ruler },
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

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.evalScaler,
      event: "worker_report",
      payload: workerReportPayload(
        AGENTS.workers.evalScaler,
        `Scale round ${nextRound}: re-ran runtime + web, judge rescheduled`,
        { round: nextRound }
      ),
    });
  },
});
