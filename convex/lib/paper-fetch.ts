import type { PaperSection, PaperSections } from "./audit-registry";
import { fetchArxivMetadata, normalizeArxivId } from "./arxiv-fetch";
import { fetchS2Paper } from "./s2-fetch";

const SECTION_HEADING =
  /^(abstract|introduction|background|related work|methods?|methodology|experimental setup|experiments?|results?|discussion|conclusion|appendix)\b/i;

const LTX_SECTION_RE =
  /<section[^>]*id="[^"]*"[^>]*>[\s\S]*?<h2[^>]*class="[^"]*ltx_title[^"]*"[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<section|<\/section>|$)/gi;

const H2_HEADING_RE = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;

export type PaperFetchMeta = {
  htmlStatus: number | "skipped" | "error";
  sectionsFound: string[];
  source: "html" | "abstract_only";
  parseMode: "ltx_section" | "h2" | "lines" | "none";
};

export type PaperFetchResult = {
  sections: PaperSections;
  meta: PaperFetchMeta;
};

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n");
}

function decodeHeading(raw: string): string {
  return stripTags(raw).split("\n").map((l) => l.trim()).filter(Boolean)[0] ?? "";
}

export async function fetchPaperSections(
  arxivId: string | undefined,
  abstract?: string
): Promise<PaperFetchResult> {
  const sections: PaperSections = {};
  if (abstract) sections.abstract = abstract;

  if (!arxivId) {
    return {
      sections,
      meta: { htmlStatus: "skipped", sectionsFound: Object.keys(sections), source: "abstract_only", parseMode: "none" },
    };
  }

  const htmlResult = await fetchArxivHtmlSections(arxivId);
  if (htmlResult) {
    for (const [key, value] of Object.entries(htmlResult.sections)) {
      if (value && !sections[key as PaperSection]) {
        sections[key as PaperSection] = value;
      }
    }
    const sectionsFound = Object.keys(sections);
    const source = sectionsFound.length > 1 ? "html" : "abstract_only";
    return {
      sections,
      meta: {
        htmlStatus: htmlResult.meta.htmlStatus,
        sectionsFound,
        source,
        parseMode: htmlResult.meta.parseMode,
      },
    };
  }

  return {
    sections,
    meta: {
      htmlStatus: "error",
      sectionsFound: Object.keys(sections),
      source: "abstract_only",
      parseMode: "none",
    },
  };
}

async function fetchArxivHtmlSections(
  arxivId: string
): Promise<{ sections: PaperSections; meta: Omit<PaperFetchMeta, "sectionsFound" | "source"> } | null> {
  try {
    const res = await fetch(`https://arxiv.org/html/${arxivId}`, {
      headers: { "User-Agent": "paperfork/1.0" },
    });
    if (!res.ok) {
      return {
        sections: {},
        meta: { htmlStatus: res.status, sectionsFound: [], source: "abstract_only", parseMode: "none" },
      };
    }
    const html = await res.text();
    const ltx = parseLtxSections(html);
    if (Object.keys(ltx).length > 0) {
      return { sections: ltx, meta: { htmlStatus: res.status, sectionsFound: [], source: "html", parseMode: "ltx_section" } };
    }
    const h2 = parseH2Sections(html);
    if (Object.keys(h2).length > 0) {
      return { sections: h2, meta: { htmlStatus: res.status, sectionsFound: [], source: "html", parseMode: "h2" } };
    }
    const lines = parseLineSections(html);
    return {
      sections: lines,
      meta: {
        htmlStatus: res.status,
        sectionsFound: [],
        source: Object.keys(lines).length > 0 ? "html" : "abstract_only",
        parseMode: Object.keys(lines).length > 0 ? "lines" : "none",
      },
    };
  } catch {
    return null;
  }
}

function parseLtxSections(html: string): PaperSections {
  const sections: PaperSections = {};
  let match: RegExpExecArray | null;
  LTX_SECTION_RE.lastIndex = 0;
  while ((match = LTX_SECTION_RE.exec(html)) !== null) {
    const heading = decodeHeading(match[1]);
    const body = stripTags(match[2]).trim();
    const key = normalizeSectionHeading(heading);
    if (key && body.length > 40) {
      sections[key] = (sections[key] ? `${sections[key]}\n\n` : "") + body;
    }
  }
  return sections;
}

function parseH2Sections(html: string): PaperSections {
  const sections: PaperSections = {};
  const matches = [...html.matchAll(H2_HEADING_RE)];
  for (let i = 0; i < matches.length; i++) {
    const heading = decodeHeading(matches[i][1]);
    const key = normalizeSectionHeading(heading);
    if (!key) continue;
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? html.length) : html.length;
    const body = stripTags(html.slice(start, end)).trim();
    if (body.length > 40) {
      sections[key] = (sections[key] ? `${sections[key]}\n\n` : "") + body;
    }
  }
  return sections;
}

function parseLineSections(html: string): PaperSections {
  const text = stripTags(html);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: PaperSections = {};
  let current: PaperSection | null = null;
  const buffers: string[] = [];

  const flush = () => {
    if (current && buffers.length > 0) {
      const body = buffers.join("\n").trim();
      if (body.length > 40) {
        sections[current] = (sections[current] ? `${sections[current]}\n\n` : "") + body;
      }
    }
    buffers.length = 0;
  };

  for (const line of lines) {
    const heading = normalizeSectionHeading(line);
    if (heading) {
      flush();
      current = heading;
      continue;
    }
    if (current) buffers.push(line);
  }
  flush();
  return sections;
}

function normalizeSectionHeading(line: string): PaperSection | null {
  if (line.length > 80) return null;
  const m = line.match(SECTION_HEADING);
  if (!m) return null;
  const h = m[1].toLowerCase();
  if (h.startsWith("method")) return "methods";
  if (h.startsWith("experiment")) return "experiments";
  if (h.startsWith("result")) return "results";
  if (h === "background" || h === "related work") return "introduction";
  if (h === "conclusion") return "discussion";
  if (h === "abstract") return "abstract";
  if (h === "introduction") return "introduction";
  if (h === "discussion") return "discussion";
  if (h === "appendix") return "appendix";
  return null;
}

export function sectionsForExtraction(sections: PaperSections): Array<{ name: string; text: string }> {
  const priority: PaperSection[] = ["methods", "experiments", "results", "appendix", "introduction"];
  const out: Array<{ name: string; text: string }> = [];
  for (const key of priority) {
    const text = sections[key];
    if (text && text.length > 40) out.push({ name: key, text });
  }
  return out;
}

/** Probe coverage for a paper id (used by scripts/text-track-probe). */
export async function probeTextTracks(
  paperId: string,
  paperIdType: "arxiv" | "doi"
): Promise<{
  arxiv: { ok: boolean; abstractLen: number; error?: string };
  html: { status: number | "skipped" | "error"; sections: string[]; parseMode: string };
  s2: { ok: boolean; error?: string; rateLimited?: boolean };
}> {
  let arxivId: string | undefined;
  if (paperIdType === "arxiv") {
    arxivId = normalizeArxivId(paperId);
  }

  const s2 = await fetchS2Paper(paperId, paperIdType);
  if (!arxivId && s2.paper?.externalIds?.ArXiv) {
    arxivId = s2.paper.externalIds.ArXiv.replace(/^arxiv:/i, "").trim();
  }

  const arxiv =
    arxivId != null
      ? await fetchArxivMetadata(arxivId)
      : { ok: false as const, arxivId: "", error: "no arXiv id" };

  const paper = await fetchPaperSections(arxivId, arxiv.abstract);

  return {
    arxiv: {
      ok: arxiv.ok,
      abstractLen: arxiv.abstract?.length ?? 0,
      error: arxiv.error,
    },
    html: {
      status: paper.meta.htmlStatus,
      sections: paper.meta.sectionsFound,
      parseMode: paper.meta.parseMode,
    },
    s2: { ok: s2.ok, error: s2.error, rateLimited: s2.rateLimited },
  };
}
