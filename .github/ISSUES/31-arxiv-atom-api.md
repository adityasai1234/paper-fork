# [#31] Text track — arXiv Atom API (abstract + metadata)

Literature worker entry point: `export.arxiv.org/api/query` → title, abstract, `abstract_claims`.

## Pros

- Free, fast, stable
- Seeds `abstract_claims` for fork-rules and `shouldFetchFullText` gate

## Cons

- Abstract-only (no methods/experiments body)
- arXiv-only path (DOI in schema not wired here)
- Fragile XML regex parse (no Atom parser)

## Known gaps

- [ ] Proper Atom/XML parser vs regex on raw response
- [ ] DOI paperId path when `paperIdType === "doi"`
- [ ] Surface fetch/parse failures in session forensics (not silent empty abstract)

## Acceptance criteria (user to prioritize)

- [ ] _TBD — owner picks which gaps to close_

## Key files

- `convex/actions/runLiterature.ts`
- `convex/lib/audit-registry.ts` (`extractRegexClaims`, `shouldFetchFullText`)

## Labels

`buildathon`, `layer-agents`, `text-track`
