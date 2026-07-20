import { Suspense } from "react";
import { ResearchPageContent } from "@/components/ResearchPageContent";

export default function ResearchRunPage() {
  return (
    <Suspense fallback={<main id="main-content" className="loading-state" aria-live="polite">Loading research run…</main>}>
      <ResearchPageContent />
    </Suspense>
  );
}
