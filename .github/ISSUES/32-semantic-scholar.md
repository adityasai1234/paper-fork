# [#32] Text track — Semantic Scholar (metadata + neighbors)

S2 Graph API: paper lookup + recommendations. Neighbor abstracts for context only.

## Pros

- Neighbor papers, citation metadata
- Optional `SEMANTIC_SCHOLAR_API_KEY` for rate limits

## Cons

- Not used for full paper section text
- Hardcoded `arXiv:{id}` lookup
- Neighbor abstracts too shallow for fork detection alone

## Known gaps

- [ ] DOI → S2 paper ID resolution
- [ ] Use S2 `abstract` as fallback when arXiv fetch fails
- [ ] Log S2 rate-limit / 404 in worker_report

## Acceptance criteria (user to prioritize)

- [ ] _TBD_

## Key files

- `convex/actions/runLiterature.ts`

## Labels

`buildathon`, `layer-agents`, `text-track`
