/** @jsxImportSource react */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ForkLedger } from "../components/ForkLedger";

describe("ForkLedger", () => {
  it("renders Section and Dimension column headers", () => {
    const html = renderToStaticMarkup(
      <ForkLedger
        items={[
          {
            claim: "CV mismatch",
            paperSource: "abstract",
            section: "methods",
            dimension: "splits",
            verdict: "FORKED",
            repoEvidence: "no KFold",
            suggestedFix: "add StratifiedKFold",
          },
        ]}
      />
    );
    assert.match(html, /Section/);
    assert.match(html, /Dimension/);
    assert.match(html, /verdict-FORKED/);
    assert.match(html, /CV mismatch/);
    assert.match(html, /Paper claims compared with repository evidence/);
    assert.match(html, /scope="col"/);
  });
});
