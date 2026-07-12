import type { PaperSection, PaperSections } from "./audit-registry";

const SECTION_HEADING =
  /^(abstract|introduction|background|related work|methods?|methodology|experimental setup|experiments?|results?|discussion|conclusion|appendix)\b/i;

export async function fetchPaperSections(
  arxivId: string,
  abstract?: string
): Promise<PaperSections> {
  const sections: PaperSections = {};
  if (abstract) sections.abstract = abstract;

  const htmlSections = await fetchArxivHtmlSections(arxivId);
  if (htmlSections) {
    for (const [key, value] of Object.entries(htmlSections)) {
      if (value && !sections[key as PaperSection]) {
        sections[key as PaperSection] = value;
      }
    }
    if (Object.keys(sections).length > 1) return sections;
  }

  return sections;
}

async function fetchArxivHtmlSections(arxivId: string): Promise<PaperSections | null> {
  try {
    const res = await fetch(`https://arxiv.org/html/${arxivId}`, {
      headers: { "User-Agent": "paperfork/1.0" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return parseHtmlSections(html);
  } catch {
    return null;
  }
}

function parseHtmlSections(html: string): PaperSections {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n");

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
