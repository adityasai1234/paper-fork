import { GITHUB_REPO } from "@/components/landing/data";

export function ReportFooter({ className }: { className?: string }) {
  return (
    <footer className={className}>
      <div className="flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
            Paperfork · open source research audit
          </p>
          <p className="mt-2">paperfork@getkarpathy.com</p>
        </div>
        <p>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            github.com/adityasai1234/paper-fork
          </a>
        </p>
      </div>
    </footer>
  );
}
