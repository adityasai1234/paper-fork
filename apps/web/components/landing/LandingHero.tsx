import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuditFlowPreview } from "./AuditFlowPreview";
import { CopyCommand } from "./CopyCommand";
import { GITHUB_REPO, QUICKSTART_COMMANDS } from "./data";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(165deg,#1a2a6e_0%,#080a10_55%)]">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 55%), repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 12px)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <h1 className="font-display text-[clamp(2.75rem,7vw,4.75rem)] uppercase leading-[0.98] tracking-[-0.02em] text-white">
            The audit that
            <br />
            finds the <em className="not-italic text-signal">fork</em>
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/75">
            Paperfork is a research audit agency with a Ruler + Workers hierarchy. Give it an arXiv
            ID or DOI plus a GitHub repo — deep Linkup search, fork rules, memory across audits,
            and a voiced verdict.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Run an audit
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/app">Start audit →</Link>
              </Button>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Open source
              </p>
              <Button asChild variant="secondary" size="lg" className="w-full border-white/20 sm:w-auto">
                <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Clone &amp; run locally
            </p>
            <CopyCommand command={QUICKSTART_COMMANDS.clone} />
            <div className="mt-2">
              <CopyCommand command={QUICKSTART_COMMANDS.dev} />
            </div>
          </div>
        </div>

        <AuditFlowPreview />
      </div>
    </section>
  );
}
