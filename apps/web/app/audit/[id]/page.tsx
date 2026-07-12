import { Suspense } from "react";
import { AuditPageContent } from "@/components/AuditPageContent";

export default function AuditPage() {
  return (
    <Suspense fallback={<main className="loading-state">Loading audit…</main>}>
      <AuditPageContent />
    </Suspense>
  );
}
