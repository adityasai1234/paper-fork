import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForkMotif } from "@/components/art/ForkMotif";
import { HeroArtPanel } from "@/components/art/HeroArtPanel";
import { HeroVignette } from "@/components/art/HeroVignette";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <HeroVignette />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="relative">
          <ForkMotif className="absolute -left-4 top-0 h-32 w-24 opacity-60" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            #01 · Audit
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.02em] text-white">
            Find where the paper
            <br />
            <em className="italic text-signal">forked</em> from the repo
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
            Paperfork is a research audit agency with a Ruler + Workers hierarchy. Give it an
            arXiv ID or DOI plus a GitHub repo — deep Linkup search, fork rules, memory across
            audits, and a voiced verdict.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/login">Start audit →</Link>
            </Button>
          </div>
          <p className="mt-10 font-mono text-xs tracking-wide text-muted">
            arxiv · github · fork report · voice brief
          </p>
        </div>
        <HeroArtPanel />
      </div>
    </section>
  );
}
