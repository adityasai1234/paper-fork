# [#26] Hybrid paper-fetch + worker:methods

Section-level paper micro-audit via arXiv HTML + `worker:methods`.

## Acceptance criteria

- [x] `convex/lib/paper-fetch.ts` — hybrid fetch, section parsing
- [x] `convex/actions/runMethods.ts` — AI Gateway or regex fallback
- [x] `runLiterature` schedules methods when `shouldFetchFullText`
- [x] Schema: `methods` agent output, optional `methods` chip
- [x] `tryScheduleJudge` waits for methods when `methodsScheduled`

## Depends on

#25

Labels: `buildathon`, `layer-agents`, `partner-vercel`
