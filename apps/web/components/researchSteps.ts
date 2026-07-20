export const RESEARCH_STEPS = [
  "discover",
  "cite",
  "synthesize",
  "experiment",
  "evaluate",
] as const;

export type ResearchStep = (typeof RESEARCH_STEPS)[number];
export type ResearchStepFilter = ResearchStep | "all";

export const STEP_EVENTS: Record<ResearchStep, string[]> = {
  discover: ["discover", "tool_call"],
  cite: ["cite"],
  synthesize: ["synthesize", "llm_turn"],
  experiment: ["experiment"],
  evaluate: ["evaluate"],
};

export function researchStepStatus(
  step: ResearchStep,
  current: ResearchStep | undefined,
  runStatus: string
): "pending" | "running" | "done" {
  if (runStatus === "done") return "done";
  if (runStatus === "failed") return current === step ? "running" : "pending";

  const stepIndex = RESEARCH_STEPS.indexOf(step);
  const currentIndex = current ? RESEARCH_STEPS.indexOf(current) : -1;

  if (current === step) return "running";
  if (currentIndex > stepIndex) return "done";
  return "pending";
}
