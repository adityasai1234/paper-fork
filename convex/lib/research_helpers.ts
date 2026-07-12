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

export async function getResearchForSessionOrNull(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">,
  sessionId?: string
): Promise<Doc<"researchRuns"> | null> {
  const run = await ctx.db.get("researchRuns", runId);
  if (!run) return null;
  if (sessionId && run.sessionId === sessionId) return run;
  return null;
}

export async function requireResearchSession(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">,
  sessionId?: string
): Promise<Doc<"researchRuns">> {
  const run = await getResearchForSessionOrNull(ctx, runId, sessionId);
  if (!run) throw new Error("Unauthorized");
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
};

export const EMPTY_LINKUP_RESEARCH: LinkupResearchOutput = {
  prior_papers: [],
  themes: [],
  sources: [],
  research_gaps: ["Linkup API key not configured"],
};

export function buildLinkupResearchQuery(prompt: string, gapFocus?: string[]): string {
  const gapSection =
    gapFocus && gapFocus.length > 0
      ? `\n## Gap focus (round follow-up)\nPrioritize filling these gaps:\n${gapFocus.map((g) => `- ${g}`).join("\n")}\n`
      : "";

  return `You are the literature discovery agent for Paperfork auto-research.

Research prompt: ${prompt}
${gapSection}

Find prior art papers and authoritative sources this research can build on. Perform multiple targeted searches on arXiv, Semantic Scholar, Papers With Code, and Hugging Face. Return structured JSON with prior_papers (title, url, authors, year, relevance, evidence_quote), themes, sources, and research_gaps.`;
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
  },
  required: ["prior_papers", "themes", "sources", "research_gaps"],
} as const;
