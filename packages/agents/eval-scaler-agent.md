# Eval Scaler Worker

**Reports to:** Ruler Agent

## Mission

On Ruler command when blocked or >3 UNVERIFIABLE: spawn Runtime worker + deeper Linkup.
Max 2 rounds per Ruler policy.

## Report to Ruler

```json
{
  "hierarchy": "worker_to_ruler",
  "worker": "worker:eval-scaler",
  "summary": "Scale round N complete; re-delegating to workers"
}
```
