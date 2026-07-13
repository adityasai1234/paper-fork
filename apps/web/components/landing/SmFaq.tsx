"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "./data";

export function SmFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="sm-faq">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉FAQ</span>
          <span>[9/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">
          The fine print, in plain English.
        </h2>

        <div className="sm-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.id} className="sm-faq-item">
                <button
                  type="button"
                  className="sm-faq-trigger"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  <span className="sm-faq-num">{item.id}</span>
                  <span>{item.q}</span>
                  <span className={`sm-faq-chevron${expanded ? " is-open" : ""}`} aria-hidden>
                    +
                  </span>
                </button>
                <div className={`sm-faq-panel-wrap${expanded ? " is-open" : ""}`}>
                  <div className="sm-faq-panel-inner">
                    <div className="sm-faq-panel">{item.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="sm-faq-foot">Still something on your mind?</p>
      </div>
    </section>
  );
}
