"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const run = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.actions.runResearchDiscover.runDiscover, {
      runId: args.runId,
      round: 0,
    });
    return null;
  },
});

export const runFinalize = internalAction({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
    synthesis: v.string(),
    priorPapers: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        citationKey: v.string(),
        relevance: v.string(),
      })
    ),
    claimsWithEvidence: v.number(),
    gapCount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.runQuery(internal.lib.research_query.getRunInternal, {
      runId: args.runId,
    });
    if (!run) return null;

    const sourceCount = await ctx.runQuery(internal.lib.research_query.countSourcesInternal, {
      runId: args.runId,
    });

    let baselineComparison:
      | {
          baselineRunId: typeof args.runId;
          sourcesAdded: number;
          claimsWithEvidence: number;
          baselineClaimsWithEvidence: number;
          summary: string;
        }
      | undefined;

    if (run.baselineRunId) {
      const baselineReport = await ctx.runQuery(internal.lib.research_query.getReportInternal, {
        runId: run.baselineRunId,
      });
      const baselineClaims = baselineReport?.loopMetrics.claimsWithEvidence ?? 0;
      const baselineSources = baselineReport?.loopMetrics.sourceCount ?? 0;
      const claimsDelta = args.claimsWithEvidence - baselineClaims;
      const sourcesDelta = sourceCount - baselineSources;

      baselineComparison = {
        baselineRunId: run.baselineRunId,
        sourcesAdded: sourcesDelta,
        claimsWithEvidence: args.claimsWithEvidence,
        baselineClaimsWithEvidence: baselineClaims,
        summary: `Paperfork research added ${sourcesDelta} cited sources and ${claimsDelta} additional evidence-backed claims versus prompt-only baseline (${baselineClaims} → ${args.claimsWithEvidence} claims).`,
      };
    }

    const allSources = await ctx.runQuery(internal.lib.research_query.listSourcesInternal, {
      runId: args.runId,
    });

    const priorFromSources = allSources.slice(0, 20).map((s) => ({
      title: s.title,
      url: s.url,
      citationKey: s.citationKey,
      relevance: "medium",
    }));

    const priorPapers =
      args.priorPapers.length > 0
        ? args.priorPapers
        : priorFromSources.length > 0
          ? priorFromSources
          : [];

    await ctx.runMutation(internal.research.insertResearchReport, {
      runId: args.runId,
      priorPapers,
      synthesis: args.synthesis,
      loopMetrics: {
        rounds: args.round + 1,
        sourceCount,
        gapCount: args.gapCount,
        claimsWithEvidence: args.claimsWithEvidence,
      },
      baselineComparison,
    });

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.runId,
      status: "done",
    });

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:orchestrator",
      event: "done",
      payload: {
        sourceCount,
        rounds: args.round + 1,
        baselineComparison,
      },
    });

    return null;
  },
});
