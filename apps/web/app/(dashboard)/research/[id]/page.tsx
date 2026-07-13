import { Suspense } from "react";
import { ResearchPageContent } from "@/components/ResearchPageContent";

export default function ResearchRunPage() {
  return (
    <Suspense fallback={<main className="loading-state">Loading research run…</main>}>
      <ResearchPageContent />
    </Suspense>
  );
}
