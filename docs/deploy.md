# Deploy: Vercel + Convex

## Convex (backend)

1. Log in: `npx convex login`
2. Deploy: `pnpm convex:deploy`
3. Copy the production **Deployment URL** from the CLI output
4. Set backend env vars in the [Convex dashboard](https://dashboard.convex.dev) (see `.env.example`)

Required Convex environment variables:

- `AI_GATEWAY_API_KEY` or `GROQ_API_KEY`
- `LINKUP_API_KEY`
- `GITHUB_TOKEN`
- `ELEVENLABS_API_KEY` (optional, for voice briefs)
- `PAPERFORK_WEBHOOK_SECRET` (for Hermes webhook ingress)
- `NEXT_PUBLIC_APP_URL` — your Vercel production URL (e.g. `https://paperfork.vercel.app`)

## Vercel (frontend — apps/web)

### Option A: Vercel dashboard

1. Import the GitHub repo
2. **Root Directory:** leave as repo root (uses [`vercel.json`](../vercel.json))
3. **Environment variable:** `NEXT_PUBLIC_CONVEX_URL` = Convex production URL from deploy step

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_CONVEX_URL
vercel --prod
```

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
| `/app` | Authenticated — audit form |
| `/app/audit/[id]` | Authenticated — audit progress |
| `/app/report/[id]` | Authenticated — fork report |

Legacy `/audit/*` and `/report/*` redirect to `/app/*`.
