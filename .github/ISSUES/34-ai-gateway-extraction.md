# [#34] Text track — AI Gateway LLM extraction

Structured extraction via Vercel AI Gateway: abstract (literature), per-section (methods), repo signals.

## Pros

- Zod-validated `evalProtocol` + dimension-tagged claims
- `llm_turn` forensics in sessions
- Best micro-audit depth

## Cons

- Requires `AI_GATEWAY_API_KEY`; cost + latency
- One LLM call per section in methods worker
- CI runs regex path without key (`--no-llm`)

## Known gaps

- [ ] Chunking strategy for sections > 48k chars
- [ ] Retry / model failover telemetry in report UI
- [ ] Optional dry-run mode for eval with mocked Gateway responses
- [ ] Consolidate duplicate abstract extraction (literature LLM + methods)

## Acceptance criteria (user to prioritize)

- [ ] _TBD_

## Key files

- `convex/lib/ai-gateway.ts`
- `convex/actions/runLiterature.ts`
- `convex/actions/runMethods.ts`
- `convex/actions/runRepo.ts`

## Labels

`buildathon`, `layer-agents`, `partner-vercel`, `text-track`
