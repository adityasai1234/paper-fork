# Paperfork Frontend

Standalone marketing site: hero landing (`/`) and waitlist signup (`/signup`).

Runs separately from `apps/web` (the full product app).

## Dev

```bash
# Terminal 1 — main app (audit API + reports)
pnpm dev

# Terminal 2 — marketing frontend
pnpm dev:frontend
```

- Marketing: http://localhost:3001
- App: http://localhost:3000

Set `NEXT_PUBLIC_APP_URL` in `frontend/.env.local` to point audit submissions at the main app.
