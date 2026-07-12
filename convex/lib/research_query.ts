import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getRunInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  returns: v.union(
    v.object({
      _id: v.id("researchRuns"),
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
      sessionId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("researchRuns", args.runId);
    if (!run) return null;
    return {
      _id: run._id,
      prompt: run.prompt,
      status: run.status,
      isBaseline: run.isBaseline,
      baselineRunId: run.baselineRunId,
      mainRunId: run.mainRunId,
      loopRound: run.loopRound,
      sessionId: run.sessionId,
    };
  },
});

export const listSourcesInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  returns: v.array(
    v.object({
      url: v.string(),
      title: v.string(),
      citationKey: v.string(),
      usedFor: v.string(),
      quote: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const sources = await ctx.db
      .query("researchSources")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    return sources.map((s) => ({
      url: s.url,
      title: s.title,
      citationKey: s.citationKey,
      usedFor: s.usedFor,
      quote: s.quote,
    }));
  },
});

export const getReportInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  returns: v.union(
    v.object({
      loopMetrics: v.object({
        rounds: v.number(),
        sourceCount: v.number(),
        gapCount: v.number(),
        claimsWithEvidence: v.number(),
      }),
      priorPapers: v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          citationKey: v.string(),
          relevance: v.string(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("researchReports")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .first();
    if (!report) return null;
    return {
      loopMetrics: report.loopMetrics,
      priorPapers: report.priorPapers,
    };
  },
});

export const countSourcesInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const sources = await ctx.db
      .query("researchSources")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    return sources.length;
  },
});
