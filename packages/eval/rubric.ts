import { runForkRules, type LiteraturePayload, type RepoPayload, type WebPayload } from "../../convex/lib/fork-rules";

const FIXTURE_LIT: LiteraturePayload = {
  paper: { title: "Demo Paper", arxivId: "2401.00001" },
  abstract_claims: ["We use 5-fold cross-validation and report macro F1 with multiple seeds."],
  neighbors: [
    { s2Id: "s2-1", title: "Neighbor One", year: 2023 },
    { s2Id: "s2-2", title: "Neighbor Two", year: 2022 },
    { s2Id: "s2-3", title: "Neighbor Three", year: 2021 },
  ],
  method_keywords: ["5-fold", "macro F1"],
};

const FIXTURE_REPO: RepoPayload = {
  readme: "# Demo repo",
  files: [{ path: "eval.py", snippet: "f1_score(y, pred, average='binary')" }],
  seeds_found: ["seed=42"],
  splits_found: ["train_test_split"],
  metrics_found: [{ name: "f1", file: "eval.py", line: 87, snippet: "average='binary'" }],
  baselines_in_code: [],
  deps: ["torch"],
};

const FIXTURE_WEB: WebPayload = { linkup_sources: [], external_metrics: [] };

export function scoreFixture(): { passed: boolean; forkedCount: number } {
  const findings = runForkRules(FIXTURE_LIT, FIXTURE_REPO, FIXTURE_WEB);
  const forked = findings.filter((f) => f.verdict === "FORKED");
  const passed = forked.length >= 2;
  return { passed, forkedCount: forked.length };
}
