# [#35] Text track — Regex extraction (fallback)

Deterministic claim extraction when Gateway unavailable or LLM throws.

## Pros

- Zero API cost; CI-safe (`pnpm eval`)
- Predictable for fixture rubric

## Cons

- Shallow vs semantic claims
- Weak `evalProtocol` synthesis
- Dimension assignment is pattern-only

## Known gaps

- [ ] Align regex heuristics with `AUDIT_DIMENSIONS` in audit-registry
- [ ] Share patterns between literature `extractRegexClaims` and methods `extractClaimsFromText`
- [ ] Eval: document when regex path is sufficient vs Gateway-required

## Acceptance criteria (user to prioritize)

- [ ] _TBD_

## Key files

- `convex/lib/audit-registry.ts`
- `convex/actions/runMethods.ts` (`regexMethodsOutput`, `extractClaimsFromText`)
- `packages/eval/rubric.ts`

## Labels

`buildathon`, `layer-ship`, `text-track`
