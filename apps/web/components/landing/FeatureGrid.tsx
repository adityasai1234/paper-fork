"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FeaturePreview } from "@/components/art/FeaturePreview";
import { FEATURES } from "./data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function FeatureGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">Capabilities</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em]">
          Six workers. One verdict.
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Each worker owns a slice of the evidence stack. Fork rules run before the judge; memory
          recalls recurring gaps; outputs ship as GitHub drafts and a voiced Ruler brief.
        </p>

        <motion.div
          className="mt-14 grid md:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {FEATURES.map((feature) => (
            <motion.article
              key={feature.id}
              variants={reduceMotion ? undefined : item}
              className="group border-t border-white/10 p-6 md:border-l md:first:border-l-0 lg:p-8"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                #{feature.id} · {feature.title}
              </p>
              <h3 className="mt-5 font-display text-[clamp(1.35rem,2.5vw,1.75rem)] leading-[1.1] tracking-[-0.01em]">
                {feature.headline}
              </h3>
              <div className="mt-6">
                <FeaturePreview kind={feature.preview} />
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.04em] text-muted">
                {feature.body}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
