import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUDIT_DIMENSIONS,
  buildChecklistFromRegistry,
  chunkText,
  classifyClaimDimension,
  emptyEvalProtocol,
  extractEvalClaimsFromText,
  extractRegexClaims,
  shouldFetchFullText,
} from "../../../convex/lib/audit-registry";

describe("classifyClaimDimension", () => {
  it("classifies each audit dimension from keywords", () => {
    assert.equal(classifyClaimDimension("We use 5-fold cross-validation."), "splits");
    assert.equal(classifyClaimDimension("Three random seeds were used."), "seeds");
    assert.equal(classifyClaimDimension("We report macro F1 and accuracy."), "metrics");
    assert.equal(classifyClaimDimension("Compared against SOTA baselines."), "baselines");
    assert.equal(classifyClaimDimension("Trained on NVIDIA V100 GPUs."), "hardware");
    assert.equal(classifyClaimDimension("Saved best checkpoint each epoch."), "checkpoints");
    assert.equal(classifyClaimDimension("Avoided test set leakage."), "data_leakage");
    assert.equal(classifyClaimDimension("Standard evaluation protocol."), "eval_protocol");
    assert.equal(AUDIT_DIMENSIONS.length, 8);
  });
});

describe("extractEvalClaimsFromText", () => {
  it("keeps eval sentences and drops short non-eval text", () => {
    const claims = extractEvalClaimsFromText(
      "methods",
      "We use 5-fold cross-validation on the training set. This is short. We report macro F1."
    );
    assert.ok(claims.length >= 1);
    assert.ok(claims.every((c) => c.section === "methods"));
  });
});

describe("shouldFetchFullText", () => {
  it("returns true when detail keywords lack section refs", () => {
    assert.equal(
      shouldFetchFullText(["We use 5-fold CV and multiple seeds."]),
      true
    );
  });

  it("returns false when section refs present", () => {
    assert.equal(
      shouldFetchFullText(["See Section 4.2 for 5-fold CV details."]),
      false
    );
  });
});

describe("extractRegexClaims", () => {
  it("extracts depth-keyword sentences", () => {
    const claims = extractRegexClaims("We use 5-fold CV. The model is large.");
    assert.ok(claims.some((c) => /5-fold/i.test(c)));
  });

  it("falls back to abstract slice when no keyword hits", () => {
    const claims = extractRegexClaims("A generic abstract with no eval terms.");
    assert.equal(claims.length, 1);
  });
});

describe("chunkText", () => {
  it("returns single chunk when under limit", () => {
    assert.deepEqual(chunkText("hello", 100), ["hello"]);
  });

  it("splits into multiple chunks at boundary", () => {
    const text = "a".repeat(100);
    const chunks = chunkText(text, 40);
    assert.equal(chunks.length, 3);
    assert.equal(chunks.join("").length, 100);
  });
});

describe("buildChecklistFromRegistry", () => {
  it("marks red when finding is FORKED for dimension", () => {
    const items = buildChecklistFromRegistry(
      { seeds_found: [], splits_found: [], deps: [], baselines_in_code: [] },
      { evalProtocol: emptyEvalProtocol("summary") },
      [
        {
          claim: "splits mismatch",
          verdict: "FORKED",
          dimension: "splits",
          repoEvidence: "no KFold",
        },
      ]
    );
    const splits = items.find((i) => i.item === "splits");
    assert.equal(splits?.status, "red");
  });

  it("marks green when repo has split signals", () => {
    const items = buildChecklistFromRegistry(
      {
        seeds_found: [],
        splits_found: ["StratifiedKFold"],
        deps: [],
        baselines_in_code: [],
      },
      undefined,
      []
    );
    const splits = items.find((i) => i.item === "splits");
    assert.equal(splits?.status, "green");
  });
});
