# Paperfork Auto-Research Design

**Date:** 2026-07-12  
**Status:** Implemented (v1 literature loop)

## Summary

Dual-mode Paperfork: existing audit at `/app/audit/*` unchanged; new research mode at `/app/research/*` runs a prompt-driven literature loop inspired by karpathy/autoresearch (plan → execute → evaluate → iterate) without GPU training in v1.

## User flow

1. User submits free-text research prompt at `/app/research`
2. Convex creates main run + paired baseline run (prompt-only LLM, no Linkup)
3. Main run: discover (Linkup) → cite (parse sources) → synthesize (LLM) → evaluate (gaps) → repeat up to 3 rounds
4. Terminal UI streams `researchSessions` events in real time
5. Report at `/app/research/[id]/report`: prior papers, links, loop metrics, baseline comparison

## Schema

### researchRuns

| Field | Type | Notes |
|-------|------|-------|
| prompt | string | User research question |
| status | queued \| running \| done \| failed | |
| isBaseline | boolean | true = prompt-only comparison run |
| baselineRunId | optional Id | Main run points to its baseline |
| mainRunId | optional Id | Baseline points back to main (for pairing) |
| loopRound | number | Current iteration 0–3 |
| step | optional string | discover \| cite \| synthesize \| evaluate |
| sessionId | string | Demo/session gate like audits |
| error | optional string | |
| createdAt | number | |

Indexes: `by_session`, `by_created`, `by_main_run`

### researchSources

| Field | Type |
|-------|------|
| runId | Id\<researchRuns\> |
| url | string |
| title | string |
| authors | string[] optional |
| year | number optional |
| quote | string optional |
| citationKey | string |
| usedFor | string |
| round | number |

Index: `by_run`

### researchReports

| Field | Type |
|-------|------|
| runId | Id\<researchRuns\> |
| priorPapers | { title, url, citationKey, relevance }[] |
| synthesis | string |
| loopMetrics | { rounds, sourceCount, gapCount, claimsWithEvidence } |
| baselineComparison | optional { baselineRunId, sourcesAdded, claimsWithEvidence, summary } |
| createdAt | number |

Index: `by_run`

### researchSessions

Forensics log parallel to audit `sessions` (does not modify audit table).

Events: `start`, `discover`, `cite`, `synthesize`, `evaluate`, `tool_call`, `llm_turn`, `error`, `done`

## API (convex/research.ts)

| Function | Type | Purpose |
|----------|------|---------|
| createResearchRun | mutation | Create main + baseline, schedule pipeline |
| getResearchRun | query | Single run by id + session gate |
| getResearchLiveProgress | query | Run + sessions + sources count |
| listResearchSessions | query | All session events for terminal |
| getResearchReport | query | Final report |

Internal mutations: logResearchSession, patchResearchRun, insertResearchSources, insertResearchReport

## Actions

| Action | File | Role |
|--------|------|------|
| runResearchBaseline | runResearchBaseline.ts | Prompt-only LLM synthesis |
| runResearchDiscover | runResearchDiscover.ts | Linkup structured search |
| runResearchPipeline | runResearchPipeline.ts | Orchestrate loop + finalize + baseline compare |

## Linkup

- Prompt: `packages/agents/linkup-research-prompt.md` with `{{USER_PROMPT}}`
- Schema: `packages/agents/linkup-research-schema.json`
- Fallback: empty sources when `LINKUP_API_KEY` missing (pipeline continues)

## UI

| Route | Components |
|-------|------------|
| /app/research | ResearchForm |
| /app/research/[id] | ResearchTerminal, ResearchProgress |
| /app/research/[id]/report | ResearchReport |

AppShell nav: Audit \| Research

## Baseline comparison

Every main run spawns baseline with same prompt. Baseline uses LLM only. Report delta:

- sourcesAdded = main.sourceCount - baseline.sourceCount (baseline ≈ 0)
- claimsWithEvidence from loopMetrics
- summary = one-paragraph LLM or template comparison

## Deferred (post-v1)

- GPU train.py ratchet
- Auth ownerUserId scoping
- Landing page research section
