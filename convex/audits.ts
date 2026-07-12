import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuditForSessionOrNull } from "./lib/access";
import { parseGithubUrl } from "./lib/fork_rules";
import { auditDoc, auditLiveProgressDoc, sessionDoc } from "./lib/validators";

type CreateAuditArgs = {
  paperId: string;
  paperIdType: "arxiv" | "doi";
  githubUrl: string;
  telegramChatId?: string;
  ingressSource?: "webhook" | "web" | "cron";
  sessionId?: string;
};

function newSessionId(): string {
  return crypto.randomUUID();
}

async function insertAuditAndScheduleWorkers(
  ctx: MutationCtx,
  args: CreateAuditArgs
): Promise<{ auditId: Id<"audits">; sessionId: string }> {
  const sessionId = args.sessionId ?? newSessionId();
  const auditId = await ctx.db.insert("audits", {
    paperId: args.paperId,
    paperIdType: args.paperIdType,
    githubUrl: args.githubUrl,
    telegramChatId: args.telegramChatId,
    ingressSource: args.ingressSource ?? "web",
    sessionId,
    status: "queued",
    chips: { literature: "pending", repo: "pending", web: "pending", methods: "pending" },
    scaleRound: 0,
    createdAt: Date.now(),
  });

  await ctx.scheduler.runAfter(0, internal.actions.runLiterature.run, { auditId });
  await ctx.scheduler.runAfter(0, internal.actions.runRepo.run, { auditId });
  await ctx.scheduler.runAfter(0, internal.actions.runWeb.run, { auditId });

  await ctx.runMutation(internal.audits.logSessionEvent, {
    auditId,
    agent: "ruler",
    event: "delegate",
    payload: {
      workers: ["worker:literature", "worker:repo", "worker:web"],
      action: "createAudit",
      ...args,
    },
  });

  return { auditId, sessionId };
}

export const logSessionEvent = internalMutation({
  args: {
    auditId: v.id("audits"),
    agent: v.string(),
    event: v.union(
      v.literal("start"),
      v.literal("delegate"),
      v.literal("worker_report"),
      v.literal("tool_call"),
      v.literal("llm_turn"),
      v.literal("ruler_brief"),
      v.literal("error"),
      v.literal("done")
    ),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      auditId: args.auditId,
      agent: args.agent,
      event: args.event,
      payload: args.payload,
      ts: Date.now(),
    });
  },
});

export const createAuditWebhook = internalMutation({
  args: {
    paperId: v.string(),
    paperIdType: v.union(v.literal("arxiv"), v.literal("doi")),
    githubUrl: v.string(),
    telegramChatId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  returns: v.object({
    auditId: v.id("audits"),
    sessionId: v.string(),
  }),
  handler: async (ctx, args) =>
    insertAuditAndScheduleWorkers(ctx, {
      ...args,
      ingressSource: "webhook",
    }),
});

export const createAudit = mutation({
  args: {
    paperId: v.string(),
    paperIdType: v.union(v.literal("arxiv"), v.literal("doi")),
    githubUrl: v.string(),
    telegramChatId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  returns: v.object({
    auditId: v.id("audits"),
    sessionId: v.string(),
  }),
  handler: async (ctx, args) =>
    insertAuditAndScheduleWorkers(ctx, {
      ...args,
      ingressSource: "web",
    }),
});

export const getAudit = query({
  args: {
    auditId: v.id("audits"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(auditDoc, v.null()),
  handler: async (ctx, args) =>
    getAuditForSessionOrNull(ctx, args.auditId, args.sessionId),
});

export const getAuditBySession = query({
  args: { sessionId: v.string() },
  returns: v.union(
    v.object({
      auditId: v.id("audits"),
      sessionId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const audit = await ctx.db
      .query("audits")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!audit) return null;

    const visible = await getAuditForSessionOrNull(ctx, audit._id, args.sessionId);
    if (!visible) return null;

    return {
      auditId: audit._id,
      sessionId: audit.sessionId ?? args.sessionId,
    };
  },
});

export const getAuditLiveProgress = query({
  args: {
    auditId: v.id("audits"),
    sessionId: v.optional(v.string()),
  },
  returns: v.union(auditLiveProgressDoc, v.null()),
  handler: async (ctx, args) => {
    const audit = await getAuditForSessionOrNull(ctx, args.auditId, args.sessionId);
    if (!audit) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect();

    const parsed = parseGithubUrl(audit.githubUrl);
    const repoOwner = parsed?.owner ?? "unknown";

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_owner", (q) => q.eq("repoOwner", repoOwner))
      .collect();

    const recalledPatterns = memories
      .filter((m) => m.occurrences >= 2)
      .sort((a, b) => b.occurrences - a.occurrences || b.lastSeenAt - a.lastSeenAt);

    return {
      audit,
      repoOwner,
      sessions: sessions.sort((a, b) => a.ts - b.ts),
      recalledPatterns,
    };
  },
});

export const listSessions = query({
  args: {
    auditId: v.id("audits"),
    sessionId: v.optional(v.string()),
  },
  returns: v.array(sessionDoc),
  handler: async (ctx, args) => {
    const audit = await getAuditForSessionOrNull(ctx, args.auditId, args.sessionId);
    if (!audit) return [];
    return await ctx.db
      .query("sessions")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect();
  },
});

export const patchChip = internalMutation({
  args: {
    auditId: v.id("audits"),
    agent: v.union(
      v.literal("literature"),
      v.literal("repo"),
      v.literal("web"),
      v.literal("methods")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("done"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    const audit = await ctx.db.get(args.auditId);
    if (!audit) return;
    await ctx.db.patch(args.auditId, {
      chips: { ...audit.chips, [args.agent]: args.status },
      status: audit.status === "queued" ? "running" : audit.status,
    });
  },
});

export const patchStatus = internalMutation({
  args: {
    auditId: v.id("audits"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("done"),
      v.literal("blocked"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { auditId, status, error } = args;
    await ctx.db.patch(auditId, error !== undefined ? { status, error } : { status });
  },
});

export const tryScheduleJudge = internalMutation({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const outputs = await ctx.db
      .query("agentOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect();

    const required = new Set(["literature", "repo", "web"]);
    for (const o of outputs) required.delete(o.agent);
    if (required.size > 0) return;

    const lit = outputs.find((o) => o.agent === "literature");
    const litPayload = lit?.payload as { methodsScheduled?: boolean } | undefined;
    if (litPayload?.methodsScheduled) {
      const methodsDone = outputs.some((o) => o.agent === "methods");
      if (!methodsDone) return;
    }

    const existing = await ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
    if (existing) return;

    await ctx.scheduler.runAfter(0, internal.actions.runJudge.run, {
      auditId: args.auditId,
    });
  },
});
