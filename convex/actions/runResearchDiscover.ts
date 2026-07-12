"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { searchArxivPapers } from "../lib/arxiv_fetch";
import {
  buildLinkupResearchQuery,
  citationKeyFromTitle,
  EMPTY_LINKUP_RESEARCH,
  LINKUP_RESEARCH_SCHEMA,
  linkupOutputFromSearchHits,
  type LinkupResearchOutput,
} from "../lib/research_helpers";

const MAX_ROUNDS = 3;

async function fetchLinkupResearch(
  prompt: string,
  gapFocus?: string[]
): Promise<{ output: LinkupResearchOutput; provider: string }> {
  const linkupKey = process.env.LINKUP_API_KEY;
  if (!linkupKey) {
    return { output: EMPTY_LINKUP_RESEARCH, provider: "none" };
  }

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
    return {
      output: { ...EMPTY_LINKUP_RESEARCH, research_gaps: [`Linkup error: ${res.status}`] },
      provider: "linkup-error",
    };
  }

  const data = (await res.json()) as { structuredOutput?: LinkupResearchOutput };
  const structured = data.structuredOutput ?? (data as unknown as LinkupResearchOutput);
  const output: LinkupResearchOutput = {
    prior_papers: structured.prior_papers ?? [],
    themes: structured.themes ?? [],
    sources: structured.sources ?? [],
    research_gaps: structured.research_gaps ?? [],
  };
  return { output, provider: "linkup" };
}

async function fetchFallbackResearch(
  prompt: string,
  gapFocus?: string[]
): Promise<{ output: LinkupResearchOutput; provider: string; meta: Record<string, unknown> }> {
  const query = [prompt, ...(gapFocus ?? [])].join(" ").trim();
  const arxiv = await searchArxivPapers(query, 8);
  const hits = arxiv.papers.map((paper) => ({
    title: paper.title,
    url: paper.url,
    abstract: paper.abstract,
    year: undefined,
    provider: "arxiv",
  }));

  return {
    output: linkupOutputFromSearchHits(prompt, hits),
    provider: hits.length > 0 ? "arxiv" : "none",
    meta: {
      arxivOk: arxiv.ok,
      arxivCount: arxiv.papers.length,
      arxivError: arxiv.error,
    },
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

    const query = buildLinkupResearchQuery(run.prompt, args.gapFocus);
    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:discover",
      event: "discover",
      payload: { round: args.round, query },
    });

    let provider = "linkup";
    let discoverMeta: Record<string, unknown> = {};
    const linkup = await fetchLinkupResearch(run.prompt, args.gapFocus);
    let output = linkup.output;
    provider = linkup.provider;

    const linkupCount = output.prior_papers.length + output.sources.length;
    if (linkupCount === 0) {
      const fallback = await fetchFallbackResearch(run.prompt, args.gapFocus);
      output = fallback.output;
      provider = fallback.provider;
      discoverMeta = fallback.meta;
    }

    await ctx.runMutation(internal.research.logResearchSession, {
      runId: args.runId,
      agent: "research:discover",
      event: "tool_call",
      payload: {
        round: args.round,
        provider,
        priorPaperCount: output.prior_papers.length,
        sourceCount: output.sources.length,
        gaps: output.research_gaps,
        ...discoverMeta,
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
        provider,
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
