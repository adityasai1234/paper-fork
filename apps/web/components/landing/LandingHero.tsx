import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative pb-16 pt-4">
      <div
        className="pointer-events-none absolute -top-8 left-1/2 h-[280px] w-full max-w-[520px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(77,107,255,0.08)_0%,transparent_70%)]"
        aria-hidden
      />
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.08em] text-signal">Audit</p>
      <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.02em]">
        Find where the paper
        <br />
        forked from the <em className="italic">repo</em>
      </h1>
      <p className="mt-4 max-w-[42ch] text-[1.0625rem] leading-relaxed text-muted">
        Draft the merge commit. Paperfork audits alignment between papers and GitHub repos — then
        voices the verdict.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/login">Start audit</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/signup">Join waitlist</Link>
        </Button>
      </div>
      <p className="mt-10 font-mono text-xs tracking-wide text-muted">
        arxiv · github · fork report · voice brief
      </p>
    </section>
  );
}
