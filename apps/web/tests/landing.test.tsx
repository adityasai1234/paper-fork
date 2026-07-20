/** @jsxImportSource react */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { EvidenceLedgerSection } from "../components/landing/EvidenceLedgerSection";
import { ForkSignal } from "../components/landing/ForkSignal";
import { PRODUCT_PATHS, RESEARCH_LOOP_STEPS } from "../components/landing/data";

describe("Paperfork landing", () => {
  it("explains a fork with claim and repository evidence", () => {
    const html = renderToStaticMarkup(<ForkSignal />);
    assert.match(html, /Paper claim/);
    assert.match(html, /Repository behavior/);
    assert.match(html, /Fork detected/);
    assert.match(html, /figcaption/);
  });

  it("shows text verdicts instead of relying on color", () => {
    const html = renderToStaticMarkup(<EvidenceLedgerSection />);
    assert.match(html, /Forked/);
    assert.match(html, /Aligned/);
    assert.match(html, /Review/);
  });

  it("keeps the public story to factual product paths and loop steps", () => {
    assert.deepEqual(PRODUCT_PATHS.map((path) => path.label), ["Audit", "Research"]);
    assert.deepEqual(RESEARCH_LOOP_STEPS.map((step) => step.label), [
      "Search",
      "Lease",
      "Measure",
      "Decide",
    ]);
    const publicCopy = JSON.stringify({ PRODUCT_PATHS, RESEARCH_LOOP_STEPS });
    assert.doesNotMatch(publicCopy, /SOC 2|HIPAA|testimonial|pricing/i);
  });
});
