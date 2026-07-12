#!/usr/bin/env bash
# Create GitHub labels for Paperfork issues 1-21
set -euo pipefail
REPO="adityasai1234/paper-fork"

labels=(
  "buildathon:0E8A16:Buildathon track"
  "layer-foundation:1D76DB:Foundation layer"
  "layer-hermes:6F42C1:Hermes harness"
  "layer-agents:F9A825:Agent pipeline"
  "layer-judge:D93F0B:Judge and rules"
  "layer-ui:0E8A16:UI layer"
  "layer-ship:CB2431:Ship layer"
  "partner-hermes:6F42C1:Hermes partner"
  "partner-convex:FF6B35:Convex partner"
  "partner-linkup:00A86B:Linkup partner"
  "partner-cloudflare:F48120:Cloudflare partner"
  "partner-elevenlabs:000000:ElevenLabs partner"
)

for entry in "${labels[@]}"; do
  IFS=':' read -r name color desc <<< "$entry"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null || true
done

echo "Labels ready on $REPO"
