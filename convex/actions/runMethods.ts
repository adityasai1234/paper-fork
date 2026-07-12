"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, workerReportPayload } from "../lib/agent-hierarchy";
import {
  extractStructured,
  isLlmAvailable,
  llmTurnPayload,
} from "../lib/ai-gateway";
import {
  AUDIT_DIMENSIONS,
  emptyEvalProtocol,
  methodsOutputSchema,
  type MethodsOutput,
  type SectionClaim,
} from "../lib/audit-registry";
import { fetchPaperSections, sectionsForExtraction } from "../lib/paper-fetch";
import type { LiteraturePayload } from "../lib/fork-rules";

function extractClaimsFromText(section: string, text: string): SectionClaim[] {
  const claims: SectionClaim[] = [];
  const sentences = text.split(/\.\s+/).filter((s) => s.length > 20);
  let idx = 0;
  for (const s of sentences) {
    if (!/fold|seed|f1|metric|baseline|split|checkpoint|hardware|eval|test set|validation/i.test(s)) {
      continue;
    }
    let dimension: (typeof AUDIT_DIMENSIONS)[number] = "eval_protocol";
    if (/fold|split|holdout|cross.?val/i.test(s)) dimension = "splits";
    else if (/seed|random/i.test(s)) dimension = "seeds";
    else if (/f1|auroc|accuracy|metric/i.test(s)) dimension = "metrics";
    else if (/baseline|sota|compare/i.test(s)) dimension = "baselines";
    else if (/gpu|cuda|batch|hardware/i.test(s)) dimension = "hardware";
    else if (/checkpoint|epoch|best model/i.test(s)) dimension = "checkpoints";
    else if (/leak|test set tuning/i.test(s)) dimension = "data_leakage";

    claims.push({
      id: `${section}:${idx++}`,
      section,
      text: s.trim(),
      dimension,
      quote: s.trim().slice(0, 200),
      confidence: "medium",
    });
  }
  return claims;
}

function mergeMethodsOutputs(partials: MethodsOutput[]): MethodsOutput {
  const sectionClaims = partials.flatMap((p) => p.sectionClaims);
  const metrics = [...new Set(partials.flatMap((p) => p.evalProtocol.metrics))];
  const baselines = [...new Set(partials.flatMap((p) => p.evalProtocol.baselines))];
  const datasets = [...new Set(partials.flatMap((p) => p.evalProtocol.datasets))];

  const splits = partials.map((p) => p.evalProtocol.splits).find((s) => s) ?? null;
  const seeds = partials.map((p) => p.evalProtocol.seeds).find((s) => s) ?? null;
  const hardware = partials.map((p) => p.evalProtocol.hardware).find((s) => s) ?? null;
  const checkpointPolicy =
    partials.map((p) => p.evalProtocol.checkpointPolicy).find((s) => s) ?? null;
  const summary =
    partials.map((p) => p.evalProtocol.summary).find((s) => s.length > 20) ??
    "Evaluation protocol extracted from paper sections (regex fallback).";

  return {
    evalProtocol: {
      splits,
      seeds,
      metrics,
      baselines,
      datasets,
      hardware,
      checkpointPolicy,
      summary,
    },
    sectionClaims,
  };
}

function regexMethodsOutput(sections: Array<{ name: string; text: string }>): MethodsOutput {
  const sectionClaims = sections.flatMap((s) => extractClaimsFromText(s.name, s.text));
  const splitsClaim = sectionClaims.find((c) => c.dimension === "splits");
  const seedsClaim = sectionClaims.find((c) => c.dimension === "seeds");
  const metrics = sectionClaims.filter((c) => c.dimension === "metrics").map((c) => c.text);
  const baselines = sectionClaims.filter((c) => c.dimension === "baselines").map((c) => c.text);

  return {
    evalProtocol: {
      splits: splitsClaim?.text ?? null,
      seeds: seedsClaim?.text ?? null,
      metrics,
      baselines,
      datasets: [],
      hardware: sectionClaims.find((c) => c.dimension === "hardware")?.text ?? null,
      checkpointPolicy:
        sectionClaims.find((c) => c.dimension === "checkpoints")?.text ?? null,
      summary: buildEvalSummary(sectionClaims),
    },
    sectionClaims,
  };
}

function buildEvalSummary(claims: SectionClaim[]): string {
  if (claims.length === 0) {
    return "No detailed evaluation protocol found in paper sections.";
  }
  const parts = claims.slice(0, 4).map((c) => `${c.section}: ${c.text}`);
  return `How this paper evaluates: ${parts.join("; ")}`;
}

export const run = internalAction({
  args: { auditId: v.id("audits"), arxivId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.methods,
      event: "start",
      payload: { arxivId: args.arxivId, reportsTo: AGENTS.ruler },
    });
    await ctx.runMutation(internal.audits.patchChip, {
      auditId: args.auditId,
      agent: "methods",
      status: "running",
    });

    try {
      const litRow = await ctx.runQuery(internal.actions.helpers.getAgentOutput, {
        auditId: args.auditId,
        agent: "literature",
      });
      const lit = litRow?.payload as LiteraturePayload | undefined;
      const abstract = lit?.paper.abstract;

      const sections = await fetchPaperSections(args.arxivId, abstract);
      const toExtract = sectionsForExtraction(sections);

      let output: MethodsOutput;

      if (isLlmAvailable() && toExtract.length > 0) {
        const partials: MethodsOutput[] = [];
        for (const { name, text } of toExtract) {
          const result = await extractStructured({
            schema: methodsOutputSchema,
            name: "MethodsExtraction",
            description: "Extract evaluation protocol and section claims from a paper section",
            system:
              "Extract structured evaluation protocol and falsifiable claims from academic paper text. " +
              "Use null for missing fields. Do not invent data.",
            prompt: `Paper section: ${name}\n\n---\n${text.slice(0, 48_000)}\n---`,
            auditId: args.auditId,
            worker: AGENTS.workers.methods,
            tags: [`section:${name}`],
          });

          await ctx.runMutation(internal.audits.logSessionEvent, {
            auditId: args.auditId,
            agent: AGENTS.workers.methods,
            event: "llm_turn",
            payload: llmTurnPayload(result.model, result.usage, AGENTS.workers.methods, [
              `section:${name}`,
            ]),
          });

          partials.push(result.output);
        }
        output = mergeMethodsOutputs(partials);
      } else if (toExtract.length > 0) {
        output = regexMethodsOutput(toExtract);
      } else {
        output = {
          evalProtocol: emptyEvalProtocol(
            "Section text unavailable; evaluation protocol not extracted from full paper."
          ),
          sectionClaims: [],
        };
      }

      await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "methods",
        payload: output,
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "methods",
        status: "done",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.methods,
        event: "worker_report",
        payload: workerReportPayload(
          AGENTS.workers.methods,
          `Eval protocol: ${output.sectionClaims.length} section claims; ${output.evalProtocol.metrics.length} metrics`,
          { claimCount: output.sectionClaims.length }
        ),
      });
      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    } catch (e) {
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "methods",
        status: "error",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.methods,
        event: "error",
        payload: { message: String(e) },
      });
      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    }
  },
});
