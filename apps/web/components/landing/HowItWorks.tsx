"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteUrl } from "@/lib/site";
import { HOW_IT_WORKS } from "./data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-white/10 bg-surface/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-signal">Experience</p>
        <h2 className="mt-3 max-w-3xl font-display text-[clamp(2rem,4vw,3.25rem)] uppercase leading-[1.02] tracking-[-0.02em]">
          From paper and repo to fork report
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          The same pipeline runs on {siteUrl().replace(/^https?:\/\//, "")} — web app, Convex
          backend, optional Hermes webhook. Workers report up; memory compounds across audits; only
          the Ruler voices the final brief.
        </p>

        <motion.ol
          className="mt-14 grid gap-0 md:grid-cols-2 lg:grid-cols-4"
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {HOW_IT_WORKS.map((step, index) => (
            <motion.li
              key={step.step}
              variants={reduceMotion ? undefined : item}
              className="border-t border-white/10 py-8 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 lg:px-8"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                #{step.step} · {step.title}
              </p>
              <h3 className="mt-4 font-display text-2xl uppercase leading-tight tracking-[-0.01em]">
                {step.headline}
              </h3>
              <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.04em] text-muted">
                {step.body}
              </p>
              {index < HOW_IT_WORKS.length - 1 ? (
                <span className="mt-6 hidden font-mono text-[10px] text-white/25 lg:inline">
                  →
                </span>
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
