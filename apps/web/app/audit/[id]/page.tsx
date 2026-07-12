import { Suspense } from "react";
import { AuditPageContent } from "@/components/AuditPageContent";

export default function AuditPage() {
  return (
    <Suspense fallback={<main><p>Loading audit...</p></main>}>
      <AuditPageContent />
    </Suspense>
  );
}
