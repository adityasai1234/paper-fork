# [#27] Eval-protocol fork rules + judge gateway migration

Refactor fork-rules to plugin pattern; wire methods output into judge and report.

## Acceptance criteria

- [ ] Refactor `runForkRules` to plugin pattern (`AuditContext` with literature, repo, web, methods)
- [ ] New rules: eval protocol splits/seeds/metrics/baselines vs repo signals
- [ ] `runJudge` reads `agentOutputs.methods`
- [ ] `report.evalProtocol` field on reports schema
- [ ] `forkLedger[]` optional `section`, `claimId`, `dimension`
- [ ] `buildChecklist` driven by `audit-registry` + evalProtocol (not amber defaults)
- [ ] UNVERIFIABLE adjudication via AI Gateway (soft only; regex FORKED non-negotiable)
- [ ] `buildGapFills` via AI Gateway when key present

## Depends on

#26

Labels: `buildathon`, `layer-judge`, `partner-vercel`
