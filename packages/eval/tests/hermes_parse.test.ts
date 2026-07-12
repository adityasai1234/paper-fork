import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAuditMessage } from "../../../convex/lib/hermes_parse";

describe("parseAuditMessage", () => {
  it("parses arXiv prefixed id", () => {
    const parsed = parseAuditMessage(
      "audit arXiv:2401.12345 https://github.com/owner/repo"
    );
    assert.ok(parsed);
    assert.equal(parsed.paperIdType, "arxiv");
    assert.equal(parsed.paperId, "2401.12345");
    assert.equal(parsed.githubUrl, "https://github.com/owner/repo");
  });

  it("parses bare arxiv id", () => {
    const parsed = parseAuditMessage(
      "audit 2401.12345 https://github.com/owner/repo"
    );
    assert.ok(parsed);
    assert.equal(parsed.paperIdType, "arxiv");
    assert.equal(parsed.paperId, "2401.12345");
  });

  it("parses DOI paper id", () => {
    const parsed = parseAuditMessage(
      "audit 10.1234/example.doi https://github.com/owner/repo"
    );
    assert.ok(parsed);
    assert.equal(parsed.paperIdType, "doi");
    assert.equal(parsed.paperId, "10.1234/example.doi");
  });

  it("rejects missing github url", () => {
    assert.equal(parseAuditMessage("audit arXiv:2401.12345"), null);
  });

  it("rejects missing paper id", () => {
    assert.equal(parseAuditMessage("audit https://github.com/owner/repo"), null);
  });

  it("rejects wrong prefix", () => {
    assert.equal(
      parseAuditMessage("run arXiv:2401.12345 https://github.com/owner/repo"),
      null
    );
  });
});
