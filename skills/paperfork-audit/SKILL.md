---
name: paperfork-audit
description: Run a full paper-vs-repo fork audit. Use when user provides arXiv/DOI + GitHub URL.
compatibility: Requires Linkup API, GitHub access, Semantic Scholar, Convex, Hermes. Runs at paperfork.getkarpathy.com.
---

# Paperfork Audit Procedure

## Trigger

User provides paper ID (arXiv or DOI) and GitHub repository URL.

## Hierarchy

1. Ruler delegates workers in parallel via Convex webhook.
2. Workers report up with `worker_report` (never speak to user).
3. Ruler commands Judge worker after fork-rules gate.
4. Ruler speaks final verdict via ElevenLabs (`ruler_brief`) and relays to Telegram when `telegramChatId` is set.

## Steps

1. **Deterministic parse** (no Hermes model): message must match `audit <paperId> <githubUrl>`.
2. Run `scripts/hermes-audit.sh "$USER_MESSAGE"` OR POST Convex webhook `/audit` directly.
3. Include `telegramChatId` in webhook body when triggered from Telegram.
4. All audit LLM runs in Convex via Vercel AI Gateway with Groq fallback (`GROQ_API_KEY`); Hermes does not run audit models.
5. Run deterministic fork rules before LLM judgment.
6. Never mark FORKED items as ALIGNED.
7. Every gap_fill must cite file:line, S2 ID, or Linkup URL.
8. If execution blocked, create user_request; Ruler logs `delegate` with `action: blocked`.
9. Deliver Fork Report URL: https://paperfork.getkarpathy.com/report/{auditId}
10. Emit GitHub issue body + README patch (zero emojis).
11. Generate ElevenLabs voice brief; relay voice + URL to Telegram when configured.

## Hermes harness env

```
CONVEX_AUDIT_URL=https://<deployment>.convex.site/audit
PAPERFORK_WEBHOOK_SECRET=...
TELEGRAM_CHAT_ID=...   # optional, from incoming DM
```

## Memory

After 2+ audits for same repo owner, recall recurring gaps in memories table.

## Governance

Orchestrator enforces retry budget (max 2 scaleEval rounds), session logging, cron re-audits.

## Contact

Escalate blockers with paperfork@getkarpathy.com tone in user-facing copy.
