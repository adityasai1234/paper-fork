"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  RESEARCH_STEPS,
  researchStepStatus,
  type ResearchStepFilter,
} from "@/components/researchSteps";

export function ResearchProgress({
  runId,
  sessionId,
  activeStep = "all",
  onStepClick,
}: {
  runId: Id<"researchRuns">;
  sessionId?: string;
  activeStep?: ResearchStepFilter;
  onStepClick?: (step: ResearchStepFilter) => void;
}) {
  const progress = useQuery(api.research.getResearchLiveProgress, {
    runId,
    ...(sessionId ? { sessionId } : {}),
  });

  if (!progress) return null;

  const current = progress.run.step;

  return (
    <div className="card research-progress">
      <h2>Loop progress</h2>
      <p className="hierarchy-subtitle">
        Round {progress.run.loopRound + 1} · {progress.sourceCount} sources indexed
        {progress.run.executionConfig
          ? ` · ${progress.experimentCounts.completed}/${progress.run.executionConfig.maxExperiments} experiments · ${progress.experimentCounts.accepted} kept`
          : ""}
        {activeStep !== "all" ? ` · filtering: ${activeStep}` : ""}
      </p>
      <div className="research-step-chips">
        <span className="sr-only">Filter loop events by step</span>
        <button
          type="button"
          className={`research-step-chip ${activeStep === "all" ? "active" : ""}`}
          onClick={() => onStepClick?.("all")}
          aria-pressed={activeStep === "all"}
        >
          all
        </button>
        {RESEARCH_STEPS.map((step) => {
          const status = researchStepStatus(step, current, progress.run.status);
          const isActive = activeStep === step;
          return (
            <button
              key={step}
              type="button"
              className={`research-step-chip ${status} ${isActive ? "active" : ""}`}
              onClick={() => onStepClick?.(isActive ? "all" : step)}
              aria-pressed={isActive}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
