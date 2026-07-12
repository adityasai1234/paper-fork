# Hermes + Telegram setup

Paperfork audits can be triggered from Hermes Telegram gateway via the Convex HTTP webhook.

## 1. Install Hermes

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes model
```

## 2. Configure gateway

```bash
hermes gateway setup
```

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALLOWED_USERS` in `~/.hermes/.env`.

## 3. Install Paperfork skill

Copy `skills/paperfork-audit/SKILL.md` to your Hermes skills directory, or symlink:

```bash
ln -s "$(pwd)/skills/paperfork-audit" ~/.hermes/skills/paperfork-audit
hermes skills browse
```

## 4. Webhook URL

After `npx convex dev`, Convex exposes HTTP routes. Set in Convex dashboard env:

```
PAPERFORK_WEBHOOK_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://paperfork.getkarpathy.com
```

Webhook endpoint:

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

## 5. Telegram message format

DM your bot:

```
audit arXiv:2401.12345 https://github.com/owner/demo-fork
```

Hermes skill parses the message and calls the webhook. Reply includes audit and report URLs.

## 6. Memory + cron

- Hermes memory: recurring fork patterns stored in Convex `memories` table
- Cron re-audit: schedule from report page or Hermes cron at user-chosen time
