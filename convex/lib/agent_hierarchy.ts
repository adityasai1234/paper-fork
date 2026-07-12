import { appHostnameForSpeech } from "./app_url";

/**
 * Paperfork agent hierarchy.
 * Ruler delegates to workers; workers report up; Ruler speaks via ElevenLabs.
 */
export const AGENTS = {
  ruler: "ruler",
  workers: {
    literature: "worker:literature",
    repo: "worker:repo",
    web: "worker:web",
    methods: "worker:methods",
    runtime: "worker:runtime",
    judge: "worker:judge",
    gapFiller: "worker:gap-filler",
    evalScaler: "worker:eval-scaler",
  },
} as const;

export type WorkerId = (typeof AGENTS.workers)[keyof typeof AGENTS.workers];

export function workerReportPayload(
  worker: WorkerId,
  summary: string,
  data?: Record<string, unknown>
) {
  return {
    hierarchy: "worker_to_ruler",
    worker,
    summary,
    ...data,
  };
}

export function rulerBriefScript(
  report: {
    paper: { title: string };
    forkLedger: Array<{ claim: string; verdict: string; repoEvidence?: string }>;
    repo: { url: string };
  },
  reportUrl?: string
): string {
  const forked = report.forkLedger.filter((f) => f.verdict === "FORKED");
  const unverifiable = report.forkLedger.filter((f) => f.verdict === "UNVERIFIABLE");

  const lines = [
    `Ruler report for ${report.paper.title}.`,
    `Repository: ${report.repo.url}.`,
    `Workers completed their audit.`,
    `Found ${forked.length} forked items and ${unverifiable.length} unverifiable claims.`,
  ];

  if (forked[0]) {
    lines.push(`Top fork: ${forked[0].claim}.`);
    if (forked[0].repoEvidence) lines.push(`Evidence: ${forked[0].repoEvidence}.`);
  }
  if (forked[1]) {
    lines.push(`Second fork: ${forked[1].claim}.`);
  }

  if (reportUrl) {
    lines.push(`Full fork report: ${reportUrl}`);
  } else {
    lines.push(`Full fork report is ready at ${appHostnameForSpeech()}.`);
  }
  return lines.join(" ");
}
