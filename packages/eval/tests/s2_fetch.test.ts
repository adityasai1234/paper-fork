import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arxivIdFromS2, s2PaperPath } from "../../../convex/lib/s2-fetch";

describe("s2PaperPath", () => {
  it("encodes DOI path segment", () => {
    assert.equal(s2PaperPath("10.1234/foo.doi", "doi"), "DOI:10.1234%2Ffoo.doi");
  });

  it("formats arXiv path segment", () => {
    assert.equal(s2PaperPath("arXiv:2401.00001", "arxiv"), "arXiv:2401.00001");
  });
});

describe("arxivIdFromS2", () => {
  it("strips arxiv prefix from external ids", () => {
    assert.equal(
      arxivIdFromS2({ paperId: "p1", externalIds: { ArXiv: "arXiv:2401.00001" } }),
      "2401.00001"
    );
  });

  it("returns undefined when external id missing", () => {
    assert.equal(arxivIdFromS2({ paperId: "p1" }), undefined);
  });
});
