import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routes } from "../../../apps/web/lib/routes";

describe("routes", () => {
  it("builds audit paths without session", () => {
    assert.equal(routes.audits(), "/audits");
    assert.equal(routes.audit("abc123"), "/audits/abc123");
    assert.equal(routes.auditReport("abc123"), "/audits/abc123/report");
  });

  it("encodes session query params", () => {
    assert.equal(
      routes.audit("abc123", "sess+1"),
      "/audits/abc123?session=sess%2B1"
    );
    assert.equal(
      routes.researchReport("run1", "sess=2"),
      "/research/run1/report?session=sess%3D2"
    );
  });

  it("builds research paths", () => {
    assert.equal(routes.research(), "/research");
    assert.equal(routes.researchRun("run1"), "/research/run1");
    assert.equal(routes.researchReport("run1"), "/research/run1/report");
  });
});
