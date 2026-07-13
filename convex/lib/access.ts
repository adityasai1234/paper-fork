import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  assertResourceAccess,
  canAccessResource,
  type ResourceAccessArgs,
} from "./auth_helpers";
import { getOptionalAuthUserId } from "./auth_session";

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

export async function auditAccessArgs(
  ctx: QueryCtx | MutationCtx,
  audit: Doc<"audits">,
  providedSessionId?: string | null
): Promise<ResourceAccessArgs> {
  return {
    resourceUserId: audit.userId,
    callerUserId: await getOptionalAuthUserId(ctx),
    resourceSessionId: audit.sessionId,
    providedSessionId,
  };
}

export async function requireAuditForUser(
  ctx: QueryCtx | MutationCtx,
  auditId: Id<"audits">,
  providedSessionId?: string | null
): Promise<Doc<"audits">> {
  const audit = await requireAudit(ctx, auditId);
  assertResourceAccess(await auditAccessArgs(ctx, audit, providedSessionId));
  return audit;
}

export async function canAccessAudit(
  ctx: QueryCtx | MutationCtx,
  audit: Doc<"audits">,
  providedSessionId?: string | null
): Promise<boolean> {
  return canAccessResource(await auditAccessArgs(ctx, audit, providedSessionId));
}

export async function getResearchRunOrNull(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">
): Promise<Doc<"researchRuns"> | null> {
  return await ctx.db.get("researchRuns", runId);
}

export async function researchAccessArgs(
  ctx: QueryCtx | MutationCtx,
  run: Doc<"researchRuns">,
  providedSessionId?: string | null
): Promise<ResourceAccessArgs> {
  return {
    resourceUserId: run.userId,
    callerUserId: await getOptionalAuthUserId(ctx),
    resourceSessionId: run.sessionId,
    providedSessionId,
  };
}

export async function requireResearchForUser(
  ctx: QueryCtx | MutationCtx,
  runId: Id<"researchRuns">,
  providedSessionId?: string | null
): Promise<Doc<"researchRuns">> {
  const run = await getResearchRunOrNull(ctx, runId);
  if (!run) throw new Error("Research run not found");
  assertResourceAccess(await researchAccessArgs(ctx, run, providedSessionId));
  return run;
}

export async function canAccessResearch(
  ctx: QueryCtx | MutationCtx,
  run: Doc<"researchRuns">,
  providedSessionId?: string | null
): Promise<boolean> {
  return canAccessResource(await researchAccessArgs(ctx, run, providedSessionId));
}
