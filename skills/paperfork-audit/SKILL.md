---
name: paperfork-audit
description: Run a full paper-vs-repo fork audit. Use when user provides arXiv/DOI + GitHub URL.
compatibility: Requires Convex, GitHub, Semantic Scholar, Linkup. Web UI at paperfork.getkarpathy.com. Hermes/Telegram optional.
---

# Paperfork Audit Procedure

## Trigger

User provides paper ID (arXiv or DOI) and GitHub repository URL.

**Primary:** web UI or direct `POST /audit` to Convex.  
**Optional:** Hermes skill / Telegram DM via `scripts/hermes-audit.sh` (side channel).

## Hierarchy

1. Ruler delegates workers in parallel via Convex.
2. Workers report up with `worker_report` (never speak to user).
3. Ruler commands Judge worker after fork-rules gate.
4. Ruler speaks final verdict via ElevenLabs on the web report (`ruler_brief`).
5. Optional: relay URL/voice to Telegram when `telegramChatId` was set at ingress.

## Steps

1. Parse `audit <paperId> <githubUrl>` deterministically (no Hermes model), or use web form.
2. POST Convex `/audit` webhook — Convex fans out workers (literature, repo, web, methods).
3. All audit LLM runs in Convex (AI Gateway + optional Groq fallback). Hermes does not run audit models.
4. Run deterministic fork rules before LLM judgment.
5. Never mark FORKED items as ALIGNED.
6. Deliver Fork Report URL: https://paperfork.getkarpathy.com/report/{auditId}
7. Emit GitHub issue body + README patch (zero emojis).
8. Generate ElevenLabs voice brief on report page.

## Optional Hermes harness env

```
CONVEX_AUDIT_URL=https://<deployment>.convex.site/audit
PAPERFORK_WEBHOOK_SECRET=...
TELEGRAM_CHAT_ID=...   # side feature only — omit for web-only audits
```

## Memory

After 2+ audits for same repo owner, recall recurring gaps in memories table.

## Governance

Orchestrator enforces retry budget (max 2 scaleEval rounds), session logging, cron re-audits.

## Contact

Escalate blockers with paperfork@getkarpathy.com tone in user-facing copy.
