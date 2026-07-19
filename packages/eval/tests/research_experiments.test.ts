import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  candidateKey,
  experimentFeedback,
  isGithubCommitResult,
  isMetricImprovement,
  metricDelta,
  normalizeBaseBranch,
  normalizeEvidenceUrl,
  normalizeGithubRepositoryUrl,
  readBearerToken,
} from "../../../convex/lib/research_experiments";
import {
  buildLinkupResearchQuery,
  coerceLinkupResearchOutput,
  groundExperimentCandidates,
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

  it("normalizes source URLs before evidence matching", () => {
    assert.equal(normalizeEvidenceUrl("https://www.Example.com/Paper/"), "example.com/paper");
    assert.equal(normalizeEvidenceUrl("http://example.com/paper"), "example.com/paper");
    assert.equal(
      normalizeEvidenceUrl("https://example.com/paper?utm_source=search#results"),
      "example.com/paper"
    );
    assert.equal(normalizeEvidenceUrl("ftp://example.com/paper"), null);
    assert.equal(normalizeEvidenceUrl(null), null);
  });

  it("coerces malformed Linkup fields without stringifying null values", () => {
    const output = coerceLinkupResearchOutput({
      prior_papers: [
        {
          title: " Paper ",
          url: "https://example.com/paper",
          authors: null,
          relevance: null,
          evidence_quote: null,
        },
      ],
      themes: [null, " grounded theme "],
      sources: [
        {
          title: "Source",
          url: "https://example.com/source",
          source_type: null,
          used_for: null,
          quote: null,
        },
      ],
      research_gaps: [undefined, " evidence gap "],
      experiment_candidates: [
        {
          title: "Candidate",
          hypothesis: "hypothesis",
          proposed_change: "change",
          expected_effect: "effect",
          evidence_urls: [null, "https://www.example.com/source/"],
          risks: [null, " regression "],
          rank: null,
        },
      ],
    });

    assert.deepEqual(output.themes, ["grounded theme"]);
    assert.deepEqual(output.research_gaps, ["evidence gap"]);
    assert.deepEqual(output.prior_papers[0]?.authors, []);
    assert.equal(output.prior_papers[0]?.relevance, "unknown");
    assert.equal(output.prior_papers[0]?.evidence_quote, "");
    assert.equal(output.sources[0]?.source_type, "");
    assert.equal(output.sources[0]?.used_for, "");
    assert.equal(output.sources[0]?.quote, undefined);
    assert.deepEqual(output.experiment_candidates[0]?.risks, ["regression"]);
    assert.equal(JSON.stringify(output).includes('"null"'), false);
  });

  it("grounds URL variants to the retrieved source and rejects unrelated evidence", () => {
    const output = coerceLinkupResearchOutput({
      sources: [{ title: "Source", url: "https://example.com/source" }],
      experiment_candidates: [
        {
          title: "Grounded",
          hypothesis: "The change should help.",
          proposed_change: "Change one setting.",
          expected_effect: "Lower loss.",
          evidence_urls: ["http://www.example.com/source/"],
          rank: 1,
        },
        {
          title: "Ungrounded",
          hypothesis: "Another change should help.",
          proposed_change: "Change another setting.",
          expected_effect: "Higher accuracy.",
          evidence_urls: ["https://unrelated.example/paper"],
          rank: 2,
        },
      ],
    });

    const candidates = groundExperimentCandidates(output);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0]?.title, "Grounded");
    assert.deepEqual(candidates[0]?.evidenceUrls, ["https://example.com/source"]);
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
