/** @jsxImportSource react */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Checklist } from "../components/Checklist";

describe("Checklist", () => {
  it("renders red amber green status markers", () => {
    const html = renderToStaticMarkup(
      <Checklist
        items={[
          { item: "splits", status: "red", evidence: "no KFold" },
          { item: "seeds", status: "amber", evidence: "paper only" },
          { item: "metrics", status: "green", evidence: "macro F1 in repo" },
        ]}
      />
    );
    assert.match(html, /check-red/);
    assert.match(html, /check-amber/);
    assert.match(html, /check-green/);
    assert.match(html, /\[RED\]/);
    assert.match(html, /\[GREEN\]/);
  });
});
