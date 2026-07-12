import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeArxivId,
  parseArxivAtom,
  parseArxivSearchEntries,
} from "../../../convex/lib/arxiv_fetch";

describe("parseArxivAtom", () => {
  it("decodes XML entities in entry fields", () => {
    const parsed = parseArxivAtom(
      '<feed><title>Feed Title</title><entry><title>A &amp; B &lt;model&gt;</title><summary>5-fold &amp; macro F1.</summary></entry></feed>'
    );
    assert.equal(parsed.title, "A & B <model>");
    assert.match(parsed.abstract ?? "", /5-fold & macro F1/);
  });

  it("uses entry block not feed-level title", () => {
    const parsed = parseArxivAtom(
      '<feed><title>Feed Title</title><entry><title>Paper Title</title><summary>Abstract.</summary></entry></feed>'
    );
    assert.equal(parsed.title, "Paper Title");
  });

  it("returns undefined fields for empty xml", () => {
    const parsed = parseArxivAtom("<feed></feed>");
    assert.equal(parsed.title, undefined);
    assert.equal(parsed.abstract, undefined);
  });
});

describe("normalizeArxivId", () => {
  it("strips arXiv prefix", () => {
    assert.equal(normalizeArxivId("arXiv:2401.00001"), "2401.00001");
  });
});

describe("parseArxivSearchEntries", () => {
  it("parses multiple feed entries", () => {
    const papers = parseArxivSearchEntries(`<feed>
      <entry>
        <title>Paper One</title>
        <summary>Abstract one.</summary>
        <id>https://arxiv.org/abs/2401.00001</id>
      </entry>
      <entry>
        <title>Paper Two</title>
        <summary>Abstract two.</summary>
        <id>https://arxiv.org/abs/2401.00002</id>
      </entry>
    </feed>`);
    assert.equal(papers.length, 2);
    assert.equal(papers[0]?.arxivId, "2401.00001");
    assert.equal(papers[1]?.title, "Paper Two");
  });
});
