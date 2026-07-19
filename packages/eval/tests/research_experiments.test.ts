import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  candidateKey,
  experimentFeedback,
  isGithubCommitResult,
  isMetricImprovement,
  metricDelta,
  normalizeBaseBranch,
  normalizeGithubRepositoryUrl,
  readBearerToken,
} from "../../../convex/lib/research_experiments";
import {
  buildLinkupResearchQuery,
  LINKUP_RESEARCH_SCHEMA,
} from "../../../convex/lib/research_helpers";

describe("research experiment contract", () => {
  it("normalizes HTTPS and SSH GitHub repositories", () => {
    assert.equal(
      normalizeGithubRepositoryUrl("https://github.com/adityasai1234/paper-fork.git"),
      "https://github.com/adityasai1234/paper-fork.git"
    );
    assert.equal(
      normalizeGithubRepositoryUrl("git@github.com:adityasai1234/paper-fork.git"),
      "https://github.com/adityasai1234/paper-fork.git"
    );
    assert.equal(normalizeGithubRepositoryUrl("https://example.com/repo"), null);
  });

  it("rejects unsafe Git ref shapes", () => {
    assert.equal(normalizeBaseBranch("main"), "main");
    assert.equal(normalizeBaseBranch("feature/research-loop"), "feature/research-loop");
    assert.equal(normalizeBaseBranch("../main"), null);
    assert.equal(normalizeBaseBranch("main branch"), null);
    assert.equal(normalizeBaseBranch("release.lock"), null);
  });

  it("judges metrics in either direction at the configured threshold", () => {
    assert.equal(metricDelta(1.5, 1.4, "minimize"), 0.10000000000000009);
    assert.equal(isMetricImprovement(1.5, 1.49, "minimize", 0.01), true);
    assert.equal(isMetricImprovement(1.5, 1.495, "minimize", 0.01), false);
    assert.equal(isMetricImprovement(70, 71, "maximize", 0.5), true);
  });

  it("deduplicates candidates by their proposed code change", () => {
    assert.equal(
      candidateKey({ title: "  Rotary scaling ", proposedChange: "Change RoPE base to 10k." }),
      "rotary-scaling-change-rope-base-to-10k"
    );
  });

  it("reads only a bearer authorization token", () => {
    assert.equal(
      readBearerToken(new Request("https://paperfork.test", {
        headers: { Authorization: "Bearer worker-secret" },
      })),
      "worker-secret"
    );
    assert.equal(
      readBearerToken(new Request("https://paperfork.test", {
        headers: { Authorization: "Basic worker-secret" },
      })),
      undefined
    );
  });

  it("accepts only immutable GitHub commit evidence", () => {
    const sha = "a".repeat(40);
    assert.equal(
      isGithubCommitResult(sha, `https://github.com/acme/model/commit/${sha}`),
      true
    );
    assert.equal(isGithubCommitResult(sha, "https://github.com/acme/model/tree/main"), false);
    assert.equal(
      isGithubCommitResult("b".repeat(40), `https://github.com/acme/model/commit/${sha}`),
      false
    );
  });

  it("feeds measured failures back into an executable Linkup query", () => {
    const feedback = experimentFeedback({
      title: "Wider MLP",
      metricName: "val_bpb",
      previousBest: 1.2,
      metricValue: 1.25,
      improved: false,
    });
    const query = buildLinkupResearchQuery("Improve a tiny language model", feedback, {
      repositoryUrl: "https://github.com/acme/model.git",
      baseBranch: "main",
      targetFile: "train.py",
      metricName: "val_bpb",
      metricDirection: "minimize",
    });
    assert.match(query, /moved from 1\.2 to 1\.25/);
    assert.match(query, /Editable file: train\.py/);
    assert.match(query, /Never invent evidence URLs/);
    assert.ok("experiment_candidates" in LINKUP_RESEARCH_SCHEMA.properties);
  });
});
