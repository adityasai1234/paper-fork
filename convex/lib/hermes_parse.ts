/**
 * Deterministic audit message parser for Hermes harness (no LLM).
 * Format: audit <paperId> <githubUrl>
 * Examples:
 *   audit arXiv:2401.12345 https://github.com/owner/repo
 *   audit 10.1234/example.doi https://github.com/owner/repo
 */

export type ParsedAuditMessage = {
  paperId: string;
  paperIdType: "arxiv" | "doi";
  githubUrl: string;
};

const AUDIT_PREFIX = /^audit\s+/i;

export function parseAuditMessage(message: string): ParsedAuditMessage | null {
  const trimmed = message.trim();
  if (!AUDIT_PREFIX.test(trimmed)) return null;

  const rest = trimmed.replace(AUDIT_PREFIX, "").trim();
  const githubMatch = rest.match(/(https?:\/\/\S+)/i);
  if (!githubMatch || githubMatch.index === undefined) return null;

  const githubUrl = githubMatch[1];
  const paperPart = rest.slice(0, githubMatch.index).trim();
  if (!paperPart) return null;

  const paperIdType = detectPaperIdType(paperPart);
  const paperId = normalizePaperId(paperPart, paperIdType);

  return { paperId, paperIdType, githubUrl };
}

function detectPaperIdType(paperId: string): "arxiv" | "doi" {
  if (/^arxiv:/i.test(paperId) || /^\d{4}\.\d{4,5}$/i.test(paperId)) return "arxiv";
  return "doi";
}

function normalizePaperId(paperId: string, type: "arxiv" | "doi"): string {
  if (type === "arxiv") return paperId.replace(/^arxiv:/i, "").trim();
  return paperId.replace(/^doi:/i, "").trim();
}
