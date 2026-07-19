import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function newSessionId(): string {
  return crypto.randomUUID();
}

export function citationKeyFromTitle(title: string, year?: number): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  const y = year ?? new Date().getFullYear();
  return `${words.join("")}${y}`.slice(0, 32) || `source${y}`;
}

export async function getResearchOrNull(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">
): Promise<Doc<"researchRuns"> | null> {
  return await ctx.db.get("researchRuns", runId);
}

export async function requireResearch(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">
): Promise<Doc<"researchRuns">> {
  const run = await getResearchOrNull(ctx, runId);
  if (!run) throw new Error("Research run not found");
  return run;
}

export type LinkupResearchOutput = {
  prior_papers: Array<{
    title: string;
    url: string;
    authors?: string[];
    year?: number;
    relevance: string;
    evidence_quote: string;
  }>;
  themes: string[];
  sources: Array<{
    url: string;
    title: string;
    source_type: string;
    used_for: string;
    quote?: string;
  }>;
  research_gaps: string[];
  experiment_candidates: Array<{
    title: string;
    hypothesis: string;
    proposed_change: string;
    expected_effect: string;
    evidence_urls: string[];
    risks: string[];
    rank: number;
  }>;
};

export const EMPTY_LINKUP_RESEARCH: LinkupResearchOutput = {
  prior_papers: [],
  themes: [],
  sources: [],
  research_gaps: ["Linkup API key not configured"],
  experiment_candidates: [],
};

export function linkupOutputFromSearchHits(
  prompt: string,
  hits: Array<{
    title: string;
    url: string;
    abstract?: string;
    year?: number;
    provider: string;
  }>
): LinkupResearchOutput {
  if (hits.length === 0) {
    return {
      prior_papers: [],
      themes: [],
      sources: [],
      research_gaps: ["No papers found for this query"],
      experiment_candidates: [],
    };
  }

  const prior_papers = hits.map((hit) => ({
    title: hit.title,
    url: hit.url,
    year: hit.year,
    relevance: "high",
    evidence_quote: (hit.abstract ?? "").slice(0, 280) || `Indexed via ${hit.provider}`,
  }));

  return {
    prior_papers,
    themes: prompt
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
      .slice(0, 5),
    sources: hits.map((hit) => ({
      url: hit.url,
      title: hit.title,
      source_type: hit.provider,
      used_for: "literature discovery",
      quote: hit.abstract?.slice(0, 200),
    })),
    research_gaps:
      hits.length < 3
        ? ["Limited search results — consider refining the research prompt"]
        : [],
    experiment_candidates: [],
  };
}

export function sourcesBasedSynthesis(
  prompt: string,
  sources: Array<{ title: string; url: string; citationKey: string; quote?: string; usedFor: string }>
) {
  if (sources.length === 0) {
    return {
      synthesis: `No literature sources were retrieved for this research goal:\n\n${prompt}\n\nConfigure LINKUP_API_KEY on Convex — arXiv fallback runs when Linkup returns empty.`,
      claimsWithEvidence: 0,
      priorPapers: [] as Array<{
        title: string;
        url: string;
        citationKey: string;
        relevance: string;
      }>,
    };
  }

  const priorPapers = sources.slice(0, 8).map((s) => ({
    title: s.title,
    url: s.url,
    citationKey: s.citationKey,
    relevance: "high",
  }));

  const bullets = sources
    .slice(0, 6)
    .map((s) => {
      const excerpt = s.quote?.trim() || s.usedFor;
      return `- [${s.citationKey}] ${s.title}: ${excerpt.slice(0, 160)} (${s.url})`;
    })
    .join("\n");

  return {
    synthesis: `Research goal:\n${prompt}\n\nRetrieved ${sources.length} source(s) from literature search:\n\n${bullets}\n\nThese papers are the strongest evidence-backed prior art found for the submitted research goal.`,
    claimsWithEvidence: Math.min(sources.length, 6),
    priorPapers,
  };
}

export function buildLinkupResearchQuery(
  prompt: string,
  gapFocus?: string[],
  execution?: {
    repositoryUrl: string;
    baseBranch: string;
    targetFile: "train.py";
    metricName: string;
    metricDirection: "minimize" | "maximize";
  }
): string {
  const gapSection =
    gapFocus && gapFocus.length > 0
      ? `\n## Experiment feedback (round follow-up)\nUse these measured results to change the next search:\n${gapFocus.map((g) => `- ${g}`).join("\n")}\n`
      : "";

  const experimentSection = execution
    ? `
## Executable experiment contract
Repository: ${execution.repositoryUrl}
Base branch or revision: ${execution.baseBranch}
Editable file: ${execution.targetFile} (no other file may be changed)
Objective: ${execution.metricDirection} ${execution.metricName}

Propose up to 3 small, independently testable experiment_candidates. Every candidate must name an exact ${execution.targetFile} change, cite evidence_urls present in the returned sources, state the expected metric effect and risks, and use rank 1 for the strongest candidate. Do not propose infrastructure, dataset, evaluation, or multi-file changes.
`
    : "";

  return `You are the web-search lead for Paperfork auto-research.

Research prompt: ${prompt}
${gapSection}
${experimentSection}

Find prior art papers and authoritative sources this research can build on. Perform multiple targeted searches on arXiv, Papers With Code, and Hugging Face. Return structured JSON with prior_papers, themes, sources, research_gaps, and experiment_candidates. Never invent evidence URLs.`;
}

export const LINKUP_RESEARCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    prior_papers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          authors: { type: "array", items: { type: "string" } },
          year: { type: "number" },
          relevance: { type: "string" },
          evidence_quote: { type: "string" },
        },
        required: ["title", "url", "relevance", "evidence_quote"],
      },
    },
    themes: { type: "array", items: { type: "string" } },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          url: { type: "string" },
          title: { type: "string" },
          source_type: { type: "string" },
          used_for: { type: "string" },
          quote: { type: "string" },
        },
        required: ["url", "title", "source_type", "used_for"],
      },
    },
    research_gaps: { type: "array", items: { type: "string" } },
    experiment_candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          hypothesis: { type: "string" },
          proposed_change: { type: "string" },
          expected_effect: { type: "string" },
          evidence_urls: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          rank: { type: "number" },
        },
        required: [
          "title",
          "hypothesis",
          "proposed_change",
          "expected_effect",
          "evidence_urls",
          "risks",
          "rank",
        ],
      },
    },
  },
  required: [
    "prior_papers",
    "themes",
    "sources",
    "research_gaps",
    "experiment_candidates",
  ],
} as const;
