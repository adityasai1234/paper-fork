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
  extractRegexClaims,
  methodsOutputSchema,
  shouldFetchFullText,
} from "../lib/audit-registry";

const ARXIV_BASE = process.env.ARXIV_API_BASE ?? "https://export.arxiv.org/api/query";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.actions.helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.literature,
      event: "start",
      payload: { paperId: audit.paperId, reportsTo: AGENTS.ruler },
    });
    await ctx.runMutation(internal.audits.patchChip, {
      auditId: args.auditId,
      agent: "literature",
      status: "running",
    });

    try {
      const arxivId = audit.paperId.replace(/^arxiv:/i, "");
      const arxivRes = await fetch(`${ARXIV_BASE}?id_list=${arxivId}`);
      const arxivXml = await arxivRes.text();
      const titleMatch = arxivXml.match(/<title>([^<]+)<\/title>/);
      const abstractMatch = arxivXml.match(/<summary>([^<]+)<\/summary>/);
      const title = titleMatch?.[1]?.trim() ?? audit.paperId;
      const abstract = abstractMatch?.[1]?.trim();

      const s2Headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
        s2Headers["x-api-key"] = process.env.SEMANTIC_SCHOLAR_API_KEY;
      }

      let s2Id: string | undefined;
      let year: number | undefined;
      const s2PaperRes = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/arXiv:${arxivId}?fields=title,abstract,year,citationCount,paperId`,
        { headers: s2Headers }
      );
      if (s2PaperRes.ok) {
        const s2Paper = await s2PaperRes.json();
        s2Id = s2Paper.paperId;
        year = s2Paper.year;
      }

      const neighbors: Array<Record<string, unknown>> = [];
      if (s2Id) {
        const recRes = await fetch(
          `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${s2Id}?fields=title,year,citationCount,paperId,abstract&limit=10`,
          { headers: s2Headers }
        );
        if (recRes.ok) {
          const recData = await recRes.json();
          for (const n of recData.recommendedPapers ?? []) {
            neighbors.push({
              s2Id: n.paperId,
              title: n.title,
              year: n.year,
              abstract: n.abstract,
              citationCount: n.citationCount,
            });
          }
        }
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

      if (isLlmAvailable() && abstract) {
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
            payload: llmTurnPayload(result.model, result.usage, AGENTS.workers.literature, [
              "section:abstract",
            ]),
          });

          section_claims = result.output.sectionClaims;
          if (section_claims.length > 0) {
            abstract_claims = section_claims.map((c) => c.text);
          }
        } catch {
          // ponytail: regex fallback below
        }
      }

      const method_keywords = [
        ...abstract_claims.join(" ").matchAll(/\b(\d+-fold|BERT|F1|ImageNet|macro|seed)\b/gi),
      ].map((m) => m[1]);

      const needsMethods = shouldFetchFullText(abstract_claims, abstract);

      const payload = {
        paper: { s2Id, arxivId, title, abstract, year },
        abstract_claims,
        neighbors,
        method_keywords: [...new Set(method_keywords)],
        methodsScheduled: needsMethods,
        section_claims: section_claims.length > 0 ? section_claims : undefined,
      };

      await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "literature",
        payload,
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "literature",
        status: "done",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.workers.literature,
        event: "worker_report",
        payload: workerReportPayload(
          AGENTS.workers.literature,
          `Paper resolved; ${neighbors.length} neighbors; ${abstract_claims.length} claims${needsMethods ? "; methods scheduled" : ""}`,
          { neighborCount: neighbors.length, methodsScheduled: needsMethods }
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
          arxivId,
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
        agent: "literature",
        event: "error",
        payload: { message: String(e) },
      });
    }
  },
});
