import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GITHUB_REPO } from "./data";

export function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 border border-white/10 bg-surface/60 p-8 md:flex-row md:items-center md:p-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-signal">
              Ready
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[-0.02em] md:text-4xl">
              Find where the paper forked
            </h2>
            <p className="mt-3 max-w-lg text-muted">
              Sign in to run a live audit, or clone the repo and wire your own Convex deployment.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/app/research">Start audit →</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
