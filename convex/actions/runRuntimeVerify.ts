"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, workerReportPayload } from "../lib/agent_hierarchy";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.runtime,
      event: "start",
      payload: { reportsTo: AGENTS.ruler },
    });

    const payload = {
      verified: false,
      stdout: "Simulated runtime: F1 (macro): 0.891",
      metrics: { "F1 (macro)": "0.891" },
      note: "Runtime verification simulated pending SSH approval",
    };

    await ctx.runMutation(internal.lib.audit_helpers.insertAgentOutput, {
      auditId: args.auditId,
      agent: "runtime",
      payload,
    });

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.runtime,
      event: "worker_report",
      payload: workerReportPayload(
        AGENTS.workers.runtime,
        "Simulated runtime verify; macro F1 0.891 (pending SSH)",
        { verified: false }
      ),
    });
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.runtime,
      event: "done",
      payload,
    });
  },
});
