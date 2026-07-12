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
  chunkText,
  emptyEvalProtocol,
  methodsOutputSchema,
  type MethodsOutput,
  regexMethodsFromSections,
} from "../lib/audit-registry";
import { fetchPaperSections, sectionsForExtraction } from "../lib/paper-fetch";
import type { LiteraturePayload } from "../lib/fork-rules";

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
    "Evaluation protocol extracted from paper sections.";

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

export const run = internalAction({
  args: { auditId: v.id("audits"), arxivId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.methods,
      event: "start",
      payload: { arxivId: args.arxivId || null, reportsTo: AGENTS.ruler },
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
      const resolvedArxivId = args.arxivId || lit?.paper.arxivId;

      const { sections, meta } = await fetchPaperSections(resolvedArxivId, abstract);
      const toExtract = sectionsForExtraction(sections);

      let output: MethodsOutput;

      if (isLlmAvailable() && toExtract.length > 0) {
        const partials: MethodsOutput[] = [];
        for (const { name, text } of toExtract) {
          const chunks = chunkText(text, 48_000);
          for (let ci = 0; ci < chunks.length; ci++) {
            const chunkLabel = chunks.length > 1 ? `${name} (part ${ci + 1}/${chunks.length})` : name;
            const result = await extractStructured({
              schema: methodsOutputSchema,
              name: "MethodsExtraction",
              description: "Extract evaluation protocol and section claims from a paper section",
              system:
                "Extract structured evaluation protocol and falsifiable claims from academic paper text. " +
                "Use null for missing fields. Do not invent data.",
              prompt: `Paper section: ${chunkLabel}\n\n---\n${chunks[ci]}\n---`,
              auditId: args.auditId,
              worker: AGENTS.workers.methods,
              tags: [`section:${name}`, ...(chunks.length > 1 ? [`chunk:${ci + 1}`] : [])],
            });

            await ctx.runMutation(internal.audits.logSessionEvent, {
              auditId: args.auditId,
              agent: AGENTS.workers.methods,
              event: "llm_turn",
              payload: llmTurnPayload(
                result.model,
                result.usage,
                AGENTS.workers.methods,
                [`section:${name}`],
                { primaryModel: result.primaryModel, usedFallback: result.usedFallback }
              ),
            });

            partials.push(result.output);
          }
        }
        output = mergeMethodsOutputs(partials);
      } else if (toExtract.length > 0) {
        output = regexMethodsFromSections(toExtract);
      } else {
        const reason =
          meta.htmlStatus === "skipped"
            ? "No arXiv id for HTML fetch"
            : typeof meta.htmlStatus === "number" && meta.htmlStatus !== 200
              ? `arXiv HTML returned ${meta.htmlStatus}`
              : meta.parseMode === "none"
                ? "HTML fetched but no sections parsed"
                : "Section text unavailable";
        output = {
          evalProtocol: emptyEvalProtocol(`${reason}; evaluation protocol not extracted from full paper.`),
          sectionClaims: [],
        };
      }

      await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "methods",
        payload: { ...output, textTrackMeta: meta },
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "methods",
        status: "done",
      });

      const htmlNote =
        meta.source === "html"
          ? `; HTML ${meta.parseMode} (${meta.sectionsFound.join(", ")})`
          : `; HTML ${meta.htmlStatus} (abstract only)`;

      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.methods,
        event: "worker_report",
        payload: workerReportPayload(
          AGENTS.workers.methods,
          `Eval protocol: ${output.sectionClaims.length} section claims; ${output.evalProtocol.metrics.length} metrics${htmlNote}`,
          { claimCount: output.sectionClaims.length, textTrackMeta: meta }
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
