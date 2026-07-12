import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  getResearchForSessionOrNull,
  newSessionId,
} from "./lib/research_helpers";

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
      v.literal("evaluate")
    )
  ),
  sessionId: v.string(),
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
  createdAt: v.number(),
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
        v.literal("evaluate")
      )
    ),
    loopRound: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { runId, ...patch } = args;
    const updates: Record<string, unknown> = {};
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.step !== undefined) updates.step = patch.step;
    if (patch.loopRound !== undefined) updates.loopRound = patch.loopRound;
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
      });
      return null;
    }
    await ctx.db.insert("researchReports", {
      runId: args.runId,
      priorPapers: args.priorPapers,
      synthesis: args.synthesis,
      loopMetrics: args.loopMetrics,
      baselineComparison: args.baselineComparison,
      createdAt: Date.now(),
    });
    return null;
  },
});

async function createRunPair(
  ctx: MutationCtx,
  prompt: string,
  sessionId: string
): Promise<{ runId: Id<"researchRuns">; baselineRunId: Id<"researchRuns">; sessionId: string }> {
  const baselineRunId = await ctx.db.insert("researchRuns", {
    prompt,
    status: "queued",
    isBaseline: true,
    loopRound: 0,
    sessionId,
    createdAt: Date.now(),
  });

  const runId = await ctx.db.insert("researchRuns", {
    prompt,
    status: "queued",
    isBaseline: false,
    baselineRunId,
    loopRound: 0,
    sessionId,
    createdAt: Date.now(),
  });

  await ctx.db.patch(baselineRunId, { mainRunId: runId });

  await ctx.runMutation(internal.research.logResearchSession, {
    runId,
    agent: "research:orchestrator",
    event: "start",
    payload: { prompt, baselineRunId },
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
    const sessionId = args.sessionId ?? newSessionId();
    return await createRunPair(ctx, trimmed, sessionId);
  },
});

export const getResearchRun = query({
  args: {
    runId: v.id("researchRuns"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(researchRunDoc, v.null()),
  handler: async (ctx, args) => getResearchForSessionOrNull(ctx, args.runId, args.sessionId),
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
      reportReady: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const run = await getResearchForSessionOrNull(ctx, args.runId, args.sessionId);
    if (!run) return null;

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

    return {
      run,
      sessions: sessions.sort((a, b) => a.ts - b.ts),
      sourceCount: sources.length,
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
    const run = await getResearchForSessionOrNull(ctx, args.runId, args.sessionId);
    if (!run) return [];
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const run = await getResearchForSessionOrNull(ctx, args.runId, args.sessionId);
    if (!run || run.isBaseline) return null;

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
    };
  },
});
