"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  buildLinkupResearchQuery,
  citationKeyFromTitle,
  EMPTY_LINKUP_RESEARCH,
  LINKUP_RESEARCH_SCHEMA,
  type LinkupResearchOutput,
} from "../lib/research_helpers";

const MAX_ROUNDS = 3;

async function fetchLinkupResearch(
  prompt: string,
  gapFocus?: string[]
): Promise<LinkupResearchOutput> {
  const linkupKey = process.env.LINKUP_API_KEY;
  if (!linkupKey) return EMPTY_LINKUP_RESEARCH;

  const q = buildLinkupResearchQuery(prompt, gapFocus);
  const res = await fetch("https://api.linkup.so/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${linkupKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q,
      depth: "deep",
      outputType: "structured",
      structuredOutputSchema: LINKUP_RESEARCH_SCHEMA,
    }),
  });

  if (!res.ok) {
    return { ...EMPTY_LINKUP_RESEARCH, research_gaps: [`Linkup error: ${res.status}`] };
  }

  const data = (await res.json()) as { structuredOutput?: LinkupResearchOutput };
  const structured = data.structuredOutput ?? (data as unknown as LinkupResearchOutput);
  return {
    prior_papers: structured.prior_papers ?? [],
    themes: structured.themes ?? [],
    sources: structured.sources ?? [],
    research_gaps: structured.research_gaps ?? [],
  };
}

function sourcesFromLinkup(output: LinkupResearchOutput, round: number) {
  const seen = new Set<string>();
  const rows: Array<{
    url: string;
    title: string;
    authors?: string[];
    year?: number;
    quote?: string;
    citationKey: string;
    usedFor: string;
  }> = [];

  for (const paper of output.prior_papers) {
    if (seen.has(paper.url)) continue;
    seen.add(paper.url);
    rows.push({
      url: paper.url,
      title: paper.title,
      authors: paper.authors,
      year: paper.year,
      quote: paper.evidence_quote,
      citationKey: citationKeyFromTitle(paper.title, paper.year),
      usedFor: `prior art (${paper.relevance})`,
    });
  }

  for (const src of output.sources) {
    if (seen.has(src.url)) continue;
    seen.add(src.url);
    rows.push({
      url: src.url,
      title: src.title,
      quote: src.quote,
      citationKey: citationKeyFromTitle(src.title),
      usedFor: src.used_for || src.source_type,
    });
  }

  return { rows, round };
}

export const runDiscover = internalAction({
  args: {
    runId: v.id("researchRuns"),
    round: v.number(),
    gapFocus: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.runQuery(internal.lib.research_query.getRunInternal, {
      runId: args.runId,
    });
    if (!run || run.isBaseline) return null;

    await ctx.runMutation(internal.research.patchResearchRun, {
      runId: args.runId,
      status: "running",
      step: "discover",
      loopRound: args.round,
    });

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:discover",
      event: "discover",
      payload: {
        round: args.round,
        query: buildLinkupResearchQuery(run.prompt, args.gapFocus),
      },
    });

    const output = await fetchLinkupResearch(run.prompt, args.gapFocus);

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:discover",
      event: "tool_call",
      payload: {
        round: args.round,
        priorPaperCount: output.prior_papers.length,
        sourceCount: output.sources.length,
        gaps: output.research_gaps,
      },
    });

    const { rows } = sourcesFromLinkup(output, args.round);
    if (rows.length > 0) {
      await ctx.runMutation(internal.research.insertResearchSources, {
        runId: args.runId,
        round: args.round,
        sources: rows,
      });
    }

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:discover",
      event: "cite",
      payload: {
        round: args.round,
        inserted: rows.length,
        message: `Indexed ${rows.length} sources with citation keys`,
      },
    });

    await ctx.scheduler.runAfter(0, internal.actions.runResearchSynthesize.run, {
      runId: args.runId,
      round: args.round,
      linkupGaps: output.research_gaps,
      themes: output.themes,
    });

    return null;
  },
});

export { MAX_ROUNDS };
