# [#33] Text track — arXiv HTML (section-level body)

Hybrid deep fetch: `https://arxiv.org/html/{id}` → heading-based section parse → `worker:methods`.

## Pros

- Section-level text without PDF dependency
- Lazy fetch gated by `shouldFetchFullText`
- Feeds `evalProtocol` + `sectionClaims`

## Cons

- Many papers have no HTML version (404)
- Naive tag-strip + heading regex parser
- Silent fallback to abstract-only when HTML missing
- Non-standard layouts break section detection

## Known gaps

- [ ] `text-track-probe` script: report abstract/html/s2 coverage per arXiv ID
- [ ] Log HTML 404 vs parse-empty in methods worker_report
- [ ] Improve `parseHtmlSections` (arXiv HTML structure, not line headings only)
- [ ] PDF or LaTeX fallback when HTML unavailable (separate issues later)

## Acceptance criteria (user to prioritize)

- [ ] _TBD_

## Key files

- `convex/lib/paper-fetch.ts`
- `convex/actions/runMethods.ts`
- `convex/lib/audit-registry.ts` (`shouldFetchFullText`)

## Labels

`buildathon`, `layer-agents`, `text-track`
