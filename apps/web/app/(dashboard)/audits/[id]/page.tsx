import { Suspense } from "react";
import { AuditPageContent } from "@/components/AuditPageContent";

export default function AuditDetailPage() {
  return (
    <Suspense fallback={<main id="main-content" className="loading-state" aria-live="polite">Loading audit…</main>}>
      <AuditPageContent />
    </Suspense>
  );
}
