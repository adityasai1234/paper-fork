import type { PaperSection, PaperSections } from "./audit_registry";
import { contactEmail, reportPageUrl } from "./app_url";

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
  methodsScheduled?: boolean;
  section_claims?: Array<{
    id: string;
    section: string;
    text: string;
    dimension: string;
    quote: string | null;
    confidence: string;
  }>;
};

export type MethodsPayload = {
  evalProtocol: {
    splits: string | null;
    seeds: string | null;
    metrics: string[];
    baselines: string[];
    datasets: string[];
    hardware: string | null;
    checkpointPolicy: string | null;
    summary: string;
  };
  sectionClaims: Array<{
    id: string;
    section: string;
    text: string;
    dimension: string;
    quote: string | null;
    confidence: string;
  }>;
};

export type RepoEvalSignals = {
  splits: string | null;
  seeds: string | null;
  metrics: string[];
  baselines: string[];
  hardware: string | null;
  checkpointPolicy: string | null;
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
  repoEvalSignals?: RepoEvalSignals;
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
  section?: string;
  claimId?: string;
  dimension?: string;
};

export type AuditContext = {
  literature: LiteraturePayload;
  repo: RepoPayload;
  web: WebPayload;
  methods?: MethodsPayload;
};

type ForkRule = (ctx: AuditContext) => ForkFinding[];

function allPaperClaims(ctx: AuditContext): Array<{
  text: string;
  source: string;
  section?: string;
  claimId?: string;
  dimension?: string;
}> {
  const out: Array<{
    text: string;
    source: string;
    section?: string;
    claimId?: string;
    dimension?: string;
  }> = [];
  for (const c of ctx.literature.abstract_claims) {
    out.push({ text: c, source: "abstract" });
  }
  for (const c of ctx.literature.section_claims ?? []) {
    out.push({
      text: c.text,
      source: c.section,
      section: c.section,
      claimId: c.id,
      dimension: c.dimension,
    });
  }
  for (const c of ctx.methods?.sectionClaims ?? []) {
    out.push({
      text: c.text,
      source: c.section,
      section: c.section,
      claimId: c.id,
      dimension: c.dimension,
    });
  }
  return out;
}

function claimsMatch(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

const ruleCrossValidation: ForkRule = (ctx) => {
  const claims = allPaperClaims(ctx);
  const paperClaimsCV = claims.some((c) => claimsMatch(c.text, /cross.?val|k-?fold|k fold/i));
  const protocolCV = ctx.methods?.evalProtocol.splits
    ? /fold|cross.?val/i.test(ctx.methods.evalProtocol.splits)
    : false;
  const repoHasCV = ctx.repo.splits_found.some((s) => /KFold|StratifiedKFold|cross_val/i.test(s));
  if ((paperClaimsCV || protocolCV) && !repoHasCV) {
    const src = claims.find((c) => claimsMatch(c.text, /cross.?val|k-?fold/i))?.source
      ?? (protocolCV ? "methods" : "abstract");
    return [
      {
        claim: "Cross-validation / k-fold evaluation",
        paperSource: src,
        section: src !== "abstract" ? src : undefined,
        dimension: "splits",
        repoEvidence: "No KFold/StratifiedKFold in repo",
        verdict: "FORKED",
        suggestedFix: "Add StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
        effort: "M",
      },
    ];
  }
  return [];
};

const ruleSeeds: ForkRule = (ctx) => {
  const claims = allPaperClaims(ctx);
  const paperClaimsSeeds = claims.some((c) =>
    claimsMatch(c.text, /seed|multiple runs|mean.*std/i)
  );
  const protocolSeeds = ctx.methods?.evalProtocol.seeds
    ? /multiple|several|\d+\s*seed/i.test(ctx.methods.evalProtocol.seeds)
    : false;
  const repoSeedCount = ctx.repo.seeds_found.length;
  if ((paperClaimsSeeds || protocolSeeds) && repoSeedCount <= 1) {
    return [
      {
        claim: "Multi-seed / variance reporting",
        paperSource: protocolSeeds ? "methods" : "abstract",
        dimension: "seeds",
        repoEvidence: `Found ${repoSeedCount} seed reference(s)`,
        verdict: "FORKED",
        suggestedFix: "Loop seeds [42,123,456], report mean +/- std",
        effort: "S",
      },
    ];
  }
  return [];
};

const ruleMacroF1: ForkRule = (ctx) => {
  const claims = allPaperClaims(ctx);
  const paperF1Macro = claims.some((c) => claimsMatch(c.text, /macro.*f1|f1.*macro/i))
    || (ctx.methods?.evalProtocol.metrics ?? []).some((m) => /macro.*f1|f1.*macro/i.test(m));
  const repoBinaryF1 = ctx.repo.metrics_found.find((m) =>
    /average.*binary|average='binary'/i.test(m.snippet)
  );
  if (paperF1Macro && repoBinaryF1) {
    return [
      {
        claim: "Macro F1 metric",
        paperSource: "methods",
        dimension: "metrics",
        repoEvidence: `${repoBinaryF1.file}:${repoBinaryF1.line} uses average='binary'`,
        verdict: "FORKED",
        suggestedFix: "Change to average='macro'",
        effort: "S",
      },
    ];
  }
  return [];
};

const ruleReadmeRepro: ForkRule = (ctx) => {
  const hasTrainEval = ctx.repo.files.some((f) => /train|eval/i.test(f.path));
  const readmeHasRun = /python (train|eval)|bash scripts/i.test(ctx.repo.readme || "");
  if (hasTrainEval && !readmeHasRun) {
    return [
      {
        claim: "Reproducible run instructions",
        paperSource: "implicit",
        repoEvidence: "train/eval scripts exist; README lacks run commands",
        verdict: "FORKED",
        suggestedFix: "AUTO_DRAFT_README_SECTION",
        effort: "S",
      },
    ];
  }
  return [];
};

const ruleBaselines: ForkRule = (ctx) => {
  const protocolBaselines = ctx.methods?.evalProtocol.baselines ?? [];
  if (protocolBaselines.length === 0) return [];
  const missing = protocolBaselines.filter(
    (b) =>
      !ctx.repo.baselines_in_code.some((p) => p.toLowerCase().includes(b.toLowerCase().slice(0, 8)))
      && !ctx.repo.files.some((f) => f.snippet.toLowerCase().includes(b.toLowerCase().slice(0, 8)))
  );
  if (missing.length === 0) return [];
  return [
    {
      claim: `Baselines in paper not found in repo: ${missing.slice(0, 3).join(", ")}`,
      paperSource: "methods",
      dimension: "baselines",
      repoEvidence: `Repo baselines: ${ctx.repo.baselines_in_code.join(", ") || "none"}`,
      verdict: "FORKED",
      suggestedFix: `Add baseline implementations for: ${missing[0]}`,
      effort: "L",
    },
  ];
};

const ruleEvalProtocolSummary: ForkRule = (ctx) => {
  const summary = ctx.methods?.evalProtocol.summary;
  if (!summary || summary.length < 30) return [];
  const hasEvalScript = ctx.repo.files.some((f) => /eval/i.test(f.path));
  if (!hasEvalScript) {
    return [
      {
        claim: "Evaluation protocol described in paper but no eval script in repo",
        paperSource: "methods",
        dimension: "eval_protocol",
        repoEvidence: "No eval.py or equivalent found",
        verdict: "FORKED",
        suggestedFix: "Add eval script matching paper protocol",
        effort: "M",
      },
    ];
  }
  return [];
};

const ruleNeighbors: ForkRule = (ctx) => {
  const findings: ForkFinding[] = [];
  for (const n of ctx.literature.neighbors.slice(0, 5)) {
    const ext = ctx.web.external_metrics?.find(
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
};

const RULES: ForkRule[] = [
  ruleCrossValidation,
  ruleSeeds,
  ruleMacroF1,
  ruleReadmeRepro,
  ruleBaselines,
  ruleEvalProtocolSummary,
  ruleNeighbors,
];

export function runForkRules(ctx: AuditContext): ForkFinding[] {
  const seen = new Set<string>();
  const findings: ForkFinding[] = [];
  for (const rule of RULES) {
    for (const f of rule(ctx)) {
      const key = `${f.claim}:${f.paperSource}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push(f);
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
    `Audit: ${reportPageUrl(auditId)}`,
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
  lines.push(`Generated by Paperfork. Contact: ${contactEmail()}`);
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
