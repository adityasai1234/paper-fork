"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { sourcesBasedSynthesis } from "../lib/research_helpers";

const experimentSummaryValidator = v.object({
  metricName: v.string(),
  metricDirection: v.union(v.literal("minimize"), v.literal("maximize")),
  baselineMetric: v.optional(v.number()),
  bestMetric: v.optional(v.number()),
  attempted: v.number(),
  accepted: v.number(),
  bestCommitSha: v.optional(v.string()),
});

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
    experimentSummary: v.optional(experimentSummaryValidator),
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
      experimentSummary: args.experimentSummary,
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

export const runFinalizeFromExperiments = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.runQuery(internal.lib.research_query.getRunInternal, {
      runId: args.runId,
    });
    if (!run || run.isBaseline) return null;

    const sources = await ctx.runQuery(internal.lib.research_query.listSourcesInternal, {
      runId: args.runId,
    });
    const experiments = await ctx.runQuery(
      internal.lib.research_query.listExperimentsInternal,
      { runId: args.runId }
    );
    const active = experiments.some(
      (experiment) =>
        experiment.status === "queued" ||
        experiment.status === "claimed" ||
        experiment.status === "running"
    );
    if (active) return null;

    const literature = sourcesBasedSynthesis(run.prompt, sources);
    const candidates = experiments.filter((experiment) => experiment.kind === "candidate");
    const attempted = candidates.filter(
      (experiment) =>
        experiment.status === "succeeded" || experiment.status === "failed"
    ).length;
    const accepted = candidates.filter((experiment) => experiment.improved).length;
    const metricName = run.executionConfig?.metricName ?? "metric";
    const experimentNarrative = run.executionConfig
      ? `\n\nCloud experiment loop:\n- Repository: ${run.executionConfig.repositoryUrl}\n- Baseline ${metricName}: ${run.baselineMetric ?? "not measured"}\n- Best ${metricName}: ${run.bestMetric ?? "not measured"}\n- Candidate experiments: ${attempted}\n- Accepted improvements: ${accepted}\n- Winning commit: ${run.bestCommitSha ?? "none"}`
      : "";

    await ctx.scheduler.runAfter(0, internal.actions.runResearchPipeline.runFinalize, {
      runId: args.runId,
      round: run.loopRound,
      synthesis: `${literature.synthesis}${experimentNarrative}`,
      priorPapers: literature.priorPapers,
      claimsWithEvidence: literature.claimsWithEvidence,
      gapCount: candidates.filter(
        (experiment) => experiment.status === "failed" || experiment.improved === false
      ).length,
      experimentSummary: run.executionConfig
        ? {
            metricName,
            metricDirection: run.executionConfig.metricDirection,
            baselineMetric: run.baselineMetric,
            bestMetric: run.bestMetric,
            attempted,
            accepted,
            bestCommitSha: run.bestCommitSha,
          }
        : undefined,
    });
    return null;
  },
});
