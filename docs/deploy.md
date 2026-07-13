# Deploy: Vercel + Convex

## Convex (backend)

1. Log in: `npx convex login`
2. Deploy: `pnpm convex:deploy`
3. Copy the production **Deployment URL** from the CLI output
4. Set backend env vars in the [Convex dashboard](https://dashboard.convex.dev) (see `.env.example`)

Required Convex environment variables:

- `LINKUP_API_KEY` — literature + web + research discovery
- `GROQ_API_KEY` or `AI_GATEWAY_API_KEY` — judge, methods, synthesis
- `GITHUB_TOKEN` — repo scanning (recommended)
- `ELEVENLABS_API_KEY` (optional, for voice briefs)
- `PAPERFORK_WEBHOOK_SECRET` (for Hermes webhook ingress)
- `NEXT_PUBLIC_APP_URL` — your Vercel production URL (e.g. `https://paperfork.vercel.app`)

## Vercel (frontend — apps/web)

Set in Vercel project environment variables:

- `NEXT_PUBLIC_CONVEX_URL` — Convex production URL
- `DEMO_EMAIL` — demo sign-in email (default `admin@gmail.com`)
- `DEMO_PASSWORD` — demo sign-in password (default `pass1234`)

## Local dev

```bash
npx convex dev          # terminal 1
pnpm dev                # terminal 2 — http://localhost:3000
```

Set `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local` from `npx convex dev` output.

## Routes

| Path | Access |
|------|--------|
| `/` | Public landing |
| `/login` | Public demo sign-in |
| `/signup` | Public waitlist UI |
| `/audits` | Authenticated — audit form |
| `/audits/[id]` | Authenticated — audit progress |
| `/audits/[id]/report` | Authenticated — fork report |
| `/research` | Authenticated — research form |
| `/research/[id]` | Authenticated — research progress |
| `/research/[id]/report` | Authenticated — research report |

Legacy `/app/*`, `/audit/*`, and `/report/*` redirect to the routes above.
