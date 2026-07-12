# Hermes harness (optional)

Paperfork runs on **Convex + the web UI** by default. Hermes is an optional harness for scripted audit triggers — it does not run audit intelligence.

Telegram is a **side feature**: same `/audit` webhook, optional voice/text relay when `telegramChatId` is provided.

## Primary path (no Hermes required)

1. Open https://paperfork.getkarpathy.com
2. Submit arXiv/DOI + GitHub URL
3. View report + ElevenLabs voice on the report page

Or POST directly:

```
POST https://<deployment>.convex.site/audit
Content-Type: application/json

{
  "paperId": "2401.12345",
  "paperIdType": "arxiv",
  "githubUrl": "https://github.com/owner/repo",
  "secret": "your-secret"
}
```

Set in Convex dashboard: `PAPERFORK_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.

## LLM providers (Convex only)

Audit LLM never runs in Hermes. All inference is in Convex actions:

- Primary: Vercel AI Gateway (`AI_GATEWAY_API_KEY`)
- Gateway fallback: Claude Sonnet, Groq via gateway (`PAPERFORK_LLM_GROQ_MODEL`)
- Last resort: direct Groq (`GROQ_API_KEY`)

## Optional: Hermes skill harness

Install Hermes only if you want a CLI/skill wrapper around the webhook:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
ln -s "$(pwd)/skills/paperfork-audit" ~/.hermes/skills/paperfork-audit
```

```bash
export CONVEX_AUDIT_URL=https://<deployment>.convex.site/audit
export PAPERFORK_WEBHOOK_SECRET=your-secret
./scripts/hermes-audit.sh 'audit arXiv:2401.12345 https://github.com/owner/demo-fork'
```

Parsing is deterministic (no Hermes model). See `skills/paperfork-audit/SKILL.md`.

## Optional: Telegram side channel

Telegram is not required for audits or demos. To enable:

1. `hermes gateway setup` with `TELEGRAM_BOT_TOKEN` in `~/.hermes/.env` (Hermes-side only)
2. Set `TELEGRAM_BOT_TOKEN` in Convex dashboard if you want Ruler voice relay back to Telegram
3. Pass `telegramChatId` in the `/audit` webhook body (or `TELEGRAM_CHAT_ID` env when using `hermes-audit.sh`)

DM format:

```
audit arXiv:2401.12345 https://github.com/owner/demo-fork
```

When configured, completion sends report URL + optional voice to that chat. Web report remains the source of truth.

## Memory + cron

- Recurring fork patterns: Convex `memories` table
- Re-audit: report page cron card or Hermes cron (optional)
