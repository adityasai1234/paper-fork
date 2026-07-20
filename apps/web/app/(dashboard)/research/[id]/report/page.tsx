import { Suspense } from "react";
import { ResearchReportContent } from "@/components/ResearchReportContent";

export default function ResearchReportPage() {
  return (
    <Suspense fallback={<main id="main-content" className="loading-state" aria-live="polite">Loading report…</main>}>
      <ResearchReportContent />
    </Suspense>
  );
}
