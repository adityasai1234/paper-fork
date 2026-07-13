export const GITHUB_REPO = "https://github.com/adityasai1234/paper-fork";

export const FEATURES = [
  {
    id: "01",
    title: "Literature",
    headline: "Read the paper like a reviewer",
    body: "arXiv metadata plus Linkup prior-art search — the literature worker builds the claim baseline before any repo diff.",
    preview: "literature" as const,
  },
  {
    id: "02",
    title: "Repo",
    headline: "Inspect the code path",
    body: "GitHub tree, README, seeds, splits, and metrics extractors. The repo worker maps what the implementation actually does versus what the PDF claims.",
    preview: "repo" as const,
  },
  {
    id: "03",
    title: "Web",
    headline: "Search beyond the PDF",
    body: "Linkup deep search across Papers With Code, HuggingFace, and author pages. The web worker finds public evidence the paper never cited.",
    preview: "web" as const,
  },
  {
    id: "04",
    title: "Fork rules",
    headline: "Run deterministic checks",
    body: "Cross-validation, seeds, metrics, and reproducibility gaps — fork rules flag misalignment before the judge ever calls an LLM.",
    preview: "fork-rules" as const,
  },
  {
    id: "05",
    title: "Judge",
    headline: "Synthesize the fork report",
    body: "Judge and gap-filler synthesize worker evidence into Fork Report JSON. Memory recalls recurring gap patterns after 2+ audits per repo owner.",
    preview: "judge" as const,
  },
  {
    id: "06",
    title: "Outputs",
    headline: "Ship the fix",
    body: "GitHub issue body, README patch, ElevenLabs voice brief, and cron re-audit deltas — ready to act on, not just read.",
    preview: "outputs" as const,
  },
] as const;

export const AGENT_TREE = `Ruler (main agent — speaks via ElevenLabs)
├── worker:literature
├── worker:repo
├── worker:web
├── worker:judge
├── worker:gap-filler
├── worker:runtime
└── worker:eval-scaler`;

export const PARTNERS = [
  { name: "Convex", role: "State, scheduler, real-time UI" },
  { name: "Linkup", role: "Web agent deep search" },
  { name: "ElevenLabs", role: "Ruler voice brief" },
  { name: "Hermes", role: "Optional harness + webhook" },
] as const;
