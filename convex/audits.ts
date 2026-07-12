import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

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

export const createAudit = mutation({
  args: {
    paperId: v.string(),
    paperIdType: v.union(v.literal("arxiv"), v.literal("doi")),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const auditId = await ctx.db.insert("audits", {
      ...args,
      status: "queued",
      chips: { literature: "pending", repo: "pending", web: "pending" },
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

    return auditId;
  },
});

export const getAudit = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => ctx.db.get(args.auditId),
});

export const listSessions = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("sessions")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .collect(),
});

export const patchChip = internalMutation({
  args: {
    auditId: v.id("audits"),
    agent: v.union(v.literal("literature"), v.literal("repo"), v.literal("web")),
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
