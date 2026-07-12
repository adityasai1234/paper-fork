"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GITHUB_REPO } from "./data";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-sm uppercase tracking-[0.14em] text-white">
            Paperfork
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.08em] text-muted md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Workers
            </a>
            <a href="#working" className="transition-colors hover:text-white">
              Working now
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">Waitlist</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app">Start audit →</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
