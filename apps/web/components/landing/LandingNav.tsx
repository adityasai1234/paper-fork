"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="flex items-center justify-between py-6">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Paperfork</span>
      <nav className="flex items-center gap-6 text-sm text-muted">
        <a href="#features" className="hover:text-white transition-colors">
          Features
        </a>
        <Link href="/signup" className="hover:text-white transition-colors">
          Waitlist
        </Link>
        <Button asChild size="sm">
          <Link href="/login">Start audit</Link>
        </Button>
      </nav>
    </header>
  );
}
