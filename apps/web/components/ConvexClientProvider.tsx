"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

function requireConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Add it to apps/web/.env.local, Vercel env vars, or run `pnpm convex:dev:once` from the repo root."
    );
  }
  return url;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(requireConvexUrl()), []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
