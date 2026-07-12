import Link from "next/link";

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Paperfork home">
          <span className="brand-mark" aria-hidden="true">PF</span>
          <span>Paperfork</span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          <Link className="nav-item active" href="/">
            <span className="nav-index">01</span>
            New audit
          </Link>
          <span className="nav-item muted" aria-disabled="true">
            <span className="nav-index">02</span>
            Research ledger
          </span>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          Evidence systems online
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Paper-to-repository intelligence</span>
          <span className="mono">RULER / WORKERS</span>
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
