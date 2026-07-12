"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { extractStructured, isLlmAvailable, llmTurnPayload } from "../lib/ai_gateway";

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

function mockBaselineSynthesis(prompt: string) {
  return {
    synthesis: `Baseline (prompt-only, mock): A brief overview of "${prompt.slice(0, 80)}..." without external literature retrieval.`,
    claimsWithEvidence: 0,
    priorPapers: [] as Array<{
      title: string;
      url: string;
      citationKey: string;
      relevance: string;
    }>,
  };
}

export const run = internalAction({
  args: { baselineRunId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.runQuery(internal.lib.research_query.getRunInternal, {
      runId: args.baselineRunId,
    });
    if (!run) return null;

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.baselineRunId,
      status: "running",
    });

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.baselineRunId,
      agent: "research:baseline",
      event: "start",
      payload: { mode: "prompt-only" },
    });

    let output = mockBaselineSynthesis(run.prompt);

    if (isLlmAvailable()) {
      try {
        const result = await extractStructured({
          name: "BaselineSynthesis",
          description: "Prompt-only research synthesis without external sources",
          schema: synthesisSchema,
          system:
            "You synthesize a research overview from the user prompt alone. Do not invent specific paper URLs. claimsWithEvidence should be 0.",
          prompt: `Research prompt:\n${run.prompt}\n\nWrite a concise synthesis. priorPapers must be empty.`,
          worker: "research:baseline",
          tags: ["feature:research", "mode:baseline"],
        });
        output = result.output;
        await ctx.runMutation(internal.research.logResearchSession, {
          runId: args.baselineRunId,
          agent: "research:baseline",
          event: "llm_turn",
          payload: llmTurnPayload(result.model, result.usage, "research:baseline", [
            "feature:research",
          ]),
        });
      } catch (e) {
        await ctx.runMutation(internal.research.logResearchSession, {
          runId: args.baselineRunId,
          agent: "research:baseline",
          event: "error",
          payload: { message: String(e) },
        });
      }
    }

    await ctx.runMutation(internal.research.insertResearchReport, {
      runId: args.baselineRunId,
      priorPapers: output.priorPapers,
      synthesis: output.synthesis,
      loopMetrics: {
        rounds: 1,
        sourceCount: 0,
        gapCount: 0,
        claimsWithEvidence: output.claimsWithEvidence,
      },
    });

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.baselineRunId,
      status: "done",
    });

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.baselineRunId,
      agent: "research:baseline",
      event: "done",
      payload: { claimsWithEvidence: output.claimsWithEvidence },
    });

    return null;
  },
});
