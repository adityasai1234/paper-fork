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

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.web,
      event: "start",
      payload: {},
    });
    await ctx.runMutation(internal.audits.patchChip, {
      auditId: args.auditId,
      agent: "web",
      status: "running",
    });

    try {
      const litOutput = await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
        auditId: args.auditId,
        agent: "literature",
      });
      const title = litOutput?.payload?.paper?.title ?? audit.paperId;

      const linkupKey = process.env.LINKUP_API_KEY;
      let payload = {
        linkup_sources: [] as Array<{ url: string; used_for: string }>,
        external_metrics: [] as Array<{
          benchmark: string;
          metric: string;
          value: string;
          source_url: string;
        }>,
        raw_answer: "",
      };

      if (linkupKey) {
        const res = await fetch("https://api.linkup.so/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${linkupKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: `Find Papers With Code leaderboard and HuggingFace model card for: ${title}`,
            depth: "deep",
            outputType: "structured",
            structuredOutputSchema: {
              type: "object",
              properties: {
                paperswithcode_url: { type: "string" },
                paperswithcode_metrics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      benchmark: { type: "string" },
                      metric: { type: "string" },
                      value: { type: "string" },
                    },
                  },
                },
                huggingface_url: { type: "string" },
                notes: { type: "string" },
              },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const structured = data.structuredOutput ?? data;
          if (structured.paperswithcode_url) {
            payload.linkup_sources.push({
              url: structured.paperswithcode_url,
              used_for: "Papers With Code leaderboard",
            });
          }
          if (structured.huggingface_url) {
            payload.linkup_sources.push({
              url: structured.huggingface_url,
              used_for: "HuggingFace model card",
            });
          }
          for (const m of structured.paperswithcode_metrics ?? []) {
            payload.external_metrics.push({
              benchmark: m.benchmark ?? "",
              metric: m.metric ?? "",
              value: m.value ?? "",
              source_url: structured.paperswithcode_url ?? "",
            });
          }
          payload.raw_answer = structured.notes ?? JSON.stringify(structured);
        }
      }

      await ctx.runMutation(internal.lib.audit_helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "web",
        payload,
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "web",
        status: "done",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.web,
        event: "worker_report",
        payload: workerReportPayload(
          AGENTS.workers.web,
          `Linkup: ${payload.linkup_sources.length} sources; ${payload.external_metrics.length} metrics`,
          { sourceCount: payload.linkup_sources.length }
        ),
      });
      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    } catch (e) {
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "web",
        status: "error",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.web,
        event: "error",
        payload: { message: String(e) },
      });
      await ctx.runMutation(internal.lib.audit_helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "web",
        payload: { linkup_sources: [], external_metrics: [], raw_answer: "" },
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "web",
        status: "done",
      });
      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    }
  },
});
