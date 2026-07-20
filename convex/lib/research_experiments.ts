export type MetricDirection = "minimize" | "maximize";

export type ExperimentCandidateInput = {
  title: string;
  hypothesis: string;
  proposedChange: string;
  expectedEffect: string;
  evidenceUrls: string[];
  risks: string[];
  rank: number;
};

export function normalizeEvidenceUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    let hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (hostname.startsWith("www.")) hostname = hostname.slice(4);
    const defaultPort =
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443");
    const port = parsed.port && !defaultPort ? `:${parsed.port}` : "";
    const path = parsed.pathname.toLowerCase().replace(/\/+$/, "");
    return `${hostname}${port}${path}`;
  } catch {
    return null;
  }
}

export function normalizeGithubRepositoryUrl(value: string): string | null {
  const trimmed = value.trim().replace(/\/$/, "");
  const match = trimmed.match(
    /^(?:https:\/\/github\.com\/|git@github\.com:)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/
  );
  if (!match) return null;
  return `https://github.com/${match[1]}/${match[2]}.git`;
}

export function normalizeBaseBranch(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  if (
    trimmed === "@" ||
    trimmed.includes("..") ||
    trimmed.includes("@{") ||
    /[~^:?*\[\\\s\u0000-\u001f\u007f]/.test(trimmed) ||
    trimmed.split("/").some(
      (part) =>
        !part ||
        part.startsWith(".") ||
        part.endsWith(".") ||
        part.endsWith(".lock")
    )
  ) {
    return null;
  }
  return trimmed;
}

export function candidateKey(candidate: Pick<ExperimentCandidateInput, "title" | "proposedChange">): string {
  const canonical = `${candidate.title}:${candidate.proposedChange}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return canonical.slice(0, 160) || "candidate";
}

export function metricDelta(
  previousBest: number,
  candidate: number,
  direction: MetricDirection
): number {
  return direction === "minimize"
    ? previousBest - candidate
    : candidate - previousBest;
}

export function isMetricImprovement(
  previousBest: number,
  candidate: number,
  direction: MetricDirection,
  minimumImprovement: number
): boolean {
  return metricDelta(previousBest, candidate, direction) >= minimumImprovement;
}

export function readBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization")?.trim();
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

export function isGithubCommitResult(
  commitSha: string | undefined,
  resultRef: string | undefined
): boolean {
  if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha) || !resultRef) return false;
  const match = resultRef.match(
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/commit\/([0-9a-f]{40})$/i
  );
  return match?.[1].toLowerCase() === commitSha.toLowerCase();
}

export function experimentFeedback(args: {
  title: string;
  metricName: string;
  previousBest: number;
  metricValue?: number;
  improved: boolean;
  error?: string;
}): string[] {
  const outcome =
    args.metricValue === undefined
      ? `failed before producing ${args.metricName}${args.error ? `: ${args.error}` : ""}`
      : `${args.metricName} moved from ${args.previousBest} to ${args.metricValue}`;
  return [
    `Experiment "${args.title}" ${outcome}.`,
    args.improved
      ? "Search for a complementary, source-backed train.py change that can compound this improvement."
      : "Search for a materially different, source-backed train.py change that addresses this failure.",
  ];
}
