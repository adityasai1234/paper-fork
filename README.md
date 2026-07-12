# Paperfork

Find where the paper forked from the repo.

Paperfork is a research audit agency with a **Ruler + Workers** hierarchy. The Ruler delegates Literature, Repo, and Web workers; collects their reports; and speaks the final verdict via ElevenLabs on the web report. Give it an arXiv ID or DOI plus a GitHub repository URL.

**Primary surface:** https://paperfork.getkarpathy.com (web UI + Convex backend).  
**Optional:** Hermes harness and Telegram DM trigger — see [docs/hermes-telegram.md](docs/hermes-telegram.md).

## Agent hierarchy

```
Ruler (main agent — speaks via ElevenLabs)
├── worker:literature
├── worker:repo
├── worker:web
├── worker:judge
├── worker:gap-filler
├── worker:runtime
└── worker:eval-scaler
```

Workers report up with `worker_report` events. The Ruler alone voices the Fork Report.

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
5. **Judge + gap-filler** — synthesize findings into Fork Report JSON (AI Gateway for LLM)
6. **Memory** — recall recurring gap patterns after 2+ audits per repo owner; boost judge checklist
7. **Outputs** — GitHub issue body, README patch, ElevenLabs voice brief, cron re-audit delta

---

## Partner stack

| Partner | Role |
|---------|------|
| Hermes | Optional harness: skill + webhook trigger (not audit LLM) |
| Convex | All state, scheduler, agent actions, real-time UI |
| Linkup | Web agent deep search (`LINKUP_PROMO=HERMES`) |
| Cloudflare | Next.js 15 on Pages; DNS CNAME `paperfork` |
| ElevenLabs | Voice brief on report complete + cron delta |

Power-ups: +25 each when mentors see real use in the build.

---

## Architecture

```
User (web — primary)
  → POST /audit or AuditForm → Convex createAudit
  → Ruler Agent (main)
  → delegate: worker:literature | worker:repo | worker:web (parallel)
  → workers emit worker_report to Ruler
  → fork-rules.ts (deterministic)
  → worker:judge synthesizes → worker:gap-filler drafts fixes
  → Ruler speaks verdict via ElevenLabs on report page (ruler_brief)

Optional side path: Telegram DM → Hermes harness → same /audit webhook
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

Hermes harness (optional): [docs/hermes-telegram.md](docs/hermes-telegram.md)

---

## Issue index

| # | Title | Layer | GitHub |
|---|-------|-------|--------|
| 1 | README + repo bootstrap | foundation | [#1](https://github.com/adityasai1234/paper-fork/issues/1) |
| 2 | Convex full schema + audit mutation | foundation | [#2](https://github.com/adityasai1234/paper-fork/issues/2) |
| 3 | Monorepo + Next.js + Cloudflare Pages | foundation | [#3](https://github.com/adityasai1234/paper-fork/issues/3) |
| 4 | Hermes install + gateway + Telegram | hermes | [#4](https://github.com/adityasai1234/paper-fork/issues/4) |
| 5 | Orchestrator + distributed governance | hermes | [#5](https://github.com/adityasai1234/paper-fork/issues/5) |
| 6 | paperfork-audit SKILL.md | hermes | [#6](https://github.com/adityasai1234/paper-fork/issues/6) |
| 7 | Retrofit memories | hermes | [#7](https://github.com/adityasai1234/paper-fork/issues/7) |
| 8 | Cron scheduled re-audits | hermes | [#8](https://github.com/adityasai1234/paper-fork/issues/8) |
| 9 | Literature agent | agents | [#9](https://github.com/adityasai1234/paper-fork/issues/9) |
| 10 | Repo agent + code structure | agents | [#10](https://github.com/adityasai1234/paper-fork/issues/10) |
| 11 | Web agent (Linkup) | agents | [#11](https://github.com/adityasai1234/paper-fork/issues/11) |
| 12 | Runtime verification agent | agents | [#12](https://github.com/adityasai1234/paper-fork/issues/12) |
| 13 | Deterministic fork-rules | judge | [#13](https://github.com/adityasai1234/paper-fork/issues/13) |
| 14 | Judge + gap-filler (Hermes) | judge | [#14](https://github.com/adityasai1234/paper-fork/issues/14) |
| 15 | Eval scaler (scale on failure) | judge | [#15](https://github.com/adityasai1234/paper-fork/issues/15) |
| 16 | Audit page: chips + session forensics | ui | [#16](https://github.com/adityasai1234/paper-fork/issues/16) |
| 17 | Fork Report UI | ui | [#17](https://github.com/adityasai1234/paper-fork/issues/17) |
| 18 | User requests + cron schedule card | ui | [#18](https://github.com/adityasai1234/paper-fork/issues/18) |
| 19 | ElevenLabs voice briefings | ui | [#19](https://github.com/adityasai1234/paper-fork/issues/19) |
| 20 | GitHub issue + README emit | ship | [#20](https://github.com/adityasai1234/paper-fork/issues/20) |
| 21 | Eval harness | ship | [#21](https://github.com/adityasai1234/paper-fork/issues/21) |
| 22 | Ruler Agent — main hierarchy top | hierarchy | [#22](https://github.com/adityasai1234/paper-fork/issues/22) |
| 23 | Worker agents report to Ruler | hierarchy | [#23](https://github.com/adityasai1234/paper-fork/issues/23) |
| 24 | ElevenLabs — Ruler speaks final verdict | hierarchy | [#24](https://github.com/adityasai1234/paper-fork/issues/24) |

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
- ElevenLabs voice plays on report page
- Session forensics shows full agent trace
- HTTPS at paperfork.getkarpathy.com
- Zero emojis in generated issue/README text
- Optional: Telegram side channel (not required for demo)

---

## Submit

https://growthx.club/hermes-buildathon/submit
