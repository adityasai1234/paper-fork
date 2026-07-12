# Worker agents report to Ruler

Literature, Repo, Web, Judge, Gap-Filler, Runtime, Eval-Scaler workers each emit `worker_report` to Ruler.

## Acceptance criteria

- [x] Worker prompts document `reportsTo: Ruler`
- [x] Session events: `delegate`, `worker_report`, `ruler_brief`
- [x] Literature worker logs worker_report on completion
- [ ] All workers log worker_report with summary payload
- [x] SessionForensics UI splits Ruler vs Workers tables

## Labels

`buildathon`, `layer-hierarchy`, `layer-agents`
