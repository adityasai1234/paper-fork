import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAuditOrNull(
  ctx: QueryCtx | MutationCtx,
  auditId: Id<"audits">
): Promise<Doc<"audits"> | null> {
  return await ctx.db.get("audits", auditId);
}

export async function requireAudit(
  ctx: QueryCtx | MutationCtx,
  auditId: Id<"audits">
): Promise<Doc<"audits">> {
  const audit = await getAuditOrNull(ctx, auditId);
  if (!audit) throw new Error("Audit not found");
  return audit;
}
