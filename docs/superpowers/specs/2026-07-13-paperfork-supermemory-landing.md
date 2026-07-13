# Paperfork SuperMemory Landing

**Date:** 2026-07-13  
**Status:** Implemented

## Summary

Marketing landing at `/` uses SuperMemory-style layout and scroll-driven motion on Paperfork’s dark palette (Instrument Serif + DM Sans). Product routes stay gated behind login; post-login home is `/research`.

## Section map

| Section | Component | SuperMemory analogue |
|---------|-----------|-------------------|
| Sticky nav | `SiteNav.tsx` | Blur nav on scroll |
| Hero + product stack | `LandingHero.tsx`, `HeroProductStack.tsx` | Full-viewport hero + floating UI |
| Partner strip | `PartnerStrip.tsx` | Logo marquee |
| Bento capabilities | `BentoGrid.tsx` | Uneven bento grid |
| Worker deep-dive | `WorkerShowcase.tsx` | Alternating feature rows |
| Final CTA | `FinalCta.tsx` | Radial glow CTA band |
| Footer | `ReportFooter.tsx` | Site footer |

Page order in `LandingPage.tsx`: Nav → Hero → Partners → Bento → Showcase → CTA → Footer.

## Motion tokens

Shared in `apps/web/lib/motion.ts`:

- `fadeUp` — opacity + 24px Y, 0.55s easeOut
- `blurIn` — opacity + blur settle, 0.6s
- `staggerContainer` / `staggerContainerSlow` — 0.1s / 0.14s child stagger
- `floatSpring` — `{ stiffness: 120, damping: 20 }` for hero parallax
- `viewportOnce` — `{ once: true, margin: "-10%" }`

Hero product stack: looping Y float (6–10px), mouse parallax via `useMotionValue` + `useSpring` (disabled when `prefers-reduced-motion`).

CSS: `html { scroll-behavior: smooth }` (auto when reduced motion). Partner marquee: Tailwind `animate-marquee` (40s), disabled with `motion-reduce:animate-none`.

## Reduced motion policy

All landing motion checks `useReducedMotion()` from Framer Motion. When true:

- No float loops, parallax, or stagger variants
- Marquee animation off
- Scroll behavior auto
- Auth pages still render without entrance animation delay

## Routing

| Route | Behavior |
|-------|----------|
| `/` | Public marketing; visible even when logged in |
| `/login`, `/signup` | Public; authed `/login` → `/research` |
| `/research` | Gated default home |
| `/home` | Redirect → `/research` (`next.config.js`) |

Deprecated `frontend/` package removed; dev is `pnpm dev` → `apps/web` on port 3000.

## Files

- `apps/web/lib/motion.ts`
- `apps/web/components/art/HeroProductStack.tsx`
- `apps/web/components/landing/LandingHero.tsx`
- `apps/web/components/landing/BentoGrid.tsx`
- `apps/web/components/landing/WorkerShowcase.tsx`
- `apps/web/components/landing/PartnerStrip.tsx`
- `apps/web/components/landing/FinalCta.tsx`
- `apps/web/components/AuthEntrance.tsx`
- `apps/web/middleware.ts`
