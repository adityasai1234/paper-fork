---
name: paperfork-audit
description: Run a full paper-vs-repo fork audit. Use when user provides arXiv/DOI + GitHub URL.
compatibility: Requires Linkup API, GitHub access, Semantic Scholar, Convex, Hermes. Runs at paperfork.getkarpathy.com.
---

# Paperfork Audit Procedure

## Trigger

User provides paper ID (arXiv or DOI) and GitHub repository URL.

## Steps

1. Fan out Literature, Repo, Web agents in parallel via Hermes orchestrator.
2. Trigger audit via Convex webhook: POST /audit with paperId + githubUrl.
3. Run deterministic fork rules before LLM judgment.
3. Never mark FORKED items as ALIGNED.
4. Every gap_fill must cite file:line, S2 ID, or Linkup URL.
5. If execution blocked, create user_request — do not simulate without approval.
6. Deliver Fork Report URL: https://paperfork.getkarpathy.com/report/{auditId}
7. Emit GitHub issue body + README patch (zero emojis).
8. Generate ElevenLabs voice brief on completion.

## Memory

After 2+ audits for same repo owner, recall recurring gaps in memories table.

## Governance

Orchestrator enforces retry budget (max 2 scaleEval rounds), session logging, cron re-audits.

## Contact

Escalate blockers with paperfork@getkarpathy.com tone in user-facing copy.
