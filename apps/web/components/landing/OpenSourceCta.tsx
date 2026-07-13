import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyCommand } from "./CopyCommand";
import { GITHUB_REPO, QUICKSTART_COMMANDS } from "./data";

export function OpenSourceCta() {
  return (
    <section className="border-b border-white/10 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 rounded-2xl border border-signal/25 bg-[linear-gradient(135deg,rgba(77,107,255,0.12),rgba(8,10,16,0.9))] p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-signal">
              Open source
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-tight tracking-[-0.02em] md:text-4xl">
              Fork it. Run it. Ship audits.
            </h2>
            <p className="mt-4 max-w-lg text-muted">
              Paperfork is MIT-licensed and built in the open at Nous Research&apos;s Hermes buildathon
              track. Clone the monorepo, point Convex at your keys, and run the same agent hierarchy
              locally.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                  github.com/adityasai1234/paper-fork
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Start audit</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Quickstart
            </p>
            <CopyCommand command={QUICKSTART_COMMANDS.clone} />
            <CopyCommand command={QUICKSTART_COMMANDS.dev} />
            <p className="pt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-muted">
              Then open localhost:3000 · submit paper + repo · watch workers live
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
