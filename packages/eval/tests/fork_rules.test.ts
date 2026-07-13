import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildIssueBody,
  buildReadmePatch,
  parseGithubUrl,
  runForkRules,
  type AuditContext,
} from "../../../convex/lib/fork_rules";
import { fixtureCtx } from "./helpers";

function forkedDimensions(ctx: AuditContext): string[] {
  return runForkRules(ctx)
    .filter((f) => f.verdict === "FORKED")
    .map((f) => f.dimension ?? f.claim);
}

describe("runForkRules per-rule", () => {
  it("ruleCrossValidation FORKED when paper claims CV but repo lacks KFold", () => {
    const ctx = fixtureCtx({
      literature: {
        ...fixtureCtx().literature,
        abstract_claims: ["We use 5-fold cross-validation on all datasets."],
      },
      repo: {
        ...fixtureCtx().repo,
        splits_found: ["train_test_split"],
      },
    });
    assert.ok(forkedDimensions(ctx).some((d) => d === "splits"));
  });

  it("ruleCrossValidation passes when repo has StratifiedKFold", () => {
    const ctx = fixtureCtx({
      literature: {
        ...fixtureCtx().literature,
        abstract_claims: ["We use 5-fold cross-validation."],
      },
      repo: {
        ...fixtureCtx().repo,
        splits_found: ["StratifiedKFold(n_splits=5)"],
      },
    });
    assert.ok(!forkedDimensions(ctx).includes("splits"));
  });

  it("ruleSeeds FORKED when multiple seeds claimed but repo has one", () => {
    const ctx = fixtureCtx({
      literature: {
        ...fixtureCtx().literature,
        abstract_claims: ["We report results over multiple seeds with mean and std."],
      },
      repo: {
        ...fixtureCtx().repo,
        seeds_found: ["seed=42"],
      },
    });
    assert.ok(forkedDimensions(ctx).some((d) => d === "seeds"));
  });

  it("ruleSeeds passes when repo has multiple seed refs", () => {
    const ctx = fixtureCtx({
      literature: {
        ...fixtureCtx().literature,
        abstract_claims: ["We use multiple random seeds for variance."],
      },
      repo: {
        ...fixtureCtx().repo,
        seeds_found: ["seed=42", "seed=123", "seed=456"],
      },
    });
    assert.ok(!forkedDimensions(ctx).includes("seeds"));
  });

  it("ruleMacroF1 FORKED when paper claims macro F1 but repo uses binary", () => {
    const ctx = fixtureCtx({
      methods: {
        evalProtocol: {
          splits: null,
          seeds: null,
          metrics: ["macro F1"],
          baselines: [],
          datasets: [],
          hardware: null,
          checkpointPolicy: null,
          summary: "Evaluated with macro F1 across folds.",
        },
        sectionClaims: [
          {
            id: "m:1",
            section: "methods",
            text: "We report macro F1",
            dimension: "metrics",
            quote: "macro F1",
            confidence: "high",
          },
        ],
      },
      repo: {
        ...fixtureCtx().repo,
        metrics_found: [
          { name: "f1", file: "eval.py", line: 10, snippet: "average='binary'" },
        ],
      },
    });
    assert.ok(forkedDimensions(ctx).some((d) => d === "metrics"));
  });

  it("ruleMacroF1 passes when repo uses macro average", () => {
    const ctx = fixtureCtx({
      methods: {
        evalProtocol: {
          splits: null,
          seeds: null,
          metrics: ["macro F1"],
          baselines: [],
          datasets: [],
          hardware: null,
          checkpointPolicy: null,
          summary: "Evaluated with macro F1.",
        },
        sectionClaims: [],
      },
      repo: {
        ...fixtureCtx().repo,
        metrics_found: [
          { name: "f1", file: "eval.py", line: 10, snippet: "average='macro'" },
        ],
      },
    });
    assert.ok(!forkedDimensions(ctx).includes("metrics"));
  });

  it("ruleReadmeRepro FORKED when train exists but README lacks run commands", () => {
    const ctx = fixtureCtx({
      repo: {
        ...fixtureCtx().repo,
        readme: "# Demo",
        files: [{ path: "train.py", snippet: "main()" }],
      },
    });
    const findings = runForkRules(ctx);
    assert.ok(
      findings.some(
        (f) => f.verdict === "FORKED" && /reproducible run instructions/i.test(f.claim)
      )
    );
  });

  it("ruleReadmeRepro passes when README has python train.py", () => {
    const ctx = fixtureCtx({
      repo: {
        ...fixtureCtx().repo,
        readme: "# Demo\n\npython train.py --seed 42",
        files: [{ path: "train.py", snippet: "main()" }],
      },
    });
    const findings = runForkRules(ctx);
    assert.ok(
      !findings.some((f) => /reproducible run instructions/i.test(f.claim))
    );
  });

  it("ruleBaselines FORKED when methods list baselines missing from repo", () => {
    const ctx = fixtureCtx({
      methods: {
        evalProtocol: {
          splits: null,
          seeds: null,
          metrics: [],
          baselines: ["BERT-base", "RoBERTa-large"],
          datasets: [],
          hardware: null,
          checkpointPolicy: null,
          summary: "Compared against BERT-base and RoBERTa-large baselines in experiments.",
        },
        sectionClaims: [],
      },
      repo: {
        ...fixtureCtx().repo,
        baselines_in_code: [],
        files: [],
      },
    });
    assert.ok(forkedDimensions(ctx).some((d) => d === "baselines"));
  });

  it("ruleBaselines passes when repo includes baseline path", () => {
    const ctx = fixtureCtx({
      methods: {
        evalProtocol: {
          splits: null,
          seeds: null,
          metrics: [],
          baselines: ["BERT-base"],
          datasets: [],
          hardware: null,
          checkpointPolicy: null,
          summary: "Compared against BERT-base baseline.",
        },
        sectionClaims: [],
      },
      repo: {
        ...fixtureCtx().repo,
        baselines_in_code: ["bert-base"],
        files: [{ path: "baselines/bert.py", snippet: "BERT-base model" }],
      },
    });
    assert.ok(!forkedDimensions(ctx).includes("baselines"));
  });

  it("ruleEvalProtocolSummary FORKED when no eval script in repo", () => {
    const ctx = fixtureCtx({
      methods: {
        evalProtocol: {
          splits: "5-fold",
          seeds: "42",
          metrics: ["accuracy"],
          baselines: [],
          datasets: [],
          hardware: null,
          checkpointPolicy: null,
          summary:
            "A detailed evaluation protocol with cross-validation and multiple metrics is described.",
        },
        sectionClaims: [],
      },
      repo: {
        ...fixtureCtx().repo,
        files: [{ path: "train.py", snippet: "train()" }],
      },
    });
    assert.ok(forkedDimensions(ctx).some((d) => d === "eval_protocol"));
  });

  it("ruleNeighbors emits UNVERIFIABLE when external metric matches neighbor", () => {
    const ctx = fixtureCtx({
      literature: {
        ...fixtureCtx().literature,
        neighbors: [{ s2Id: "s2-n1", title: "Neighbor Benchmark Paper", year: 2022 }],
      },
      web: {
        linkup_sources: [],
        external_metrics: [
          {
            benchmark: "Neighbor Benchmark",
            metric: "accuracy",
            value: "0.91",
            source_url: "https://example.com",
          },
        ],
      },
    });
    const findings = runForkRules(ctx);
    assert.ok(findings.some((f) => f.verdict === "UNVERIFIABLE"));
  });

  it("ruleNeighbors silent when no external metrics", () => {
    const ctx = fixtureCtx();
    const findings = runForkRules(ctx);
    assert.ok(!findings.some((f) => f.verdict === "UNVERIFIABLE"));
  });
});

describe("runForkRules helpers", () => {
  it("parseGithubUrl parses owner/repo and strips .git", () => {
    assert.deepEqual(parseGithubUrl("https://github.com/owner/repo.git"), {
      owner: "owner",
      repo: "repo",
    });
  });

  it("parseGithubUrl returns null for invalid host", () => {
    assert.equal(parseGithubUrl("https://gitlab.com/o/r"), null);
  });

  it("buildIssueBody includes audit link and fork count", () => {
    const body = buildIssueBody("audit123", "2401.1", "https://github.com/o/r", [
      {
        claim: "CV mismatch",
        paperSource: "abstract",
        verdict: "FORKED",
        repoEvidence: "none",
        suggestedFix: "add KFold",
        effort: "M",
      },
    ]);
    assert.match(body, /audits\/audit123\/report/);
    assert.match(body, /Forked items \(1\)/);
  });

  it("buildReadmePatch includes repro block and flagged claims", () => {
    const patch = buildReadmePatch(
      { install: "pip install -r requirements.txt" },
      [{ claim: "Seed mismatch", paperSource: "abstract", verdict: "FORKED" }]
    );
    assert.match(patch, /pip install/);
    assert.match(patch, /Seed mismatch/);
  });

  it("deduplicates identical claim keys", () => {
    const ctx = fixtureCtx();
    const findings = runForkRules(ctx);
    const keys = findings.map((f) => `${f.claim}:${f.paperSource}`);
    assert.equal(keys.length, new Set(keys).size);
  });
});
