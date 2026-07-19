import { GITHUB_REPO } from "@/components/landing/data";
import { contactEmail } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ReportFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("report-footer", className)}>
      <div className="report-footer-inner">
        <div>
          <p className="report-footer-eyebrow">Paperfork · open-source research evidence</p>
          <p className="report-footer-contact">{contactEmail}</p>
        </div>
        <p>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="report-footer-link"
          >
            github.com/adityasai1234/paper-fork
          </a>
        </p>
      </div>
    </footer>
  );
}
