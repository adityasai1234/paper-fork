import { citationKeyFromTitle, LINKUP_RESEARCH_SCHEMA, type LinkupResearchOutput } from "./research_helpers";

export type LiteratureNeighbor = {
  s2Id: string;
  title: string;
  year?: number;
  abstract?: string;
  citationCount?: number;
};

export type LinkupLiteratureResult = {
  ok: boolean;
  provider: string;
  paper?: {
    title?: string;
    abstract?: string;
    year?: number;
    url?: string;
  };
  neighbors: LiteratureNeighbor[];
  error?: string;
};

function neighborId(title: string, year?: number, url?: string): string {
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/\./g, "-");
      return `${citationKeyFromTitle(title, year)}-${host}`.slice(0, 48);
    } catch {
      // fall through
    }
  }
  return citationKeyFromTitle(title, year);
}

function neighborsFromOutput(output: LinkupResearchOutput): LiteratureNeighbor[] {
  const seen = new Set<string>();
  const rows: LiteratureNeighbor[] = [];

  for (const paper of output.prior_papers) {
    const id = neighborId(paper.title, paper.year, paper.url);
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push({
      s2Id: id,
      title: paper.title,
      year: paper.year,
      abstract: paper.evidence_quote,
    });
  }

  for (const src of output.sources) {
    const id = neighborId(src.title, undefined, src.url);
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push({
      s2Id: id,
      title: src.title,
      abstract: src.quote,
    });
  }

  return rows.slice(0, 10);
}

function buildAuditLiteratureQuery(
  paperId: string,
  paperIdType: "arxiv" | "doi",
  knownTitle?: string
): string {
  const idLine =
    paperIdType === "arxiv"
      ? `arXiv ID: ${paperId.replace(/^arxiv:/i, "")}`
      : `DOI: ${paperId.replace(/^doi:/i, "")}`;
  const titleLine = knownTitle ? `Known title: ${knownTitle}` : "";

  return `You are the Paperfork literature worker. Resolve this paper and find up to 10 closely related prior-art papers.

${idLine}
${titleLine}

Search arXiv, Papers With Code, Hugging Face, and authoritative author pages. Return structured JSON with prior_papers (title, url, authors, year, relevance, evidence_quote), themes, sources, and research_gaps. Prioritize papers that help audit whether a GitHub repo matches the paper's claims.`;
}

export async function fetchLinkupLiterature(
  paperId: string,
  paperIdType: "arxiv" | "doi",
  knownTitle?: string
): Promise<LinkupLiteratureResult> {
  const linkupKey = process.env.LINKUP_API_KEY;
  if (!linkupKey) {
    return {
      ok: false,
      provider: "none",
      neighbors: [],
      error: "LINKUP_API_KEY not configured",
    };
  }

  try {
    const res = await fetch("https://api.linkup.so/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${linkupKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: buildAuditLiteratureQuery(paperId, paperIdType, knownTitle),
        depth: "deep",
        outputType: "structured",
        structuredOutputSchema: LINKUP_RESEARCH_SCHEMA,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        provider: "linkup-error",
        neighbors: [],
        error: `Linkup HTTP ${res.status}`,
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

    const primary = output.prior_papers[0];
    return {
      ok: true,
      provider: "linkup",
      paper: primary
        ? {
            title: primary.title,
            abstract: primary.evidence_quote,
            year: primary.year,
            url: primary.url,
          }
        : undefined,
      neighbors: neighborsFromOutput(output),
    };
  } catch (e) {
    return {
      ok: false,
      provider: "linkup-error",
      neighbors: [],
      error: String(e),
    };
  }
}
