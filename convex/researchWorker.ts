import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import {
  experimentFeedback,
  isGithubCommitResult,
  isMetricImprovement,
  metricDelta,
} from "./lib/research_experiments";

const LEASE_MS = 5 * 60 * 1000;

export const prepareExperimentRound = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
  },
  returns: v.object({
    candidateQueued: v.boolean(),
    baselineQueued: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("researchRuns", args.runId);
    if (!run?.executionConfig || run.isBaseline) {
      return { candidateQueued: false, baselineQueued: false };
    }

    const candidates = await ctx.db
      .query("researchCandidates")
      .withIndex("by_run_round_rank", (q) =>
        q.eq("runId", args.runId).eq("round", args.round)
      )
      .collect();
    const candidate = candidates
      .filter((row) => row.status === "proposed")
      .sort((a, b) => a.rank - b.rank)[0];
    if (!candidate) {
      return { candidateQueued: false, baselineQueued: false };
    }

    let baselineQueued = false;
    const baseline = await ctx.db
      .query("researchExperiments")
      .withIndex("by_run_kind", (q) =>
        q.eq("runId", args.runId).eq("kind", "baseline")
      )
      .first();
    if (!baseline) {
      await ctx.db.insert("researchExperiments", {
        runId: args.runId,
        kind: "baseline",
        status: "queued",
        createdAt: Date.now(),
      });
      baselineQueued = true;
    }

    const existing = await ctx.db
      .query("researchExperiments")
      .withIndex("by_candidate", (q) => q.eq("candidateId", candidate._id))
      .first();
    if (existing) {
      return { candidateQueued: true, baselineQueued };
    }

    await ctx.db.insert("researchExperiments", {
      runId: args.runId,
      candidateId: candidate._id,
      kind: "candidate",
      status: "queued",
      createdAt: Date.now(),
    });
    await ctx.db.patch(candidate._id, { status: "queued" });
    await ctx.db.patch(args.runId, {
      status: "running",
      step: "experiment",
      loopRound: args.round,
    });
    await ctx.db.insert("researchSessions", {
      runId: args.runId,
      agent: "research:hermes",
      event: "experiment",
      payload: {
        round: args.round,
        candidateId: candidate._id,
        title: candidate.title,
        state: "queued",
        baselineQueued,
      },
      ts: Date.now(),
    });

    return { candidateQueued: true, baselineQueued };
  },
});

async function requeueExpiredLeases(
  ctx: MutationCtx,
  now: number
) {
  for (const status of ["claimed", "running"] as const) {
    const expired = await ctx.db
      .query("researchExperiments")
      .withIndex("by_status_lease", (q) =>
        q.eq("status", status).lt("leaseExpiresAt", now)
      )
      .take(20);
    for (const row of expired) {
      await ctx.db.patch(row._id, {
        status: "queued",
        workerId: undefined,
        leaseToken: undefined,
        leaseExpiresAt: undefined,
      });
      if (row.candidateId) {
        await ctx.db.patch(row.candidateId, { status: "queued" });
      }
    }
  }
}

export const claimNextExperiment = internalMutation({
  args: { workerId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const workerId = args.workerId.trim();
    if (!workerId || workerId !== args.workerId || workerId.length > 120) {
      throw new Error("workerId must be 1-120 characters without outer whitespace");
    }

    const now = Date.now();
    await requeueExpiredLeases(ctx, now);
    const queued = await ctx.db
      .query("researchExperiments")
      .withIndex("by_status_created", (q) => q.eq("status", "queued"))
      .take(30);

    for (const experiment of queued) {
      const run = await ctx.db.get("researchRuns", experiment.runId);
      if (!run?.executionConfig || run.status === "done" || run.status === "failed") {
        continue;
      }
      if (experiment.kind === "candidate" && run.bestMetric === undefined) {
        continue;
      }

      const candidate = experiment.candidateId
        ? await ctx.db.get("researchCandidates", experiment.candidateId)
        : null;
      const leaseToken = crypto.randomUUID();
      await ctx.db.patch(experiment._id, {
        status: "claimed",
        workerId,
        leaseToken,
        leaseExpiresAt: now + LEASE_MS,
        startedAt: experiment.startedAt ?? now,
      });
      if (candidate) await ctx.db.patch(candidate._id, { status: "running" });
      await ctx.db.insert("researchSessions", {
        runId: run._id,
        agent: `research:hermes:${workerId}`,
        event: "experiment",
        payload: {
          experimentId: experiment._id,
          kind: experiment.kind,
          title: candidate?.title ?? "Unmodified baseline",
          state: "claimed",
        },
        ts: now,
      });

      return {
        experimentId: experiment._id,
        runId: run._id,
        leaseToken,
        leaseExpiresAt: now + LEASE_MS,
        kind: experiment.kind,
        repositoryUrl: run.executionConfig.repositoryUrl,
        baseRevision:
          experiment.kind === "baseline"
            ? run.executionConfig.baseBranch
            : run.bestCommitSha ?? run.executionConfig.baseBranch,
        resultBranch: `paperfork/run-${String(run._id)}/experiment-${String(experiment._id)}`,
        targetFile: run.executionConfig.targetFile,
        runCommand: run.executionConfig.runCommand,
        metricName: run.executionConfig.metricName,
        metricDirection: run.executionConfig.metricDirection,
        baselineMetric: run.bestMetric,
        maxRuntimeSeconds: run.executionConfig.maxRuntimeSeconds,
        prompt: run.prompt,
        candidate: candidate
          ? {
              title: candidate.title,
              hypothesis: candidate.hypothesis,
              proposedChange: candidate.proposedChange,
              expectedEffect: candidate.expectedEffect,
              evidenceUrls: candidate.evidenceUrls,
              risks: candidate.risks,
            }
          : null,
      };
    }

    return null;
  },
});

export const heartbeatExperiment = internalMutation({
  args: {
    experimentId: v.id("researchExperiments"),
    workerId: v.string(),
    leaseToken: v.string(),
  },
  returns: v.object({ leaseExpiresAt: v.number() }),
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get("researchExperiments", args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.workerId !== args.workerId || experiment.leaseToken !== args.leaseToken) {
      throw new Error("Lease does not belong to this worker");
    }
    if (experiment.status !== "claimed" && experiment.status !== "running") {
      throw new Error("Experiment lease is no longer active");
    }
    const leaseExpiresAt = Date.now() + LEASE_MS;
    await ctx.db.patch(experiment._id, {
      status: "running",
      leaseExpiresAt,
    });
    return { leaseExpiresAt };
  },
});

export const reportExperiment = internalMutation({
  args: {
    experimentId: v.id("researchExperiments"),
    workerId: v.string(),
    leaseToken: v.string(),
    outcome: v.union(v.literal("succeeded"), v.literal("failed")),
    metricValue: v.optional(v.number()),
    commitSha: v.optional(v.string()),
    resultRef: v.optional(v.string()),
    patch: v.optional(v.string()),
    runtimeSeconds: v.optional(v.number()),
    hardware: v.optional(v.string()),
    stdoutTail: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.object({
    accepted: v.boolean(),
    scheduled: v.union(v.literal("none"), v.literal("search"), v.literal("finalize")),
  }),
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get("researchExperiments", args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.workerId !== args.workerId || experiment.leaseToken !== args.leaseToken) {
      throw new Error("Lease does not belong to this worker");
    }
    if (experiment.status === "succeeded" || experiment.status === "failed") {
      return { accepted: experiment.improved === true, scheduled: "none" as const };
    }
    const run = await ctx.db.get("researchRuns", experiment.runId);
    if (!run?.executionConfig) throw new Error("Research execution config not found");

    if (args.patch && args.patch.length > 200_000) throw new Error("Patch exceeds 200 KB");
    if (args.stdoutTail && args.stdoutTail.length > 20_000) {
      throw new Error("stdoutTail exceeds 20 KB");
    }
    const succeeded =
      args.outcome === "succeeded" &&
      args.metricValue !== undefined &&
      Number.isFinite(args.metricValue) &&
      isGithubCommitResult(args.commitSha, args.resultRef);
    const completedAt = Date.now();

    if (experiment.kind === "baseline") {
      if (!succeeded || args.metricValue === undefined || !args.commitSha) {
        const error =
          args.error ?? "Baseline did not produce a metric and matching GitHub commit URL";
        await ctx.db.patch(experiment._id, {
          status: "failed",
          error,
          runtimeSeconds: args.runtimeSeconds,
          hardware: args.hardware,
          stdoutTail: args.stdoutTail,
          completedAt,
        });
        await ctx.db.patch(run._id, { status: "failed", error });
        await ctx.db.insert("researchSessions", {
          runId: run._id,
          agent: `research:hermes:${args.workerId}`,
          event: "error",
          payload: { experimentId: experiment._id, kind: "baseline", message: error },
          ts: completedAt,
        });
        return { accepted: false, scheduled: "none" as const };
      }

      await ctx.db.patch(experiment._id, {
        status: "succeeded",
        metricValue: args.metricValue,
        commitSha: args.commitSha,
        resultRef: args.resultRef,
        runtimeSeconds: args.runtimeSeconds,
        hardware: args.hardware,
        stdoutTail: args.stdoutTail,
        completedAt,
      });
      await ctx.db.patch(run._id, {
        baselineMetric: args.metricValue,
        bestMetric: args.metricValue,
        bestCommitSha: args.commitSha,
      });
      await ctx.db.insert("researchSessions", {
        runId: run._id,
        agent: `research:hermes:${args.workerId}`,
        event: "experiment",
        payload: {
          experimentId: experiment._id,
          kind: "baseline",
          state: "succeeded",
          metricName: run.executionConfig.metricName,
          metricValue: args.metricValue,
          commitSha: args.commitSha,
        },
        ts: completedAt,
      });
      return { accepted: true, scheduled: "none" as const };
    }

    const candidate = experiment.candidateId
      ? await ctx.db.get("researchCandidates", experiment.candidateId)
      : null;
    if (!candidate) throw new Error("Experiment candidate not found");
    if (run.bestMetric === undefined) throw new Error("Baseline metric is not ready");

    const improved =
      succeeded &&
      args.metricValue !== undefined &&
      isMetricImprovement(
        run.bestMetric,
        args.metricValue,
        run.executionConfig.metricDirection,
        run.executionConfig.minimumImprovement
      );
    const delta =
      args.metricValue === undefined
        ? undefined
        : metricDelta(run.bestMetric, args.metricValue, run.executionConfig.metricDirection);

    await ctx.db.patch(experiment._id, {
      status: succeeded ? "succeeded" : "failed",
      metricValue: args.metricValue,
      improved,
      delta,
      commitSha: args.commitSha,
      resultRef: args.resultRef,
      patch: args.patch,
      runtimeSeconds: args.runtimeSeconds,
      hardware: args.hardware,
      stdoutTail: args.stdoutTail,
      error: succeeded ? undefined : args.error ?? "Experiment failed",
      completedAt,
    });
    await ctx.db.patch(candidate._id, {
      status: succeeded ? (improved ? "accepted" : "rejected") : "failed",
    });
    if (improved && args.metricValue !== undefined && args.commitSha) {
      await ctx.db.patch(run._id, {
        bestMetric: args.metricValue,
        bestCommitSha: args.commitSha,
      });
    }

    await ctx.db.insert("researchSessions", {
      runId: run._id,
      agent: `research:hermes:${args.workerId}`,
      event: "evaluate",
      payload: {
        experimentId: experiment._id,
        title: candidate.title,
        metricName: run.executionConfig.metricName,
        previousBest: run.bestMetric,
        metricValue: args.metricValue,
        delta,
        improved,
        commitSha: args.commitSha,
        error: args.error,
      },
      ts: completedAt,
    });
    await ctx.db.patch(run._id, { step: "evaluate" });

    const experiments = await ctx.db
      .query("researchExperiments")
      .withIndex("by_run", (q) => q.eq("runId", run._id))
      .collect();
    const completedCandidates = experiments.filter(
      (row) =>
        row.kind === "candidate" &&
        (row.status === "succeeded" || row.status === "failed")
    ).length;

    if (completedCandidates >= run.executionConfig.maxExperiments) {
      await ctx.scheduler.runAfter(
        0,
        internal.actions.runResearchPipeline.runFinalizeFromExperiments,
        { runId: run._id }
      );
      return { accepted: improved, scheduled: "finalize" as const };
    }

    const feedback = experimentFeedback({
      title: candidate.title,
      metricName: run.executionConfig.metricName,
      previousBest: run.bestMetric,
      metricValue: args.metricValue,
      improved,
      error: args.error,
    });
    await ctx.scheduler.runAfter(0, internal.actions.runResearchDiscover.runDiscover, {
      runId: run._id,
      round: run.loopRound + 1,
      gapFocus: feedback,
    });
    return { accepted: improved, scheduled: "search" as const };
  },
});
