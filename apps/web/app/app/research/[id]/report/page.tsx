import { Suspense } from "react";
import { ResearchReportContent } from "@/components/ResearchReportContent";

export default function ResearchReportPage() {
  return (
    <Suspense fallback={<main><p>Loading report…</p></main>}>
      <ResearchReportContent basePath="/app" />
    </Suspense>
  );
}
