import Link from "next/link";
import { GITHUB_REPO } from "@/components/landing/data";
import { routes } from "@/lib/routes";

export function AppShell({
  eyebrow,
  title,
  description,
  activeNav = "audit",
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  activeNav?: "audit" | "research";
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="brand" href="/" aria-label="Paperfork home">
            <span className="brand-mark" aria-hidden="true">pf/</span>
            <span>Paperfork</span>
          </Link>
          <nav className="app-nav" aria-label="Workspace navigation">
          <Link
            className={`nav-item${activeNav === "audit" ? " active" : ""}`}
            href={routes.audits()}
            aria-current={activeNav === "audit" ? "page" : undefined}
          >
            Audit
          </Link>
          <Link
            className={`nav-item${activeNav === "research" ? " active" : ""}`}
            href={routes.research()}
            aria-current={activeNav === "research" ? "page" : undefined}
          >
            Research
          </Link>
          </nav>
          <a
            className="app-header-link"
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>
      <div className="workspace">
        <main className="main-surface" id="main-content">
          <header className="page-header">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description ? <p className="page-description">{description}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
