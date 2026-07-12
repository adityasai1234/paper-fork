export type LiteraturePayload = {
  paper: {
    s2Id?: string;
    arxivId?: string;
    title: string;
    abstract?: string;
    year?: number;
  };
  abstract_claims: string[];
  neighbors: Array<{
    s2Id: string;
    title: string;
    year?: number;
    abstract?: string;
    citationCount?: number;
  }>;
  method_keywords: string[];
};

export type RepoPayload = {
  sha?: string;
  defaultBranch?: string;
  readme?: string;
  files: Array<{ path: string; snippet: string }>;
  seeds_found: string[];
  splits_found: string[];
  metrics_found: Array<{ name: string; file: string; line: number; snippet: string }>;
  baselines_in_code: string[];
  deps: string[];
  structure?: {
    entrypoints: string[];
    moduleCount: number;
    configChain: string[];
  };
};

export type WebPayload = {
  linkup_sources: Array<{ url: string; used_for: string }>;
  external_metrics: Array<{
    benchmark: string;
    metric: string;
    value: string;
    source_url: string;
  }>;
  raw_answer?: string;
};

export type ForkFinding = {
  claim: string;
  paperSource: string;
  repoEvidence?: string;
  verdict: "FORKED" | "ALIGNED" | "UNVERIFIABLE";
  suggestedFix?: string;
  effort?: "S" | "M" | "L";
};

export function runForkRules(
  literature: LiteraturePayload,
  repo: RepoPayload,
  web: WebPayload
): ForkFinding[] {
  const findings: ForkFinding[] = [];

  const paperClaimsCV = literature.abstract_claims.some((c) =>
    /cross.?val|k-?fold|k fold/i.test(c)
  );
  const repoHasCV = repo.splits_found.some((s) =>
    /KFold|StratifiedKFold|cross_val/i.test(s)
  );
  if (paperClaimsCV && !repoHasCV) {
    findings.push({
      claim: "Cross-validation / k-fold evaluation",
      paperSource: "abstract",
      repoEvidence: "No KFold/StratifiedKFold in repo",
      verdict: "FORKED",
      suggestedFix: "Add StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
      effort: "M",
    });
  }

  const paperClaimsSeeds = literature.abstract_claims.some((c) =>
    /seed|multiple runs|mean.*std/i.test(c)
  );
  const repoSeedCount = repo.seeds_found.length;
  if (paperClaimsSeeds && repoSeedCount <= 1) {
    findings.push({
      claim: "Multi-seed / variance reporting",
      paperSource: "abstract",
      repoEvidence: `Found ${repoSeedCount} seed reference(s)`,
      verdict: "FORKED",
      suggestedFix: "Loop seeds [42,123,456], report mean +/- std",
      effort: "S",
    });
  }

  const paperF1Macro = literature.abstract_claims.some((c) =>
    /macro.*f1|f1.*macro/i.test(c)
  );
  const repoBinaryF1 = repo.metrics_found.find((m) =>
    /average.*binary|average='binary'/i.test(m.snippet)
  );
  if (paperF1Macro && repoBinaryF1) {
    findings.push({
      claim: "Macro F1 metric",
      paperSource: "abstract",
      repoEvidence: `${repoBinaryF1.file}:${repoBinaryF1.line} uses average='binary'`,
      verdict: "FORKED",
      suggestedFix: "Change to average='macro'",
      effort: "S",
    });
  }

  const hasTrainEval = repo.files.some((f) => /train|eval/i.test(f.path));
  const readmeHasRun = /python (train|eval)|bash scripts/i.test(repo.readme || "");
  if (hasTrainEval && !readmeHasRun) {
    findings.push({
      claim: "Reproducible run instructions",
      paperSource: "implicit",
      repoEvidence: "train/eval scripts exist; README lacks run commands",
      verdict: "FORKED",
      suggestedFix: "AUTO_DRAFT_README_SECTION",
      effort: "S",
    });
  }

  for (const n of literature.neighbors.slice(0, 5)) {
    const ext = web.external_metrics?.find(
      (e) =>
        e.benchmark &&
        n.title.toLowerCase().includes(e.benchmark.toLowerCase().slice(0, 10))
    );
    if (ext?.value) {
      findings.push({
        claim: `Neighbor ${n.title} reports ${ext.metric}=${ext.value}`,
        paperSource: `S2:${n.s2Id}`,
        repoEvidence: "Not verified in repo eval output",
        verdict: "UNVERIFIABLE",
        suggestedFix: `Compare against ${n.title}: check their method section`,
        effort: "M",
      });
    }
  }

  return findings;
}

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function buildIssueBody(
  auditId: string,
  paperId: string,
  repoUrl: string,
  forkLedger: ForkFinding[]
): string {
  const forked = forkLedger.filter((f) => f.verdict === "FORKED");
  const lines = [
    `## Paperfork Audit — Fork Report for ${repoUrl}`,
    "",
    `Audit: https://paperfork.getkarpathy.com/report/${auditId}`,
    `Paper: ${paperId}`,
    "",
    `### Forked items (${forked.length})`,
    "",
  ];

  forked.forEach((f, i) => {
    lines.push(`#### ${i + 1}. ${f.claim}`);
    lines.push(`- Paper: ${f.paperSource}`);
    lines.push(`- Repo: ${f.repoEvidence ?? "n/a"}`);
    lines.push(`- Fix: ${f.suggestedFix ?? "n/a"}`);
    lines.push(`- Effort: ${f.effort ?? "n/a"}`);
    lines.push("");
  });

  lines.push("---");
  lines.push("Generated by Paperfork. Contact: paperfork@getkarpathy.com");
  return lines.join("\n");
}

export function buildReadmePatch(
  reproAppendix: Record<string, string | undefined>,
  forked: ForkFinding[]
): string {
  const lines = [
    "## Reproduction (Paperfork)",
    "",
    "```bash",
    reproAppendix.install ?? "pip install -r requirements.txt",
    reproAppendix.train ?? "python train.py --seed 42",
    reproAppendix.eval ?? "python eval.py --checkpoint checkpoints/best.pt",
    "```",
    "",
  ];
  for (const f of forked) {
    lines.push(`> Paperfork flagged: ${f.claim}. See Fork Report.`);
  }
  return lines.join("\n");
}
