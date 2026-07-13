import { Suspense } from "react";
import { ResearchReportContent } from "@/components/ResearchReportContent";

export default function ResearchReportPage() {
  return (
    <Suspense fallback={<main className="loading-state">Loading report…</main>}>
      <ResearchReportContent />
    </Suspense>
  );
}
