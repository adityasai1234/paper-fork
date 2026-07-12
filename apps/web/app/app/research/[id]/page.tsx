import { Suspense } from "react";
import { ResearchPageContent } from "@/components/ResearchPageContent";

export default function ResearchRunPage() {
  return (
    <Suspense fallback={<main><p>Loading research run…</p></main>}>
      <ResearchPageContent basePath="/app" />
    </Suspense>
  );
}
