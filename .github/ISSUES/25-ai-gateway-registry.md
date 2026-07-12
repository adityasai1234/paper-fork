# [#25] AI Gateway shim + audit-registry + env

Foundation for micro-audit LLM via Vercel AI Gateway (not Hermes models).

## Acceptance criteria

- [x] `convex/lib/ai-gateway.ts` — `extractStructured`, `isLlmAvailable`, `llmTurnPayload`
- [x] `convex/lib/audit-registry.ts` — dimensions, Zod schemas, `shouldFetchFullText`
- [x] `convex/package.json` — `ai`, `@ai-sdk/gateway`, `zod`
- [x] `.env.example` — `AI_GATEWAY_API_KEY`, `PAPERFORK_LLM_MODEL`; Hermes harness-only
- [x] `scripts/log.sh` + `.audit/micro-audit.tsv`

## Env

Set `AI_GATEWAY_API_KEY` in Convex dashboard for production LLM extraction.

Labels: `buildathon`, `layer-agents`, `partner-vercel`
