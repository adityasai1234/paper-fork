import Link from "next/link";
import { GITHUB_REPO } from "@/components/landing/data";

export function SiteNav() {
  return (
    <header className="hermes-nav sticky top-0 z-20 border-b border-white/10 bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link href="/" className="shrink-0 font-display text-lg text-white no-underline hover:no-underline">
            Paperfork
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            <a href="#features" className="text-muted no-underline hover:text-white">
              Features
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted no-underline hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/signup"
            className="hidden text-sm text-muted no-underline hover:text-white sm:inline"
          >
            Waitlist
          </Link>
          <Link
            href="/login"
            className="hermes-nav-cta rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white no-underline hover:border-white/25 hover:bg-white/10 sm:px-4"
          >
            Start audit
          </Link>
        </div>
      </div>
    </header>
  );
}
