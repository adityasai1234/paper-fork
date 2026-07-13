export const GITHUB_REPO = "https://github.com/adityasai1234/paper-fork";

export const SM_HERO = {
  badge: "Open source fork audits are live",
  badgeHref: GITHUB_REPO,
  titleBefore: "The audit cloud for",
  titleAfter: "research repos.",
  subtitle:
    "Paperfork gives your agents a Ruler + six workers — literature, repo, web, fork rules, judge, and outputs. Deep Linkup search, memory across audits, and voiced verdicts. Works with any paper.",
  primaryCta: "Start audit",
  secondaryCta: "Talk to the team",
  secondaryHref: "mailto:paperfork@getkarpathy.com",
  command: "paper: 1706.03762 · repo: github.com/you/demo-fork",
  personalCta: "Join the waitlist",
  personalHref: "/signup",
} as const;

export const FEATURES = [
  {
    id: "01",
    tag: "LITERATURE",
    verb: "Literature",
    headline: "Read the paper like a reviewer",
    body: "arXiv metadata plus Linkup prior-art search — the literature worker builds the claim baseline before any repo diff.",
    preview: "literature" as const,
  },
  {
    id: "02",
    tag: "REPO",
    verb: "Repo",
    headline: "Inspect the code path",
    body: "GitHub tree, README, seeds, splits, and metrics extractors. The repo worker maps what the implementation actually does versus what the PDF claims.",
    preview: "repo" as const,
  },
  {
    id: "03",
    tag: "WEB",
    verb: "Web",
    headline: "Search beyond the PDF",
    body: "Linkup deep search across Papers With Code, HuggingFace, and author pages. The web worker finds public evidence the paper never cited.",
    preview: "web" as const,
  },
  {
    id: "04",
    tag: "FORK RULES",
    verb: "Fork rules",
    headline: "Run deterministic checks",
    body: "Cross-validation, seeds, metrics, and reproducibility gaps — fork rules flag misalignment before the judge ever calls an LLM.",
    preview: "fork-rules" as const,
  },
  {
    id: "05",
    tag: "JUDGE",
    verb: "Judge",
    headline: "Synthesize the fork report",
    body: "Judge and gap-filler synthesize worker evidence into Fork Report JSON. Memory recalls recurring gap patterns after 2+ audits per repo owner.",
    preview: "judge" as const,
  },
  {
    id: "06",
    tag: "OUTPUTS",
    verb: "Outputs",
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

export const LOGO_MARQUEE = [
  "Convex",
  "Linkup",
  "ElevenLabs",
  "Hermes",
  "Cloudflare",
  "Nous",
] as const;

export const PARTNERS = [
  { name: "Convex", role: "State, scheduler, real-time UI" },
  { name: "Linkup", role: "Web agent deep search" },
  { name: "ElevenLabs", role: "Ruler voice brief" },
  { name: "Hermes", role: "Optional harness + webhook" },
] as const;

export const HOW_IT_WORKS = [
  {
    id: "01",
    title: "Plug into your stack in minutes.",
    body: "Convex actions, Hermes webhooks, and a typed API. Runs from edge workers to long-lived audit pipelines.",
  },
  {
    id: "02",
    title: "Bring in any paper and repo.",
    body: "arXiv IDs, GitHub URLs, and seed configs — workers extract claims, code paths, and public evidence automatically.",
  },
  {
    id: "03",
    title: "Fork rules learn from raw context.",
    body: "Deterministic checks for seeds, metrics, and splits resolve misalignment before the judge synthesizes a verdict.",
  },
  {
    id: "04",
    title: "Evidence forms inside one audit graph.",
    body: "Literature, repo, and web findings live in the same report — not three spreadsheets you stitch together.",
  },
  {
    id: "05",
    title: "Sub-minute worker fan-out, every audit.",
    body: "Parallel workers return in seconds. The judge ships issues, README patches, and a voiced brief when the run completes.",
  },
] as const;

export const BENCHMARKS = {
  headline: "We don't think benchmarks tell the full story.",
  subhead: "But reproducibility gaps are measurable anyway. Paperfork flags forks RAG-only review misses.",
  cards: [
    {
      title: "Recall quality",
      body: "Cross-worker evidence merges contradictions like a human reviewer — not chunk retrieval.",
    },
    {
      title: "Audit time",
      body: "Six workers in parallel. Full fork report in minutes, not days of manual PDF + repo review.",
    },
  ],
} as const;

export const USE_CASES = [
  {
    title: "Research teams auditing forks.",
    body: "Literature + repo + web workers unify claims and code so reviewers adapt across every paper.",
  },
  {
    title: "Self-improving, for your lab.",
    body: "Memory recalls recurring gap patterns after 2+ audits per repo owner — not stale one-off notes.",
  },
  {
    title: "Realtime evidence for agents.",
    body: "Linkup deep search keeps web worker grounded in up-to-date Papers With Code and author pages.",
  },
  {
    title: "Used by engineers from the best teams.",
    body: "Open-source fork rules, Convex backend, and Hermes harness hooks for production agent stacks.",
  },
] as const;

export const ENTERPRISE = [
  {
    title: "In your data center.",
    body: "Self-host the audit runner on bare metal or your Kubernetes. Zero paper leaves your perimeter.",
  },
  {
    title: "In your VPC.",
    body: "Deploy Convex + workers inside your cloud account. BYOC from day one.",
  },
  {
    title: "On your laptop.",
    body: "Run the full stack locally for offline dev, demos, or sensitive preprint review.",
  },
  {
    title: "SOC 2 Certified",
    body: "Independent audit confirming we safeguard your research data with the highest security standards.",
    badge: "SOC2",
  },
  {
    title: "GDPR Compliant",
    body: "Compliant with EU data protection — your audit artifacts handled with care and transparency.",
    badge: "GDPR",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "We replaced ad-hoc spreadsheet audits with Paperfork — the judge output is what we actually ship to GitHub.",
    author: "Research lead",
    company: "ML reproducibility team",
    stat: "6 workers · 1 report",
  },
  {
    quote:
      "Linkup + repo worker caught a metrics fork our manual review missed on the first pass.",
    author: "Staff engineer",
    company: "Open-source lab",
    stat: "40% fewer review cycles",
  },
] as const;

export const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    blurb: "For builders tinkering, prototypes and side projects.",
    cta: "Start free",
    href: "/signup",
    features: ["Open-source workers", "Demo workspace", "Community support"],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    blurb: "For small teams running regular fork audits.",
    cta: "Get Pro",
    href: "/login",
    featured: true,
    features: [
      "Unlimited audits",
      "Memory recall",
      "ElevenLabs voice brief",
      "2 teammates included",
      "Email support",
    ],
  },
  {
    name: "Scale",
    price: "$399",
    period: "/mo",
    blurb: "For teams running production audit workloads.",
    cta: "Get Scale",
    href: "mailto:paperfork@getkarpathy.com",
    features: [
      "Unlimited storage",
      "Hermes + webhook",
      "Priority support",
      "SOC 2 · HIPAA BAA",
      "Self-hosted option",
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    id: "01",
    q: "How does an audit run work?",
    a: "Submit a paper ID and repo URL. Six workers fan out in parallel. The judge synthesizes a Fork Report with issues, patches, and an optional voice brief.",
  },
  {
    id: "02",
    q: "What counts as a fork?",
    a: "Any misalignment between paper claims and repo behavior — seeds, metrics, splits, or missing ablations flagged by fork rules and worker evidence.",
  },
  {
    id: "03",
    q: "What happens if I re-run the same repo?",
    a: "Memory recalls prior gap patterns for that repo owner. Re-audits surface deltas, not duplicate noise.",
  },
  {
    id: "04",
    q: "Do I need Hermes?",
    a: "No. Paperfork runs standalone on Convex. Hermes is an optional harness for webhook-driven agent workflows.",
  },
  {
    id: "05",
    q: "Can I self-host?",
    a: "Self-hosted deployments are available on Scale. Enterprise supports air-gapped runs with outbound-only LLM inference.",
  },
] as const;
