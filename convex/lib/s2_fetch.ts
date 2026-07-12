const S2_BASE = "https://api.semanticscholar.org/graph/v1";
const S2_REC_BASE = "https://api.semanticscholar.org/recommendations/v1";

export type S2Paper = {
  paperId: string;
  title?: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  externalIds?: { ArXiv?: string; DOI?: string };
};

export type S2FetchResult = {
  ok: boolean;
  paper?: S2Paper;
  httpStatus?: number;
  error?: string;
  rateLimited?: boolean;
};

export type S2Neighbor = {
  s2Id: string;
  title: string;
  year?: number;
  abstract?: string;
  citationCount?: number;
};

export type S2NeighborsResult = {
  ok: boolean;
  neighbors: S2Neighbor[];
  httpStatus?: number;
  error?: string;
  rateLimited?: boolean;
};

function s2Headers(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (key) headers["x-api-key"] = key;
  return headers;
}

function s2Error(status: number): { error: string; rateLimited: boolean } {
  if (status === 429) return { error: "S2 rate limited", rateLimited: true };
  if (status === 404) return { error: "S2 paper not found", rateLimited: false };
  return { error: `S2 HTTP ${status}`, rateLimited: false };
}

/** Resolve S2 paper ID path segment from arXiv id or raw DOI. */
export function s2PaperPath(paperId: string, paperIdType: "arxiv" | "doi"): string {
  if (paperIdType === "doi") {
    const doi = paperId.replace(/^doi:/i, "").trim();
    return `DOI:${encodeURIComponent(doi)}`;
  }
  const arxivId = paperId.replace(/^arxiv:/i, "").trim();
  return `arXiv:${arxivId}`;
}

export async function fetchS2Paper(
  paperId: string,
  paperIdType: "arxiv" | "doi"
): Promise<S2FetchResult> {
  const path = s2PaperPath(paperId, paperIdType);
  try {
    const res = await fetch(
      `${S2_BASE}/paper/${path}?fields=title,abstract,year,citationCount,paperId,externalIds`,
      { headers: s2Headers() }
    );
    if (!res.ok) {
      const { error, rateLimited } = s2Error(res.status);
      return { ok: false, httpStatus: res.status, error, rateLimited };
    }
    const paper = (await res.json()) as S2Paper;
    return { ok: true, paper, httpStatus: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function fetchS2Neighbors(s2PaperId: string, limit = 10): Promise<S2NeighborsResult> {
  try {
    const res = await fetch(
      `${S2_REC_BASE}/papers/forpaper/${s2PaperId}?fields=title,year,citationCount,paperId,abstract&limit=${limit}`,
      { headers: s2Headers() }
    );
    if (!res.ok) {
      const { error, rateLimited } = s2Error(res.status);
      return { ok: false, neighbors: [], httpStatus: res.status, error, rateLimited };
    }
    const data = (await res.json()) as { recommendedPapers?: S2Neighbor[] };
    const neighbors: S2Neighbor[] = (data.recommendedPapers ?? []).map((n) => ({
      s2Id: n.s2Id ?? (n as { paperId?: string }).paperId ?? "",
      title: n.title,
      year: n.year,
      abstract: n.abstract,
      citationCount: n.citationCount,
    }));
    return { ok: true, neighbors, httpStatus: res.status };
  } catch (e) {
    return { ok: false, neighbors: [], error: String(e) };
  }
}

export function arxivIdFromS2(paper?: S2Paper): string | undefined {
  const ext = paper?.externalIds?.ArXiv;
  if (!ext) return undefined;
  return ext.replace(/^arxiv:/i, "").trim();
}

export type S2SearchHit = {
  s2Id: string;
  title: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  url: string;
};

export type S2SearchResult = {
  ok: boolean;
  papers: S2SearchHit[];
  httpStatus?: number;
  error?: string;
  rateLimited?: boolean;
};

function s2PaperUrl(paper: S2Paper): string {
  const arxivId = arxivIdFromS2(paper);
  if (arxivId) return `https://arxiv.org/abs/${arxivId}`;
  return `https://www.semanticscholar.org/paper/${paper.paperId}`;
}

export async function searchS2Papers(query: string, limit = 8): Promise<S2SearchResult> {
  const q = encodeURIComponent(query.trim().slice(0, 300));
  if (!q) return { ok: false, papers: [], error: "empty query" };

  try {
    const res = await fetch(
      `${S2_BASE}/paper/search?query=${q}&limit=${limit}&fields=title,abstract,year,citationCount,paperId,externalIds`,
      { headers: s2Headers() }
    );
    if (!res.ok) {
      const { error, rateLimited } = s2Error(res.status);
      return { ok: false, papers: [], httpStatus: res.status, error, rateLimited };
    }
    const data = (await res.json()) as { data?: S2Paper[] };
    const papers: S2SearchHit[] = (data.data ?? []).map((paper) => ({
      s2Id: paper.paperId,
      title: paper.title ?? "Untitled",
      abstract: paper.abstract,
      year: paper.year,
      citationCount: paper.citationCount,
      url: s2PaperUrl(paper),
    }));
    return { ok: true, papers, httpStatus: res.status };
  } catch (e) {
    return { ok: false, papers: [], error: String(e) };
  }
}
