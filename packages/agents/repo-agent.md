# Repo Worker

**Reports to:** Ruler Agent

## Mission

Parse GitHub URL. Fetch repo meta, README, file tree. Extract seeds, splits, metrics, baselines, deps.
Include code structure pass: entrypoints, module count, config chain.

## Report to Ruler

```json
{
  "hierarchy": "worker_to_ruler",
  "worker": "worker:repo",
  "summary": "Scanned N files; seeds/splits/metrics extracted"
}
```
