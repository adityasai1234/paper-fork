"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, workerReportPayload } from "../lib/agent_hierarchy";
import type { RepoPayload } from "../lib/fork_rules";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.runtime,
      event: "start",
      payload: { reportsTo: AGENTS.ruler },
    });

    const repoRow = await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "repo",
    });
    const repo = repoRow?.payload as RepoPayload | undefined;

    const metrics: Record<string, string> = {};
    for (const hit of repo?.metrics_found ?? []) {
      const key = `${hit.file}:${hit.line}`;
      metrics[key] = hit.snippet;
    }

    const seedCount = repo?.seeds_found?.length ?? 0;
    const splitCount = repo?.splits_found?.length ?? 0;
    const metricCount = repo?.metrics_found?.length ?? 0;

    const payload = {
      verified: false,
      staticAnalysisOnly: true,
      metrics,
      seeds_found: repo?.seeds_found ?? [],
      splits_found: repo?.splits_found ?? [],
      stdout:
        metricCount > 0 || seedCount > 0 || splitCount > 0
          ? `Repo scan: ${metricCount} metric ref(s), ${seedCount} seed ref(s), ${splitCount} split ref(s). No remote execution — signals from static GitHub scan only.`
          : "No eval signals in repo scan. Remote SSH/GPU execution is not configured on this deployment.",
      note: "Runtime worker surfaces repo scan signals; live eval requires a configured remote executor.",
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
        `Static runtime scan: ${metricCount} metrics, ${seedCount} seeds, ${splitCount} splits (no remote exec)`,
        { verified: false, metricCount, seedCount, splitCount }
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
