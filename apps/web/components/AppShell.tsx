import Link from "next/link";
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
      <aside className="sidebar">
        <Link className="brand" href={routes.research()} aria-label="Paperfork home">
          <span className="brand-mark" aria-hidden="true">PF</span>
          <span>Paperfork</span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          <Link
            className={`nav-item${activeNav === "audit" ? " active" : ""}`}
            href={routes.audits()}
          >
            <span className="nav-index">01</span>
            Audit
          </Link>
          <Link
            className={`nav-item${activeNav === "research" ? " active" : ""}`}
            href={routes.research()}
          >
            <span className="nav-index">02</span>
            Research
          </Link>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          Evidence systems online
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Context-enriched autoresearch</span>
          <span className="mono">LINKUP / CONVEX</span>
        </header>
        <main className="main-surface">
          <header className="page-header">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
