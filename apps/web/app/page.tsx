import { AuditForm } from "@/components/AuditForm";
import { ReportFooter } from "@/components/ReportFooter";

export default function HomePage() {
  return (
    <main>
      <h1>Paperfork</h1>
      <p className="subtitle">
        Find where the paper forked from the repo — and draft the merge commit.
      </p>
      <AuditForm />
      <ReportFooter />
    </main>
  );
}
