import { AppShell } from "@/components/AppShell";
import { AuditForm } from "@/components/AuditForm";
import { ReportFooter } from "@/components/ReportFooter";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="New evidence audit"
      title="Trace the distance between a paper and its code."
      description="Paperfork assembles primary research evidence, inspects the implementation, and records every material divergence in a reviewable ledger."
    >
      <div className="audit-grid">
        <AuditForm />
        <aside className="context-panel" aria-label="Audit coverage">
          <h2>Audit coverage</h2>
          <ul className="context-list">
            <li><strong>Paper protocol</strong>Datasets, splits, seeds, metrics, baselines, hardware, and checkpoints.</li>
            <li><strong>Repository evidence</strong>Concrete files, configurations, scripts, and line-level implementation signals.</li>
            <li><strong>External record</strong>Author pages, model cards, leaderboards, corrections, and credible reproductions.</li>
            <li><strong>Final artifact</strong>A deterministic fork ledger with evidence-backed remediation drafts.</li>
          </ul>
        </aside>
      </div>
      <ReportFooter />
    </AppShell>
  );
}
