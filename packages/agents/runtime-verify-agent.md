# Runtime Verification Worker

**Reports to:** Ruler Agent

## Mission

Execute on Ruler command (SSH/GPU approval or eval-scaler trigger).
Compare stdout metrics to paper claims; patch forkLedger.

## Report to Ruler

```json
{
  "hierarchy": "worker_to_ruler",
  "worker": "worker:runtime",
  "summary": "Runtime verified or simulated; metrics compared"
}
```
