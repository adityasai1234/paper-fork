export const GITHUB_REPO = "https://github.com/adityasai1234/paper-fork";

export const PRODUCT_PATHS = [
  {
    label: "Audit",
    title: "Compare a paper with its repository",
    body: "Trace claims, datasets, splits, seeds, metrics, and baselines back to inspectable paper and code evidence.",
    output: "Fork ledger + reproducibility report",
    href: "/login",
    cta: "Start an audit",
  },
  {
    label: "Research",
    title: "Test source-backed ideas against a metric",
    body: "Let Websearch propose grounded changes, lease each experiment to a Hermes worker, and keep only measured improvements.",
    output: "Experiment ledger + surviving commit",
    href: "/login",
    cta: "Open the research loop",
  },
] as const;

export const RESEARCH_LOOP_STEPS = [
  {
    label: "Search",
    body: "Linkup retrieves prior work and proposes candidates that cite the sources it actually found.",
  },
  {
    label: "Lease",
    body: "Convex queues one reproducible baseline or candidate job for a trusted cloud worker.",
  },
  {
    label: "Measure",
    body: "Hermes runs the fixed command, hardware class, time limit, dataset, and metric contract.",
  },
  {
    label: "Decide",
    body: "Paperfork keeps a commit only when the configured metric improves; failures inform the next search.",
  },
] as const;
