export const GITHUB_REPO = "https://github.com/adityasai1234/paper-fork";

export const QUICKSTART_COMMANDS = {
  clone: "git clone https://github.com/adityasai1234/paper-fork.git && cd paper-fork",
  dev: "pnpm install && cp .env.example .env.local && npx convex dev",
} as const;

export const FEATURES = [
  {
    id: "01",
    title: "Literature",
    headline: "Read the paper like a reviewer",
    body: "arXiv metadata plus Linkup prior-art search — the literature worker builds the claim baseline before any repo diff.",
    accent: "from-signal/30 via-signal/10 to-transparent",
  },
  {
    id: "02",
    title: "Repo",
    headline: "Inspect the code path",
    body: "GitHub tree, README, seeds, splits, and metrics extractors. The repo worker maps what the implementation actually does versus what the PDF claims.",
    accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    id: "03",
    title: "Web",
    headline: "Search beyond the PDF",
    body: "Linkup deep search across Papers With Code, HuggingFace, and author pages. The web worker finds public evidence the paper never cited.",
    accent: "from-sky-500/20 via-sky-500/5 to-transparent",
  },
  {
    id: "04",
    title: "Fork rules",
    headline: "Run deterministic checks",
    body: "Cross-validation, seeds, metrics, and reproducibility gaps — fork rules flag misalignment before the judge ever calls an LLM.",
    accent: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  {
    id: "05",
    title: "Judge",
    headline: "Synthesize the fork report",
    body: "Judge and gap-filler synthesize worker evidence into Fork Report JSON — verdict, ledger rows, and draft fixes for maintainers.",
    accent: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  {
    id: "06",
    title: "Memory",
    headline: "Context that compounds",
    body: "After two or more audits for the same repo owner, Paperfork recalls recurring gap patterns from the ledger and boosts the judge checklist.",
    accent: "from-indigo-500/20 via-indigo-500/5 to-transparent",
  },
  {
    id: "07",
    title: "Outputs",
    headline: "Ship the fix",
    body: "GitHub issue body, README patch, ElevenLabs voice brief, and cron re-audit deltas — ready to act on, not just read.",
    accent: "from-rose-500/20 via-rose-500/5 to-transparent",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit",
    headline: "Paper ID + repo URL",
    body: "Drop an arXiv ID or DOI and the GitHub repository URL. Convex creates an audit, session, and real-time subscription in one mutation.",
  },
  {
    step: "02",
    title: "Delegate",
    headline: "Ruler fans out workers",
    body: "Literature, repo, and web workers run in parallel. Each emits worker_report events; session forensics logs every tool call and LLM turn.",
  },
  {
    step: "03",
    title: "Verify",
    headline: "Fork rules, then judge",
    body: "Deterministic fork-rules.ts checks seeds, splits, and metrics. Judge + gap-filler synthesize a Fork Report with FORKED / ALIGNED / UNVERIFIABLE verdicts.",
  },
  {
    step: "04",
    title: "Deliver",
    headline: "Report + memory + voice brief",
    body: "The Ruler speaks the verdict via ElevenLabs on the report page. GitHub issue drafts, README patches, and recalled gap patterns ship with every audit — context that sticks.",
  },
] as const;

export const WORKING_NOW = [
  {
    label: "Live web audits",
    detail: "Convex-backed audit form, real-time progress, and fork reports.",
  },
  {
    label: "Agent hierarchy UI",
    detail: "Ruler + worker chips pulse live as literature, repo, and web agents complete.",
  },
  {
    label: "Session forensics",
    detail: "Every delegate, tool call, and worker_report streamed to the audit page.",
  },
  {
    label: "Pattern memory",
    detail: "Recurring gaps per repo owner are recalled after 2+ audits and boost the judge checklist.",
  },
  {
    label: "Fork report JSON",
    detail: "Verdict ledger, eval protocol, neighbors, gap fills, and repro appendix.",
  },
  {
    label: "Voice brief",
    detail: "ElevenLabs audio summary when the Ruler finishes the fork report.",
  },
  {
    label: "GitHub outputs",
    detail: "Issue body and README patch drafts generated from audit findings.",
  },
  {
    label: "Hermes ingress",
    detail: "Optional webhook + Telegram path into the same /audit pipeline.",
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
