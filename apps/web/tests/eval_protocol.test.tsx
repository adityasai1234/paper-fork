/** @jsxImportSource react */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { EvalProtocol } from "../components/EvalProtocol";

describe("EvalProtocol", () => {
  it("returns empty markup when protocol is undefined", () => {
    const html = renderToStaticMarkup(<EvalProtocol protocol={undefined} />);
    assert.equal(html, "");
  });

  it("renders evaluation heading and protocol fields", () => {
    const html = renderToStaticMarkup(
      <EvalProtocol
        protocol={{
          summary: "5-fold CV with macro F1.",
          splits: "5-fold cross-validation",
          seeds: "42, 123, 456",
          metrics: ["macro F1", "accuracy"],
          baselines: ["BERT-base"],
          datasets: ["SST-2"],
        }}
      />
    );
    assert.match(html, /How are you evaluating your model\?/);
    assert.match(html, /5-fold cross-validation/);
    assert.match(html, /macro F1/);
    assert.match(html, /BERT-base/);
  });
});
