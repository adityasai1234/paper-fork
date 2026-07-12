import {
  runForkRules,
  type AuditContext,
  type LiteraturePayload,
  type MethodsPayload,
  type RepoPayload,
  type WebPayload,
} from "../../convex/lib/fork_rules";

export const FIXTURE_LIT: LiteraturePayload = {
  paper: { title: "Demo Paper", arxivId: "2401.00001" },
  abstract_claims: ["We use 5-fold cross-validation and report macro F1 with multiple seeds."],
  neighbors: [
    { s2Id: "s2-1", title: "Neighbor One", year: 2023 },
    { s2Id: "s2-2", title: "Neighbor Two", year: 2022 },
    { s2Id: "s2-3", title: "Neighbor Three", year: 2021 },
  ],
  method_keywords: ["5-fold", "macro F1"],
};

export const FIXTURE_REPO: RepoPayload = {
  readme: "# Demo repo",
  files: [{ path: "eval.py", snippet: "f1_score(y, pred, average='binary')" }],
  seeds_found: ["seed=42"],
  splits_found: ["train_test_split"],
  metrics_found: [{ name: "f1", file: "eval.py", line: 87, snippet: "average='binary'" }],
  baselines_in_code: [],
  deps: ["torch"],
};

export const FIXTURE_WEB: WebPayload = { linkup_sources: [], external_metrics: [] };

export const FIXTURE_METHODS: MethodsPayload = {
  evalProtocol: {
    splits: "5-fold cross-validation on training set",
    seeds: "Three random seeds (42, 123, 456)",
    metrics: ["macro F1", "accuracy"],
    baselines: ["BERT-base", "RoBERTa-large"],
    datasets: ["SST-2"],
    hardware: "NVIDIA V100",
    checkpointPolicy: "Best validation F1",
    summary:
      "Models are evaluated with 5-fold CV, macro F1, three seeds, against BERT and RoBERTa baselines.",
  },
  sectionClaims: [
    {
      id: "methods:cv",
      section: "methods",
      text: "We use 5-fold cross-validation",
      dimension: "splits",
      quote: "5-fold cross-validation",
      confidence: "high",
    },
    {
      id: "methods:metric",
      section: "methods",
      text: "We report macro F1",
      dimension: "metrics",
      quote: "macro F1",
      confidence: "high",
    },
  ],
};

export const FIXTURE_CTX: AuditContext = {
  literature: FIXTURE_LIT,
  repo: FIXTURE_REPO,
  web: FIXTURE_WEB,
};

export const FIXTURE_CTX_WITH_METHODS: AuditContext = {
  ...FIXTURE_CTX,
  methods: FIXTURE_METHODS,
};

export type PerRuleAssertionResult = {
  passed: boolean;
  failures: string[];
};

export function assertPerRuleFindings(
  ctx: AuditContext,
  options: { expectBaselines?: boolean } = {}
): PerRuleAssertionResult {
  const findings = runForkRules(ctx);
  const forked = (dim: string) =>
    findings.filter((f) => f.dimension === dim && f.verdict === "FORKED");
  const failures: string[] = [];

  if (forked("splits").length === 0) failures.push("expected FORKED splits (cross-validation)");
  if (forked("seeds").length === 0) failures.push("expected FORKED seeds (multi-seed)");
  if (forked("metrics").length === 0) failures.push("expected FORKED metrics (macro F1)");

  if (options.expectBaselines && forked("baselines").length === 0) {
    failures.push("expected FORKED baselines");
  }

  return { passed: failures.length === 0, failures };
}

export function scoreFixture(): {
  passed: boolean;
  forkedCount: number;
  hasBaselineFork: boolean;
  hasCvFork: boolean;
  perRule: PerRuleAssertionResult;
} {
  const findings = runForkRules(FIXTURE_CTX);
  const forked = findings.filter((f) => f.verdict === "FORKED");
  const hasCvFork = forked.some((f) => f.dimension === "splits" || /cross.?val|k-?fold/i.test(f.claim));
  const perRule = assertPerRuleFindings(FIXTURE_CTX);
  const passed = forked.length >= 2 && hasCvFork && perRule.passed;
  return { passed, forkedCount: forked.length, hasBaselineFork: false, hasCvFork, perRule };
}

export function scoreMethodsFixture(): {
  passed: boolean;
  forkedCount: number;
  hasBaselineFork: boolean;
  perRule: PerRuleAssertionResult;
} {
  const findings = runForkRules(FIXTURE_CTX_WITH_METHODS);
  const forked = findings.filter((f) => f.verdict === "FORKED");
  const hasBaselineFork = forked.some((f) => f.dimension === "baselines");
  const perRule = assertPerRuleFindings(FIXTURE_CTX_WITH_METHODS, { expectBaselines: true });
  const passed = forked.length >= 3 && hasBaselineFork && perRule.passed;
  return { passed, forkedCount: forked.length, hasBaselineFork, perRule };
}
