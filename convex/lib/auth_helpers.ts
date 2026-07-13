import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export type WebhookValidationResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function validateWebhookSecret(
  secret: string | undefined,
  expected: string | undefined
): WebhookValidationResult {
  if (!expected) {
    return { ok: false, status: 503, error: "webhook not configured" };
  }
  if (!secret || !timingSafeEqual(secret, expected)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}

export type ResourceAccessArgs = {
  resourceUserId?: Id<"users"> | null;
  callerUserId?: Id<"users"> | null;
  resourceSessionId?: string | null;
  providedSessionId?: string | null;
};

export function canAccessResource(args: ResourceAccessArgs): boolean {
  const { resourceUserId, callerUserId, resourceSessionId, providedSessionId } = args;

  if (callerUserId && resourceUserId && callerUserId === resourceUserId) {
    return true;
  }

  if (
    providedSessionId &&
    resourceSessionId &&
    providedSessionId === resourceSessionId
  ) {
    return true;
  }

  return false;
}

export function assertResourceAccess(args: ResourceAccessArgs): void {
  if (!canAccessResource(args)) {
    throw new Error("Unauthorized");
  }
}
