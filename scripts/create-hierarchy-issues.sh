#!/usr/bin/env bash
# Create hierarchy + ElevenLabs issues (#22-24)
set -euo pipefail
REPO="adityasai1234/paper-fork"

gh label create "layer-hierarchy" --repo "$REPO" --color "8B5CF6" --description "Agent hierarchy" 2>/dev/null || true

gh issue create --repo "$REPO" \
  --title "[#22] Ruler Agent — main hierarchy top" \
  --body "The Ruler is the sole main agent. Workers report up; only the Ruler speaks via ElevenLabs.

## Acceptance criteria
- [x] packages/agents/ruler-agent.md
- [x] convex/lib/agent-hierarchy.ts
- [x] createAudit logs ruler delegate event
- [ ] Hermes skill routes user interaction through Ruler

See .github/ISSUES/22-ruler-agent.md" \
  --label buildathon --label layer-hierarchy --label partner-hermes

gh issue create --repo "$REPO" \
  --title "[#23] Worker agents report to Ruler" \
  --body "All workers emit worker_report sessions to Ruler. Forensics UI shows Ruler vs Workers.

## Workers
- worker:literature, worker:repo, worker:web
- worker:judge, worker:gap-filler
- worker:runtime, worker:eval-scaler

See .github/ISSUES/23-worker-reports.md" \
  --label buildathon --label layer-hierarchy --label layer-agents

gh issue create --repo "$REPO" \
  --title "[#24] ElevenLabs — Ruler speaks final verdict" \
  --body "Only the Ruler speaks to users. ElevenLabs TTS after all workers report.

## Acceptance criteria
- [x] rulerBriefScript in generateVoiceBrief.ts
- [x] ruler_brief session event
- [x] VoicePlayer on report page
- [ ] Telegram Ruler voice reply

Requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.

See .github/ISSUES/24-elevenlabs-ruler-voice.md" \
  --label buildathon --label layer-hierarchy --label partner-elevenlabs

echo "Created hierarchy issues #22-24 on $REPO"
