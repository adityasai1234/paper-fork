"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  extractStructured,
  isStructuredLlmAvailable,
  llmTurnPayload,
} from "../lib/ai_gateway";
import { sourcesBasedSynthesis } from "../lib/research_helpers";
import { MAX_ROUNDS } from "./runResearchDiscover";

const synthesisSchema = z.object({
  synthesis: z.string(),
  claimsWithEvidence: z.number(),
  priorPapers: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      citationKey: z.string(),
      relevance: z.string(),
    })
  ),
});

const evaluationSchema = z.object({
  shouldContinue: z.boolean(),
  gaps: z.array(z.string()),
  reasoning: z.string(),
});


export const run = internalAction({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
    linkupGaps: v.array(v.string()),
    themes: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
    const run = await ctx.runQuery(internal.lib.research_query.getRunInternal, {
      runId: args.runId,
    });
    if (!run || run.isBaseline) return null;

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.runId,
      step: "synthesize",
      loopRound: args.round,
    });

    const sources = await ctx.runQuery(internal.lib.research_query.listSourcesInternal, {
      runId: args.runId,
    });

    const sourceBlock = sources
      .map(
        (s) => `- [${s.citationKey}] ${s.title} (${s.url})\n  ${s.quote ?? s.usedFor}`
      )
      .join("\n");

    let output = sourcesBasedSynthesis(
      run.prompt,
      sources.map((s) => ({
        title: s.title,
        url: s.url,
        citationKey: s.citationKey,
        quote: s.quote,
        usedFor: s.usedFor,
      }))
    );

    if (isStructuredLlmAvailable()) {
      try {
        const result = await extractStructured({
          name: "ResearchSynthesis",
          description: "Synthesis with retrieved literature context",
          schema: synthesisSchema,
          system:
            "Synthesize the research prompt using ONLY the provided sources. Count claims that cite a specific source URL. Include priorPapers from sources with high relevance.",
          prompt: `Prompt:\n${run.prompt}\n\nThemes: ${args.themes.join(", ") || "none"}\n\nSources:\n${sourceBlock || "none"}`,
          worker: "research:synthesize",
          tags: ["feature:research", `round:${args.round}`],
        });
        output = result.output;
        await ctx.runMutation(internal.research.logResearchSession, {
          runId: args.runId,
          agent: "research:synthesize",
          event: "llm_turn",
          payload: llmTurnPayload(result.model, result.usage, "research:synthesize", [
            "feature:research",
          ]),
        });
      } catch (e) {
        await ctx.runMutation(internal.research.logResearchSession, {
          runId: args.runId,
          agent: "research:synthesize",
          event: "error",
          payload: { message: String(e) },
        });
      }
    }

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:synthesize",
      event: "synthesize",
      payload: {
        round: args.round,
        claimsWithEvidence: output.claimsWithEvidence,
        synthesisPreview: output.synthesis.slice(0, 200),
      },
    });

    if (run.executionConfig) {
      const prepared = await ctx.runMutation(
        internal.researchWorker.prepareExperimentRound,
        {
          runId: args.runId,
          round: args.round,
        }
      );
      if (prepared.candidateQueued) {
        return null;
      }

      if (args.round + 1 < run.executionConfig.maxExperiments) {
        await ctx.scheduler.runAfter(0, internal.actions.runResearchDiscover.runDiscover, {
          runId: args.runId,
          round: args.round + 1,
          gapFocus: [
            ...args.linkupGaps,
            "No source-grounded train.py candidate survived validation. Search for a smaller, directly evidenced change.",
          ],
        });
        return null;
      }

      await ctx.scheduler.runAfter(
        0,
        internal.actions.runResearchPipeline.runFinalizeFromExperiments,
        { runId: args.runId }
      );
      return null;
    }

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.runId,
      step: "evaluate",
    });

    let shouldContinue = false;
    let gaps = args.linkupGaps;
    let evalReason = "Max rounds or sufficient coverage";

    if (isStructuredLlmAvailable() && args.round < MAX_ROUNDS) {
      try {
        const evalResult = await extractStructured({
          name: "ResearchEvaluation",
          description: "Decide whether another discovery round is needed",
          schema: evaluationSchema,
          system:
            "Evaluate research coverage. shouldContinue=true only if major gaps remain and round < 3.",
          prompt: `Prompt: ${run.prompt}\nRound: ${args.round}\nSources: ${sources.length}\nGaps: ${gaps.join("; ") || "none"}\nSynthesis preview: ${output.synthesis.slice(0, 300)}`,
          worker: "research:evaluate",
          tags: ["feature:research"],
        });
        shouldContinue = evalResult.output.shouldContinue && args.round < MAX_ROUNDS - 1;
        gaps = evalResult.output.gaps;
        evalReason = evalResult.output.reasoning;
      } catch {
        shouldContinue = gaps.length > 0 && args.round < 2;
      }
    } else if (gaps.length > 0 && args.round < MAX_ROUNDS - 1) {
      shouldContinue = true;
      evalReason = `Gaps remain: ${gaps.slice(0, 3).join("; ")}`;
    }

    if (args.round >= MAX_ROUNDS - 1) {
      shouldContinue = false;
      evalReason = "Max rounds reached";
    }

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:evaluate",
      event: "evaluate",
      payload: { round: args.round, shouldContinue, gaps, reasoning: evalReason },
    });

    if (shouldContinue) {
      const nextRound = args.round + 1;
      await ctx.scheduler.runAfter(0, internal.actions.runResearchDiscover.runDiscover, {
        runId: args.runId,
        round: nextRound,
        gapFocus: gaps,
      });
      return null;
    }

    await ctx.scheduler.runAfter(0, internal.actions.runResearchPipeline.runFinalize, {
      runId: args.runId,
      round: args.round,
      synthesis: output.synthesis,
      priorPapers: output.priorPapers,
      claimsWithEvidence: output.claimsWithEvidence,
      gapCount: gaps.length,
    });

    return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.research.logResearchSession, {
        runId: args.runId,
        agent: "research:synthesize",
        event: "error",
        payload: { message, round: args.round },
      });
      await ctx.runMutation(internal.research.patchResearchRun, {
        runId: args.runId,
        status: "failed",
        error: message,
      });
      return null;
    }
  },
});
