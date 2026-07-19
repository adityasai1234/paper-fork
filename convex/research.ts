import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { canAccessResearch } from "./lib/access";
import { requireAuthUserId } from "./lib/auth_session";
import { getResearchOrNull, newSessionId } from "./lib/research_helpers";
import {
  candidateKey,
  normalizeBaseBranch,
  normalizeGithubRepositoryUrl,
} from "./lib/research_experiments";

const researchExecutionConfig = v.object({
  repositoryUrl: v.string(),
  baseBranch: v.string(),
  targetFile: v.literal("train.py"),
  runCommand: v.string(),
  metricName: v.string(),
  metricDirection: v.union(v.literal("minimize"), v.literal("maximize")),
  minimumImprovement: v.number(),
  maxExperiments: v.number(),
  maxRuntimeSeconds: v.number(),
});

const researchExperimentSummary = v.object({
  metricName: v.string(),
  metricDirection: v.union(v.literal("minimize"), v.literal("maximize")),
  baselineMetric: v.optional(v.number()),
  bestMetric: v.optional(v.number()),
  attempted: v.number(),
  accepted: v.number(),
  bestCommitSha: v.optional(v.string()),
});

const researchRunDoc = v.object({
  _id: v.id("researchRuns"),
  _creationTime: v.number(),
  prompt: v.string(),
  status: v.union(
    v.literal("queued"),
    v.literal("running"),
    v.literal("done"),
    v.literal("failed")
  ),
  isBaseline: v.boolean(),
  baselineRunId: v.optional(v.id("researchRuns")),
  mainRunId: v.optional(v.id("researchRuns")),
  loopRound: v.number(),
  step: v.optional(
    v.union(
      v.literal("discover"),
      v.literal("cite"),
      v.literal("synthesize"),
      v.literal("experiment"),
      v.literal("evaluate")
    )
  ),
  sessionId: v.string(),
  userId: v.optional(v.id("users")),
  executionConfig: v.optional(researchExecutionConfig),
  baselineMetric: v.optional(v.number()),
  bestMetric: v.optional(v.number()),
  bestCommitSha: v.optional(v.string()),
  error: v.optional(v.string()),
  createdAt: v.number(),
});

const researchSessionDoc = v.object({
  _id: v.id("researchSessions"),
  _creationTime: v.number(),
  runId: v.id("researchRuns"),
  agent: v.string(),
  event: v.union(
    v.literal("start"),
    v.literal("discover"),
    v.literal("cite"),
    v.literal("synthesize"),
    v.literal("experiment"),
    v.literal("evaluate"),
    v.literal("tool_call"),
    v.literal("llm_turn"),
    v.literal("error"),
    v.literal("done")
  ),
  payload: v.any(),
  ts: v.number(),
});

const researchReportDoc = v.object({
  _id: v.id("researchReports"),
  _creationTime: v.number(),
  runId: v.id("researchRuns"),
  priorPapers: v.array(
    v.object({
      title: v.string(),
      url: v.string(),
      citationKey: v.string(),
      relevance: v.string(),
    })
  ),
  synthesis: v.string(),
  loopMetrics: v.object({
    rounds: v.number(),
    sourceCount: v.number(),
    gapCount: v.number(),
    claimsWithEvidence: v.number(),
  }),
  baselineComparison: v.optional(
    v.object({
      baselineRunId: v.id("researchRuns"),
      sourcesAdded: v.number(),
      claimsWithEvidence: v.number(),
      baselineClaimsWithEvidence: v.number(),
      summary: v.string(),
    })
  ),
  experimentSummary: v.optional(researchExperimentSummary),
  createdAt: v.number(),
});

const researchExperimentPublicDoc = v.object({
  _id: v.id("researchExperiments"),
  kind: v.union(v.literal("baseline"), v.literal("candidate")),
  status: v.union(
    v.literal("queued"),
    v.literal("claimed"),
    v.literal("running"),
    v.literal("succeeded"),
    v.literal("failed")
  ),
  title: v.string(),
  hypothesis: v.optional(v.string()),
  proposedChange: v.optional(v.string()),
  metricValue: v.optional(v.number()),
  improved: v.optional(v.boolean()),
  delta: v.optional(v.number()),
  commitSha: v.optional(v.string()),
  resultRef: v.optional(v.string()),
  runtimeSeconds: v.optional(v.number()),
  hardware: v.optional(v.string()),
  error: v.optional(v.string()),
});

export const logResearchSession = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    agent: v.string(),
    event: v.union(
      v.literal("start"),
      v.literal("discover"),
      v.literal("cite"),
      v.literal("synthesize"),
      v.literal("experiment"),
      v.literal("evaluate"),
      v.literal("tool_call"),
      v.literal("llm_turn"),
      v.literal("error"),
      v.literal("done")
    ),
    payload: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("researchSessions", {
      runId: args.runId,
      agent: args.agent,
      event: args.event,
      payload: args.payload,
      ts: Date.now(),
    });
    return null;
  },
});

export const patchResearchRun = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("running"),
        v.literal("done"),
        v.literal("failed")
      )
    ),
    step: v.optional(
      v.union(
        v.literal("discover"),
        v.literal("cite"),
        v.literal("synthesize"),
        v.literal("experiment"),
        v.literal("evaluate")
      )
    ),
    loopRound: v.optional(v.number()),
    baselineMetric: v.optional(v.number()),
    bestMetric: v.optional(v.number()),
    bestCommitSha: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { runId, ...patch } = args;
    const updates: Record<string, unknown> = {};
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.step !== undefined) updates.step = patch.step;
    if (patch.loopRound !== undefined) updates.loopRound = patch.loopRound;
    if (patch.baselineMetric !== undefined) updates.baselineMetric = patch.baselineMetric;
    if (patch.bestMetric !== undefined) updates.bestMetric = patch.bestMetric;
    if (patch.bestCommitSha !== undefined) updates.bestCommitSha = patch.bestCommitSha;
    if (patch.error !== undefined) updates.error = patch.error;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(runId, updates);
    }
    return null;
  },
});

export const insertResearchSources = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
    sources: v.array(
      v.object({
        url: v.string(),
        title: v.string(),
        authors: v.optional(v.array(v.string())),
        year: v.optional(v.number()),
        quote: v.optional(v.string()),
        citationKey: v.string(),
        usedFor: v.string(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const s of args.sources) {
      await ctx.db.insert("researchSources", {
        runId: args.runId,
        url: s.url,
        title: s.title,
        authors: s.authors,
        year: s.year,
        quote: s.quote,
        citationKey: s.citationKey,
        usedFor: s.usedFor,
        round: args.round,
      });
    }
    return null;
  },
});

export const insertResearchCandidates = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
    candidates: v.array(
      v.object({
        title: v.string(),
        hypothesis: v.string(),
        proposedChange: v.string(),
        expectedEffect: v.string(),
        evidenceUrls: v.array(v.string()),
        risks: v.array(v.string()),
        rank: v.number(),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let inserted = 0;
    for (const candidate of args.candidates) {
      const key = candidateKey(candidate);
      const existing = await ctx.db
        .query("researchCandidates")
        .withIndex("by_run_key", (q) =>
          q.eq("runId", args.runId).eq("candidateKey", key)
        )
        .first();
      if (existing) continue;
      await ctx.db.insert("researchCandidates", {
        runId: args.runId,
        round: args.round,
        candidateKey: key,
        ...candidate,
        status: "proposed",
        createdAt: Date.now(),
      });
      inserted += 1;
    }
    return inserted;
  },
});

export const insertResearchReport = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    priorPapers: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        citationKey: v.string(),
        relevance: v.string(),
      })
    ),
    synthesis: v.string(),
    loopMetrics: v.object({
      rounds: v.number(),
      sourceCount: v.number(),
      gapCount: v.number(),
      claimsWithEvidence: v.number(),
    }),
    baselineComparison: v.optional(
      v.object({
        baselineRunId: v.id("researchRuns"),
        sourcesAdded: v.number(),
        claimsWithEvidence: v.number(),
        baselineClaimsWithEvidence: v.number(),
        summary: v.string(),
      })
    ),
    experimentSummary: v.optional(researchExperimentSummary),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("researchReports")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        priorPapers: args.priorPapers,
        synthesis: args.synthesis,
        loopMetrics: args.loopMetrics,
        baselineComparison: args.baselineComparison,
        experimentSummary: args.experimentSummary,
      });
      return null;
    }
    await ctx.db.insert("researchReports", {
      runId: args.runId,
      priorPapers: args.priorPapers,
      synthesis: args.synthesis,
      loopMetrics: args.loopMetrics,
      baselineComparison: args.baselineComparison,
      experimentSummary: args.experimentSummary,
      createdAt: Date.now(),
    });
    return null;
  },
});

async function createRunPair(
  ctx: MutationCtx,
  prompt: string,
  sessionId: string,
  userId: Id<"users">,
  executionConfig?: {
    repositoryUrl: string;
    baseBranch: string;
    targetFile: "train.py";
    runCommand: string;
    metricName: string;
    metricDirection: "minimize" | "maximize";
    minimumImprovement: number;
    maxExperiments: number;
    maxRuntimeSeconds: number;
  }
): Promise<{ runId: Id<"researchRuns">; baselineRunId: Id<"researchRuns">; sessionId: string }> {
  const baselineRunId = await ctx.db.insert("researchRuns", {
    prompt,
    status: "queued",
    isBaseline: true,
    loopRound: 0,
    sessionId,
    userId,
    createdAt: Date.now(),
  });

  const runId = await ctx.db.insert("researchRuns", {
    prompt,
    status: "queued",
    isBaseline: false,
    baselineRunId,
    loopRound: 0,
    sessionId,
    userId,
    executionConfig,
    createdAt: Date.now(),
  });

  await ctx.db.patch(baselineRunId, { mainRunId: runId });

  await ctx.runMutation(internal.research.logResearchSession, {
    runId,
    agent: "research:orchestrator",
    event: "start",
    payload: {
      prompt,
      baselineRunId,
      execution: executionConfig
        ? {
            repositoryUrl: executionConfig.repositoryUrl,
            metricName: executionConfig.metricName,
            maxExperiments: executionConfig.maxExperiments,
          }
        : undefined,
    },
  });

  await ctx.scheduler.runAfter(0, internal.actions.runResearchBaseline.run, {
    baselineRunId,
  });
  await ctx.scheduler.runAfter(0, internal.actions.runResearchPipeline.run, {
    runId,
  });

  return { runId, baselineRunId, sessionId };
}

export const createResearchRun = mutation({
  args: {
    prompt: v.string(),
    sessionId: v.optional(v.string()),
    repositoryUrl: v.optional(v.string()),
    baseBranch: v.optional(v.string()),
    metricName: v.optional(v.string()),
    runCommand: v.optional(v.string()),
    metricDirection: v.optional(
      v.union(v.literal("minimize"), v.literal("maximize"))
    ),
    minimumImprovement: v.optional(v.number()),
    maxExperiments: v.optional(v.number()),
    maxRuntimeSeconds: v.optional(v.number()),
  },
  returns: v.object({
    runId: v.id("researchRuns"),
    baselineRunId: v.id("researchRuns"),
    sessionId: v.string(),
  }),
  handler: async (ctx, args) => {
    const trimmed = args.prompt.trim();
    if (trimmed.length < 10) {
      throw new Error("Research prompt must be at least 10 characters");
    }
    const userId = await requireAuthUserId(ctx);
    const sessionId = args.sessionId ?? newSessionId();
    let executionConfig:
      | {
          repositoryUrl: string;
          baseBranch: string;
          targetFile: "train.py";
          runCommand: string;
          metricName: string;
          metricDirection: "minimize" | "maximize";
          minimumImprovement: number;
          maxExperiments: number;
          maxRuntimeSeconds: number;
        }
      | undefined;

    if (args.repositoryUrl?.trim()) {
      const repositoryUrl = normalizeGithubRepositoryUrl(args.repositoryUrl);
      if (!repositoryUrl) throw new Error("Enter a valid GitHub repository URL");
      const baseBranch = normalizeBaseBranch(args.baseBranch ?? "main");
      if (!baseBranch) throw new Error("Enter a valid base branch or revision");
      const metricName = (args.metricName ?? "val_bpb").trim();
      if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(metricName)) {
        throw new Error("Metric name must be a simple identifier");
      }
      const maxExperiments = Math.trunc(args.maxExperiments ?? 5);
      if (maxExperiments < 1 || maxExperiments > 20) {
        throw new Error("Experiment budget must be between 1 and 20");
      }
      const maxRuntimeSeconds = Math.trunc(args.maxRuntimeSeconds ?? 300);
      if (maxRuntimeSeconds < 60 || maxRuntimeSeconds > 3600) {
        throw new Error("Runtime must be between 1 and 60 minutes");
      }
      const minimumImprovement = args.minimumImprovement ?? 0;
      if (!Number.isFinite(minimumImprovement) || minimumImprovement < 0) {
        throw new Error("Minimum improvement must be zero or greater");
      }
      const runCommand = (args.runCommand ?? "uv run train.py").trim();
      if (!runCommand || runCommand.length > 300 || /[\r\n]/.test(runCommand)) {
        throw new Error("Run command must be one line and at most 300 characters");
      }
      executionConfig = {
        repositoryUrl,
        baseBranch,
        targetFile: "train.py",
        runCommand,
        metricName,
        metricDirection: args.metricDirection ?? "minimize",
        minimumImprovement,
        maxExperiments,
        maxRuntimeSeconds,
      };
    }

    return await createRunPair(ctx, trimmed, sessionId, userId, executionConfig);
  },
});

export const getResearchRun = query({
  args: {
    runId: v.id("researchRuns"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(researchRunDoc, v.null()),
  handler: async (ctx, args) => {
    const run = await getResearchOrNull(ctx, args.runId);
    if (!run || !(await canAccessResearch(ctx, run, args.sessionId))) return null;
    return run;
  },
});

export const getResearchLiveProgress = query({
  args: {
    runId: v.id("researchRuns"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      run: researchRunDoc,
      sessions: v.array(researchSessionDoc),
      sourceCount: v.number(),
      experimentCounts: v.object({
        queued: v.number(),
        running: v.number(),
        completed: v.number(),
        accepted: v.number(),
        failed: v.number(),
      }),
      reportReady: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const run = await getResearchOrNull(ctx, args.runId);
    if (!run || !(await canAccessResearch(ctx, run, args.sessionId))) return null;

    const sessions = await ctx.db
      .query("researchSessions")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();

    const sources = await ctx.db
      .query("researchSources")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();

    const report = await ctx.db
      .query("researchReports")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .first();

    const experiments = await ctx.db
      .query("researchExperiments")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();

    return {
      run,
      sessions: sessions.sort((a, b) => a.ts - b.ts),
      sourceCount: sources.length,
      experimentCounts: {
        queued: experiments.filter((e) => e.status === "queued").length,
        running: experiments.filter(
          (e) => e.status === "claimed" || e.status === "running"
        ).length,
        completed: experiments.filter(
          (e) =>
            e.kind === "candidate" &&
            (e.status === "succeeded" || e.status === "failed")
        ).length,
        accepted: experiments.filter((e) => e.improved === true).length,
        failed: experiments.filter((e) => e.status === "failed").length,
      },
      reportReady: Boolean(report && run.status === "done"),
    };
  },
});

export const listResearchSessions = query({
  args: {
    runId: v.id("researchRuns"),
    sessionId: v.optional(v.string()),
  },
  returns: v.array(researchSessionDoc),
  handler: async (ctx, args) => {
    const run = await getResearchOrNull(ctx, args.runId);
    if (!run || !(await canAccessResearch(ctx, run, args.sessionId))) return [];
    const sessions = await ctx.db
      .query("researchSessions")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    return sessions.sort((a, b) => a.ts - b.ts);
  },
});

export const getResearchReport = query({
  args: {
    runId: v.id("researchRuns"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      run: researchRunDoc,
      report: researchReportDoc,
      sources: v.array(
        v.object({
          _id: v.id("researchSources"),
          url: v.string(),
          title: v.string(),
          citationKey: v.string(),
          usedFor: v.string(),
          quote: v.optional(v.string()),
          round: v.number(),
        })
      ),
      baselineReport: v.union(researchReportDoc, v.null()),
      experiments: v.array(researchExperimentPublicDoc),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const run = await getResearchOrNull(ctx, args.runId);
    if (!run || run.isBaseline || !(await canAccessResearch(ctx, run, args.sessionId))) {
      return null;
    }

    const report = await ctx.db
      .query("researchReports")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .first();
    if (!report) return null;

    const sources = await ctx.db
      .query("researchSources")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();

    let baselineReport = null;
    if (run.baselineRunId) {
      baselineReport = await ctx.db
        .query("researchReports")
        .withIndex("by_run", (q) => q.eq("runId", run.baselineRunId!))
        .first();
    }

    const experimentRows = await ctx.db
      .query("researchExperiments")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    const experiments = await Promise.all(
      experimentRows.map(async (experiment) => {
        const candidate = experiment.candidateId
          ? await ctx.db.get("researchCandidates", experiment.candidateId)
          : null;
        return {
          _id: experiment._id,
          kind: experiment.kind,
          status: experiment.status,
          title: candidate?.title ?? "Unmodified baseline",
          hypothesis: candidate?.hypothesis,
          proposedChange: candidate?.proposedChange,
          metricValue: experiment.metricValue,
          improved: experiment.improved,
          delta: experiment.delta,
          commitSha: experiment.commitSha,
          resultRef: experiment.resultRef,
          runtimeSeconds: experiment.runtimeSeconds,
          hardware: experiment.hardware,
          error: experiment.error,
        };
      })
    );

    return {
      run,
      report,
      sources: sources.map((s) => ({
        _id: s._id,
        url: s.url,
        title: s.title,
        citationKey: s.citationKey,
        usedFor: s.usedFor,
        quote: s.quote,
        round: s.round,
      })),
      baselineReport,
      experiments,
    };
  },
});
