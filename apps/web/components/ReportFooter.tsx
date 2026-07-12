import { GITHUB_REPO } from "@/components/landing/data";
import { contactEmail } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ReportFooter({ className }: { className?: string }) {
  const isMarketing = className?.includes("marketing-footer");

  return (
    <footer className={cn(isMarketing ? className : "report-footer", !isMarketing && className)}>
      <div
        className={cn(
          "report-footer-inner",
          isMarketing && "report-footer-inner--dark",
        )}
      >
        <div>
          <p className="report-footer-eyebrow">Paperfork · open source research audit</p>
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
