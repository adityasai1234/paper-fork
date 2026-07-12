const ARXIV_BASE = process.env.ARXIV_API_BASE ?? "https://export.arxiv.org/api/query";

export type ArxivFetchResult = {
  ok: boolean;
  arxivId: string;
  title?: string;
  abstract?: string;
  error?: string;
  httpStatus?: number;
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagInBlock(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m?.[1] ? decodeXmlEntities(m[1]) : undefined;
}

/** Parse arXiv Atom feed entry (skips feed-level title). */
export function parseArxivAtom(xml: string): { title?: string; abstract?: string; id?: string } {
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/i);
  const entry = entryMatch?.[1] ?? xml;
  return {
    title: tagInBlock(entry, "title"),
    abstract: tagInBlock(entry, "summary"),
    id: tagInBlock(entry, "id"),
  };
}

export function normalizeArxivId(paperId: string): string {
  return paperId.replace(/^arxiv:/i, "").trim();
}

export type ArxivSearchHit = {
  arxivId: string;
  title: string;
  abstract: string;
  url: string;
};

export type ArxivSearchResult = {
  ok: boolean;
  papers: ArxivSearchHit[];
  httpStatus?: number;
  error?: string;
};

function arxivIdFromEntryId(id?: string): string | undefined {
  if (!id) return undefined;
  const m = id.match(/arxiv\.org\/abs\/([^/?#]+)/i);
  return m?.[1] ? normalizeArxivId(m[1]) : undefined;
}

/** Parse all Atom entries from an arXiv search feed. */
export function parseArxivSearchEntries(xml: string): ArxivSearchHit[] {
  const papers: ArxivSearchHit[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(xml)) !== null) {
    const entry = match[1];
    const title = tagInBlock(entry, "title");
    const abstract = tagInBlock(entry, "summary");
    const id = tagInBlock(entry, "id");
    const arxivId = arxivIdFromEntryId(id);
    if (!title || !arxivId) continue;
    papers.push({
      arxivId,
      title,
      abstract: abstract ?? "",
      url: `https://arxiv.org/abs/${arxivId}`,
    });
  }
  return papers;
}

export async function searchArxivPapers(
  query: string,
  limit = 8
): Promise<ArxivSearchResult> {
  const q = encodeURIComponent(query.trim().slice(0, 300));
  if (!q) return { ok: false, papers: [], error: "empty query" };

  try {
    const res = await fetch(
      `${ARXIV_BASE}?search_query=all:${q}&start=0&max_results=${limit}`,
      { headers: { "User-Agent": "paperfork/1.0" } }
    );
    const xml = await res.text();
    if (!res.ok) {
      return { ok: false, papers: [], httpStatus: res.status, error: `arXiv HTTP ${res.status}` };
    }
    return { ok: true, papers: parseArxivSearchEntries(xml), httpStatus: res.status };
  } catch (e) {
    return { ok: false, papers: [], error: String(e) };
  }
}

export async function fetchArxivMetadata(arxivId: string): Promise<ArxivFetchResult> {
  const id = normalizeArxivId(arxivId);
  try {
    const res = await fetch(`${ARXIV_BASE}?id_list=${id}`, {
      headers: { "User-Agent": "paperfork/1.0" },
    });
    const xml = await res.text();
    if (!res.ok) {
      return { ok: false, arxivId: id, error: `arXiv HTTP ${res.status}`, httpStatus: res.status };
    }
    const parsed = parseArxivAtom(xml);
    if (!parsed.abstract && !parsed.title) {
      return { ok: false, arxivId: id, error: "arXiv entry not found or empty", httpStatus: res.status };
    }
    return {
      ok: true,
      arxivId: id,
      title: parsed.title,
      abstract: parsed.abstract,
      httpStatus: res.status,
    };
  } catch (e) {
    return { ok: false, arxivId: id, error: String(e) };
  }
}
