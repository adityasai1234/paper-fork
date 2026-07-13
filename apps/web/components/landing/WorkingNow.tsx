import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WORKING_NOW } from "./data";

export function WorkingNow() {
  return (
    <section id="working" className="scroll-mt-20 border-y border-white/10 bg-[#0c0f18] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-signal">
              Working now
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.02] tracking-[-0.02em]">
              Shipped in the open repo
            </h2>
            <p className="mt-4 text-muted">
              Paperfork is actively developed in public. These paths are wired end-to-end in{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-white/80">
                apps/web
              </code>{" "}
              and{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-white/80">
                convex/
              </code>
              .
            </p>
            <Button asChild className="mt-8" variant="secondary">
              <Link href="/login">Try the live app →</Link>
            </Button>
          </div>

          <ul className="grid gap-0 sm:grid-cols-2">
            {WORKING_NOW.map((item) => (
              <li
                key={item.label}
                className="border-t border-white/10 py-5 pr-4 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
              >
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
