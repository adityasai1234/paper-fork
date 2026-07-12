"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "runtime",
      event: "start",
      payload: {},
    });

    const payload = {
      verified: false,
      stdout: "Simulated runtime: F1 (macro): 0.891",
      metrics: { "F1 (macro)": "0.891" },
      note: "Runtime verification simulated pending SSH approval",
    };

    await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
      auditId: args.auditId,
      agent: "runtime",
      payload,
    });

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "runtime",
      event: "done",
      payload,
    });
  },
});
