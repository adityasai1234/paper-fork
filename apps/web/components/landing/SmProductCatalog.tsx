"use client";

import { useState } from "react";
import { FeaturePreview } from "@/components/art/FeaturePreview";
import { FEATURES } from "./data";

export function SmProductCatalog() {
  const [active, setActive] = useState(0);
  const feature = FEATURES[active];
  if (!feature) return null;

  return (
    <section id="catalog" className="sm-catalog">
      <div className="sm-container">
        <div className="sm-catalog-card">
          <div className="sm-catalog-layout">
            <div className="sm-catalog-sidebar">
              <div className="sm-section-meta sm-section-meta--light">
                <span>〉AUDIT PIPELINE</span>
                <span>
                  [{active + 1}/{FEATURES.length}]
                </span>
              </div>

              <h2 className="sm-section-title sm-section-title--light">
                All the workers to find where the paper{" "}
                <span className="sm-text-accent">forked.</span>
              </h2>
              <p className="sm-section-subtitle sm-section-subtitle--light">
                Focused primitives for literature, repo inspection, web search, fork rules,
                judgment, and shipped outputs.
              </p>

              <ol className="sm-catalog-list">
                {FEATURES.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={
                        index === active ? "sm-catalog-list-btn is-active" : "sm-catalog-list-btn"
                      }
                      onClick={() => setActive(index)}
                    >
                      <span className="sm-catalog-list-num">{item.id}</span>
                      <span>{item.verb}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <article key={feature.id} className="sm-catalog-detail sm-swap-in">
              <div className="sm-catalog-preview">
                <FeaturePreview kind={feature.preview} />
              </div>
              <p className="sm-feature-tag sm-feature-tag--light">
                {feature.id} · {feature.tag}
              </p>
              <h3 className="sm-feature-headline sm-feature-headline--light">{feature.headline}</h3>
              <p className="sm-feature-body sm-feature-body--light">{feature.body}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
