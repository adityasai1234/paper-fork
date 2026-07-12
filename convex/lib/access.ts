import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAuditForSessionOrNull(
  ctx: QueryCtx | MutationCtx,
  auditId: Id<"audits">,
  sessionId?: string
): Promise<Doc<"audits"> | null> {
  const audit = await ctx.db.get("audits", auditId);
  if (!audit) return null;
  if (sessionId && audit.sessionId === sessionId) return audit;
  return null;
}

export async function requireAuditSession(
  ctx: QueryCtx | MutationCtx,
  auditId: Id<"audits">,
  sessionId?: string
): Promise<Doc<"audits">> {
  const audit = await getAuditForSessionOrNull(ctx, auditId, sessionId);
  if (!audit) throw new Error("Unauthorized");
  return audit;
}
