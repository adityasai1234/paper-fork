import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireAuthUserId(ctx: AuthCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function getOwnedAuditOrNull(
  ctx: AuthCtx,
  auditId: Id<"audits">
): Promise<Doc<"audits"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }

  const audit = await ctx.db.get(auditId);
  if (!audit?.ownerUserId || audit.ownerUserId !== userId) {
    return null;
  }

  return audit;
}

export async function requireOwnedAudit(
  ctx: AuthCtx,
  auditId: Id<"audits">
): Promise<Doc<"audits">> {
  const audit = await getOwnedAuditOrNull(ctx, auditId);
  if (!audit) {
    throw new Error("Unauthorized");
  }
  return audit;
}
