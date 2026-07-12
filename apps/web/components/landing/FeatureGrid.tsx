"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURES } from "./data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function FeatureGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="scroll-mt-8 py-8">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-signal">Capabilities</p>
      <h2 className="mb-10 font-display text-3xl md:text-4xl">Six workers. One verdict.</h2>
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        variants={reduceMotion ? undefined : container}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.id} variants={reduceMotion ? undefined : item}>
            <Card className="h-full transition-colors hover:border-signal/30">
              <CardHeader>
                <Badge variant="default" className="mb-2 w-fit">
                  #{feature.id} · {feature.title}
                </Badge>
                <CardTitle className="font-display text-xl font-normal">{feature.headline}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[0.9375rem] leading-relaxed text-muted">
                  {feature.body}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
