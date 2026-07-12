"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { fetchArxivMetadata, normalizeArxivId } from "../lib/arxiv_fetch";
import { AGENTS, workerReportPayload } from "../lib/agent_hierarchy";
import {
  extractStructured,
  isLlmAvailable,
  llmTurnPayload,
} from "../lib/ai_gateway";
import {
  extractRegexClaims,
  methodsOutputSchema,
  shouldFetchFullText,
} from "../lib/audit_registry";
import {
  arxivIdFromS2,
  fetchS2Neighbors,
  fetchS2Paper,
  type S2Neighbor,
} from "../lib/s2_fetch";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.lib.audit_helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.literature,
      event: "start",
      payload: { paperId: audit.paperId, paperIdType: audit.paperIdType, reportsTo: AGENTS.ruler },
    });
    await ctx.runMutation(internal.audits.patchChip, {
      auditId: args.auditId,
      agent: "literature",
      status: "running",
    });

    const textTrackMeta: Record<string, unknown> = {
      paperIdType: audit.paperIdType,
    };

    try {
      let title = audit.paperId;
      let abstract: string | undefined;
      let arxivId: string | undefined;
      let s2Id: string | undefined;
      let year: number | undefined;

      const s2Result = await fetchS2Paper(audit.paperId, audit.paperIdType);
      textTrackMeta.s2 = {
        ok: s2Result.ok,
        httpStatus: s2Result.httpStatus,
        error: s2Result.error,
        rateLimited: s2Result.rateLimited,
      };

      if (s2Result.paper) {
        s2Id = s2Result.paper.paperId;
        year = s2Result.paper.year;
        if (s2Result.paper.title) title = s2Result.paper.title;
        if (s2Result.paper.abstract) abstract = s2Result.paper.abstract;
      }

      if (audit.paperIdType === "arxiv") {
        arxivId = normalizeArxivId(audit.paperId);
        const arxivResult = await fetchArxivMetadata(arxivId);
        textTrackMeta.arxiv = {
          ok: arxivResult.ok,
          httpStatus: arxivResult.httpStatus,
          error: arxivResult.error,
        };
        if (arxivResult.ok) {
          if (arxivResult.title) title = arxivResult.title;
          if (arxivResult.abstract) abstract = arxivResult.abstract;
        } else if (!abstract) {
          await ctx.runMutation(internal.audits.logSessionEvent, {
            auditId: args.auditId,
            agent: AGENTS.workers.literature,
            event: "tool_call",
            payload: { tool: "arxiv_fetch", error: arxivResult.error },
          });
        }
      } else if (!arxivId) {
        arxivId = arxivIdFromS2(s2Result.paper);
        textTrackMeta.arxivIdFromS2 = arxivId ?? null;
      }

      let neighbors: S2Neighbor[] = [];
      if (s2Id) {
        const neighborResult = await fetchS2Neighbors(s2Id);
        neighbors = neighborResult.neighbors;
        textTrackMeta.s2Neighbors = {
          ok: neighborResult.ok,
          count: neighbors.length,
          error: neighborResult.error,
          rateLimited: neighborResult.rateLimited,
        };
        if (!neighborResult.ok) {
          await ctx.runMutation(internal.audits.logSessionEvent, {
            auditId: args.auditId,
            agent: AGENTS.workers.literature,
            event: "tool_call",
            payload: { tool: "s2_neighbors", error: neighborResult.error },
          });
        }
      }

      if (!abstract && s2Result.paper?.abstract) {
        abstract = s2Result.paper.abstract;
        textTrackMeta.abstractSource = "s2_fallback";
      }

      let abstract_claims = abstract ? extractRegexClaims(abstract) : [];
      let section_claims: Array<{
        id: string;
        section: string;
        text: string;
        dimension: string;
        quote: string | null;
        confidence: string;
      }> = [];

      const needsMethods = shouldFetchFullText(abstract_claims, abstract);

      // ponytail: abstract LLM only when methods worker won't run (avoids duplicate extraction)
      if (isLlmAvailable() && abstract && !needsMethods) {
        try {
          const result = await extractStructured({
            schema: methodsOutputSchema,
            name: "AbstractExtraction",
            description: "Extract evaluation claims from paper abstract",
            system:
              "Extract falsifiable evaluation claims from the abstract only. Use null for missing fields.",
            prompt: `Abstract:\n\n${abstract}`,
            auditId: args.auditId,
            worker: AGENTS.workers.literature,
            tags: ["section:abstract"],
          });

          await ctx.runMutation(internal.audits.logSessionEvent, {
            auditId: args.auditId,
            agent: AGENTS.workers.literature,
            event: "llm_turn",
            payload: llmTurnPayload(
              result.model,
              result.usage,
              AGENTS.workers.literature,
              ["section:abstract"],
              { primaryModel: result.primaryModel, usedFallback: result.usedFallback, provider: result.provider }
            ),
          });

          section_claims = result.output.sectionClaims;
          if (section_claims.length > 0) {
            abstract_claims = section_claims.map((c) => c.text);
          }
        } catch {
          // regex claims already set
        }
      }

      const method_keywords = [
        ...abstract_claims.join(" ").matchAll(/\b(\d+-fold|BERT|F1|ImageNet|macro|seed)\b/gi),
      ].map((m) => m[1]);

      const payload = {
        paper: { s2Id, arxivId, title, abstract, year },
        abstract_claims,
        neighbors,
        method_keywords: [...new Set(method_keywords)],
        methodsScheduled: needsMethods,
        section_claims: section_claims.length > 0 ? section_claims : undefined,
        textTrackMeta,
      };

      await ctx.runMutation(internal.lib.audit_helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "literature",
        payload,
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "literature",
        status: "done",
      });

      const arxivNote = textTrackMeta.arxiv && !(textTrackMeta.arxiv as { ok: boolean }).ok
        ? "; arXiv fetch failed"
        : "";
      const s2Note = textTrackMeta.s2 && !(textTrackMeta.s2 as { ok: boolean }).ok
        ? "; S2 lookup degraded"
        : "";

      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.literature,
        event: "worker_report",
        payload: workerReportPayload(
          AGENTS.workers.literature,
          `Paper resolved; ${neighbors.length} neighbors; ${abstract_claims.length} claims${needsMethods ? "; methods scheduled" : ""}${arxivNote}${s2Note}`,
          { neighborCount: neighbors.length, methodsScheduled: needsMethods, textTrackMeta }
        ),
      });

      if (needsMethods) {
        await ctx.runMutation(internal.audits.patchChip, {
          auditId: args.auditId,
          agent: "methods",
          status: "running",
        });
        await ctx.scheduler.runAfter(0, internal.actions.runMethods.run, {
          auditId: args.auditId,
          arxivId: arxivId ?? "",
        });
      } else {
        await ctx.runMutation(internal.audits.patchChip, {
          auditId: args.auditId,
          agent: "methods",
          status: "done",
        });
      }

      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    } catch (e) {
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "literature",
        status: "error",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.literature,
        event: "error",
        payload: { message: String(e), textTrackMeta },
      });
    }
  },
});
