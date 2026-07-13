"use client";

import { useState } from "react";
import { USE_CASES } from "./data";

export function SmUseCases() {
  const [index, setIndex] = useState(0);
  const item = USE_CASES[index];
  if (!item) return null;

  const prev = () => setIndex((i) => (i === 0 ? USE_CASES.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === USE_CASES.length - 1 ? 0 : i + 1));

  return (
    <section className="sm-usecases">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉USE CASES</span>
          <span>[6/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">
          Best for latency, quality and cost.
        </h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">
          Or configurable for each audit workflow.
        </p>

        <div className="sm-usecase-panel">
          <div className="sm-usecase-controls">
            <button type="button" className="sm-usecase-btn" onClick={prev} aria-label="Previous use case">
              ←
            </button>
            <button type="button" className="sm-usecase-btn" onClick={next} aria-label="Next use case">
              →
            </button>
          </div>
          <article key={index} className="sm-usecase-card sm-swap-in">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <p className="sm-usecase-index">
              {String(index + 1).padStart(2, "0")} / {String(USE_CASES.length).padStart(2, "0")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
