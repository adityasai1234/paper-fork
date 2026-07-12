#!/usr/bin/env bash
# Create all 22 Paperfork issues. Requires: gh auth login
set -euo pipefail
REPO="adityasai1234/paper-fork"

create_issue() {
  local title="$1"
  local body="$2"
  shift 2
  gh issue create --repo "$REPO" --title "$title" --body "$body" "$@"
}

create_issue "[#1] README + repo bootstrap" \
  "Publish README (0 emojis) as first commit. Issue index links to all issues. .gitignore included." \
  --label buildathon --label layer-foundation

create_issue "[#2] Convex full schema + audit mutation" \
  "ALL tables day 1: audits, agentOutputs, reports, userRequests, sessions, memories, cronJobs, githubOutputs. createAudit schedules parallel agents. logSessionEvent from first action." \
  --label buildathon --label layer-foundation --label partner-convex

create_issue "[#3] Monorepo + Next.js + Cloudflare Pages" \
  "pnpm workspaces, apps/web landing, Cloudflare Pages, .env.example with all partner keys." \
  --label buildathon --label layer-foundation --label partner-cloudflare

create_issue "[#4] Hermes install + gateway + Telegram" \
  "hermes gateway setup. DM bot triggers createAudit. Audit arXiv + github URL via Telegram." \
  --label buildathon --label layer-hermes --label partner-hermes

create_issue "[#5] Orchestrator + distributed governance" \
  "packages/agents/orchestrator.md: fan-out, fork-rules gate, retry budget, handoff contracts. No FORKED downgrade." \
  --label buildathon --label layer-hermes --label partner-hermes

create_issue "[#6] paperfork-audit SKILL.md" \
  "Procedural memory at skills/paperfork-audit/SKILL.md. /paperfork-audit command in Hermes." \
  --label buildathon --label layer-hermes --label partner-hermes

create_issue "[#7] Retrofit memories" \
  "memories.ts upsert after audit. Judge injects checklistBoost for repeat repo owners. Hermes memory sync." \
  --label buildathon --label layer-hermes --label partner-hermes --label partner-convex

create_issue "[#8] Cron scheduled re-audits" \
  "cronJobs + Convex cron poller. Hermes cron at user time. Re-audit diff notify." \
  --label buildathon --label layer-hermes --label partner-hermes --label partner-convex

create_issue "[#9] Literature agent" \
  "runLiterature.ts: arXiv, Semantic Scholar, neighbors, abstract_claims. Session logging." \
  --label buildathon --label layer-agents --label partner-hermes

create_issue "[#10] Repo agent + code structure" \
  "runRepo.ts: GitHub tree, regex extractors, structure pass in same action." \
  --label buildathon --label layer-agents

create_issue "[#11] Web agent (Linkup)" \
  "runWeb.ts: Linkup deep search, linkupSources, external_metrics. LINKUP_PROMO=HERMES." \
  --label buildathon --label layer-agents --label partner-linkup

create_issue "[#12] Runtime verification agent" \
  "runRuntimeVerify.ts on SSH approval or scaleEval. Compare metrics to paper claims." \
  --label buildathon --label layer-agents

create_issue "[#13] Deterministic fork-rules" \
  "fork-rules.ts Rules 1-5. Findings non-negotiable for Judge." \
  --label buildathon --label layer-judge

create_issue "[#14] Judge + gap-filler (Hermes)" \
  "runJudge merges payloads into Fork Report. gap_fills, zero emojis in output." \
  --label buildathon --label layer-judge --label partner-hermes

create_issue "[#15] Eval scaler (scale on failure)" \
  "scaleEval.ts: blocked or >3 UNVERIFIABLE triggers RuntimeVerify + Linkup. Max 2 rounds." \
  --label buildathon --label layer-judge --label partner-hermes

create_issue "[#16] Audit page: chips + session forensics" \
  "AgentChips live subscription. SessionForensics timeline + export JSON." \
  --label buildathon --label layer-ui --label partner-convex

create_issue "[#17] Fork Report UI" \
  "ForkLedger, NeighborTable, Checklist, GapFills, ReproAppendix, ReportFooter." \
  --label buildathon --label layer-ui --label partner-convex

create_issue "[#18] User requests + cron schedule card" \
  "UserRequestCard approve/deny. CronScheduleCard datetime picker." \
  --label buildathon --label layer-ui

create_issue "[#19] ElevenLabs voice briefings" \
  "generateVoiceBrief.ts, VoicePlayer, Telegram voice, cron delta narration." \
  --label buildathon --label layer-ui --label partner-elevenlabs

create_issue "[#20] GitHub issue + README emit" \
  "emitOutputs.ts: issue body + README patch. POST GitHub issues when token set." \
  --label buildathon --label layer-ship

create_issue "[#21] Eval harness" \
  "packages/eval fixture rubric. pnpm eval CI gate." \
  --label buildathon --label layer-ship

echo "Created 21 issues on $REPO"
