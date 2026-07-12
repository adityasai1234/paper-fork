# [#28] Literature + repo LLM migration + llm_turn forensics

Complete AI Gateway migration for remaining workers.

## Acceptance criteria

- [ ] `runRepo` optional AI Gateway pass → `repoEvalSignals` aligned to `EvalProtocolSchema`
- [ ] Standardize `worker_report` across repo/web with `AGENTS.workers.*`
- [ ] All workers emit `llm_turn` on gateway calls (literature/methods started in #26)
- [ ] `SessionForensics` renders `llm_turn` (model, tokens, worker)
- [ ] Expand `worker_report` summary in forensics UI

## Depends on

#25, #27

Labels: `buildathon`, `layer-agents`, `partner-vercel`
