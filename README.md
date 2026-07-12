# Paperfork

Find where the paper forked from the repo — and draft the merge commit.

Paperfork is a Hermes-powered research audit agency. Give it an arXiv ID or DOI plus a GitHub repository URL. It fans out Literature, Repo, and Web agents in parallel, runs deterministic fork rules, judges gaps with Hermes, and delivers a Fork Report with GitHub issue drafts and README patches.

**Live:** https://paperfork.getkarpathy.com  
**Contact:** paperfork@getkarpathy.com  
**Buildathon track:** AI as Agency  
**Handbook:** https://growthx.club/docs/hermes-buildathon-builder-handbook

---

## What it does

1. **Literature agent** — arXiv + Semantic Scholar paper metadata, neighbor papers, abstract claims
2. **Repo agent** — GitHub tree, README, seeds/splits/metrics extractors, code structure pass
3. **Web agent** — Linkup deep search for Papers With Code, HuggingFace, author pages
4. **Fork rules** — deterministic checks (cross-validation, seeds, metrics, repro gaps)
5. **Judge + gap-filler** — Hermes merges findings into Fork Report JSON
6. **Outputs** — GitHub issue body, README patch, ElevenLabs voice brief, cron re-audit delta

---

## Partner stack

| Partner | Role |
|---------|------|
| Hermes | Orchestrator, governance, Telegram, memory, cron, judge LLM |
| Convex | All state, scheduler, agent actions, real-time UI |
| Linkup | Web agent deep search (`LINKUP_PROMO=HERMES`) |
| Cloudflare | Next.js 15 on Pages; DNS CNAME `paperfork` |
| ElevenLabs | Voice brief on report complete + cron delta |

Power-ups: +25 each when mentors see real use in the build.

---

## Architecture

```
User (web or Telegram)
  → Hermes orchestrator
  → parallel: Literature | Repo+structure | Web(Linkup)
  → fork-rules.ts (deterministic, non-negotiable)
  → load memories for repo owner
  → Judge (Hermes) → scaleEval on failure (max 2 rounds)
  → gap-filler → report + GitHub issue + README patch + voice
  → retrofit memories → optional cron re-audit
```

All tables (`audits`, `agentOutputs`, `reports`, `userRequests`, `sessions`, `memories`, `cronJobs`, `githubOutputs`) exist from schema day one. Session forensics logs every agent step. Memories recall recurring gaps per repo owner.

---

## Repo structure

```
paper-fork/
├── apps/web/                 # Next.js 15 → Cloudflare Pages
├── packages/agents/          # orchestrator + specialist prompts
├── packages/eval/            # fixture rubric + runner
├── convex/                   # schema, mutations, actions
├── skills/paperfork-audit/   # Hermes procedural memory
└── .env.example
```

---

## Environment variables

See [`.env.example`](.env.example).

---

## Development

```bash
pnpm install
cp .env.example .env.local   # fill keys
npx convex dev                 # backend + HTTP /audit webhook
pnpm dev                       # frontend
pnpm eval                      # fixture rubric
```

Hermes + Telegram setup: [docs/hermes-telegram.md](docs/hermes-telegram.md)

---

## Issue index

| # | Title | Layer |
|---|-------|-------|
| 1 | README + repo bootstrap | foundation |
| 2 | Convex full schema + audit mutation | foundation |
| 3 | Monorepo + Next.js + Cloudflare Pages | foundation |
| 4 | Hermes install + gateway + Telegram | hermes |
| 5 | Orchestrator + distributed governance | hermes |
| 6 | paperfork-audit SKILL.md | hermes |
| 7 | Retrofit memories | hermes |
| 8 | Cron scheduled re-audits | hermes |
| 9 | Literature agent | agents |
| 10 | Repo agent + code structure | agents |
| 11 | Web agent (Linkup) | agents |
| 12 | Runtime verification agent | agents |
| 13 | Deterministic fork-rules | judge |
| 14 | Judge + gap-filler (Hermes) | judge |
| 15 | Eval scaler (scale on failure) | judge |
| 16 | Audit page: chips + session forensics | ui |
| 17 | Fork Report UI | ui |
| 18 | User requests + cron schedule card | ui |
| 19 | ElevenLabs voice briefings | ui |
| 20 | GitHub issue + README emit | ship |
| 21 | Eval harness | ship |
| 22 | Demo seed + production deploy | ship |

---

## Stage demo script

1. Open paperfork.getkarpathy.com
2. Paste arXiv ID + `github.com/you/demo-fork`
3. Click **Find the fork**
4. Watch Literature / Repo / Web chips turn green
5. Land on Fork Report: RED macro F1 in eval.py, neighbor table, README gap fill
6. Scroll to SSH request; click **Approve**; metric line updates
7. Listen to ElevenLabs voice brief
8. Close: *The fork was always there. Paperfork just made it visible.*

---

## Quality gates

- Every FORKED item has file:line or paper quote
- 3+ real Semantic Scholar neighbor IDs
- Seeded broken repo is not all-green
- Linkup source in report
- Hermes live: Telegram audit or memory recall on repeat owner
- ElevenLabs voice plays on report
- Session forensics shows full agent trace
- HTTPS at paperfork.getkarpathy.com
- Zero emojis in generated issue/README text

---

## Submit

https://growthx.club/hermes-buildathon/submit
