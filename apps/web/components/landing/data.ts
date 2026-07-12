export const FEATURES = [
  {
    id: "01",
    title: "Literature",
    headline: "Read the paper like a reviewer",
    body: "arXiv and Semantic Scholar metadata, neighbor papers, and abstract claims — the literature worker builds the claim baseline.",
  },
  {
    id: "02",
    title: "Repo",
    headline: "Inspect the code path",
    body: "GitHub tree, README, seeds, splits, and metrics extractors. The repo worker maps what the implementation actually does.",
  },
  {
    id: "03",
    title: "Web",
    headline: "Search beyond the PDF",
    body: "Linkup deep search across Papers With Code, HuggingFace, and author pages. The web worker finds public evidence the paper omits.",
  },
  {
    id: "04",
    title: "Fork rules",
    headline: "Run deterministic checks",
    body: "Cross-validation, seeds, metrics, and reproducibility gaps — fork rules flag misalignment before any LLM verdict.",
  },
  {
    id: "05",
    title: "Judge",
    headline: "Synthesize the fork report",
    body: "Judge and gap-filler merge worker outputs into a Fork Report JSON with verdict, ledger, and draft merge commits.",
  },
  {
    id: "06",
    title: "Outputs",
    headline: "Ship the merge commit",
    body: "GitHub issue body, README patch, ElevenLabs voice brief, and cron re-audit deltas — ready to act on.",
  },
] as const;

export const PARTNERS = ["Convex", "Linkup", "ElevenLabs", "Hermes"] as const;
