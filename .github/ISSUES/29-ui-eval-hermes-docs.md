# [#29] UI EvalProtocol panel + eval fixtures + Hermes harness docs

Surface micro-audit results in Fork Report; extend CI; align Hermes docs.

## Acceptance criteria

- [ ] `apps/web/components/EvalProtocol.tsx` — "how are you evaluating your model?"
- [ ] `ForkLedger` columns: Section, Dimension
- [ ] Report page: `<EvalProtocol />` above `<ForkLedger />`
- [ ] `packages/eval/rubric.ts` — `FIXTURE_METHODS`, per-rule assertions
- [ ] `run.mjs` — deterministic `--no-llm` path
- [ ] `docs/hermes-telegram.md` — harness-only; no `hermes model` for audits
- [ ] `skills/paperfork-audit/SKILL.md` — Hermes triggers webhook; Convex executes; Gateway models

## Depends on

#27

Labels: `buildathon`, `layer-ui`, `partner-hermes`, `partner-vercel`
