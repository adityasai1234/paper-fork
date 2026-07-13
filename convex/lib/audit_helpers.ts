import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internalMutation, internalQuery } from "../_generated/server";

export const getAuditInternal = internalQuery({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => ctx.db.get(args.auditId),
});

export const getAgentOutput = internalQuery({
  args: {
    auditId: v.id("audits"),
    agent: v.union(
      v.literal("literature"),
      v.literal("repo"),
      v.literal("web"),
      v.literal("methods"),
      v.literal("structure"),
      v.literal("runtime")
    ),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("agentOutputs")
      .withIndex("by_audit_agent", (q) =>
        q.eq("auditId", args.auditId).eq("agent", args.agent)
      )
      .first(),
});

export const listMemoriesInternal = internalQuery({
  args: { repoOwner: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("memories")
      .withIndex("by_owner", (q) => q.eq("repoOwner", args.repoOwner))
      .collect(),
});

export const insertAgentOutput = internalMutation({
  args: {
    auditId: v.id("audits"),
    agent: v.union(
      v.literal("literature"),
      v.literal("repo"),
      v.literal("web"),
      v.literal("methods"),
      v.literal("structure"),
      v.literal("runtime")
    ),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .filter((q) => q.eq(q.field("agent"), args.agent))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        payload: args.payload,
        completedAt: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("agentOutputs", {
      auditId: args.auditId,
      agent: args.agent,
      payload: args.payload,
      completedAt: Date.now(),
    });
  },
});

export const insertReport = internalMutation({
  args: {
    auditId: v.id("audits"),
    report: v.any(),
  },
  handler: async (ctx, args) => {
    const report = args.report as Record<string, unknown>;
    const evalProtocol = report.evalProtocol as Record<string, unknown> | undefined;
    const sanitized = {
      ...report,
      paper: report.paper
        ? {
            ...(report.paper as Record<string, unknown>),
            abstract:
              (report.paper as { abstract?: string | null }).abstract ?? undefined,
          }
        : report.paper,
      evalProtocol: evalProtocol
        ? Object.fromEntries(
            Object.entries(evalProtocol).filter(([, value]) => value !== null)
          )
        : evalProtocol,
    };
    return await ctx.db.insert("reports", {
      auditId: args.auditId,
      ...(sanitized as Omit<Doc<"reports">, "_id" | "_creationTime" | "auditId" | "createdAt">),
      createdAt: Date.now(),
    });
  },
});

export const insertUserRequest = internalMutation({
  args: {
    auditId: v.id("audits"),
    type: v.union(
      v.literal("SSH"),
      v.literal("DATA_PATH"),
      v.literal("HF_TOKEN"),
      v.literal("GPU")
    ),
    reason: v.string(),
    command: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("userRequests", {
      ...args,
      status: "pending",
    });
  },
});

export const insertGithubOutput = internalMutation({
  args: {
    auditId: v.id("audits"),
    issueUrl: v.optional(v.string()),
    issueBody: v.string(),
    readmePatch: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("githubOutputs", args);
  },
});

export const getGithubOutputInternal = internalQuery({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("githubOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first(),
});

export const getReportInternal = internalQuery({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first(),
});

export const patchGithubIssueUrl = internalMutation({
  args: { auditId: v.id("audits"), issueUrl: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("githubOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
    if (row) await ctx.db.patch(row._id, { issueUrl: args.issueUrl });
  },
});

export const patchGithubPr = internalMutation({
  args: {
    auditId: v.id("audits"),
    prUrl: v.optional(v.string()),
    branchName: v.string(),
    applyStatus: v.union(
      v.literal("draft"),
      v.literal("pr_opened"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("githubOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
    if (row) {
      await ctx.db.patch(row._id, {
        prUrl: args.prUrl,
        branchName: args.branchName,
        applyStatus: args.applyStatus,
      });
    }
  },
});

export const patchReportPdf = internalMutation({
  args: {
    auditId: v.id("audits"),
    pdfStorageId: v.id("_storage"),
    pdfSource: v.union(
      v.literal("arxiv_passthrough"),
      v.literal("compiled"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
    if (report) {
      await ctx.db.patch(report._id, {
        pdfStorageId: args.pdfStorageId,
        pdfSource: args.pdfSource,
      });
    }
  },
});

export const patchReportVoice = internalMutation({
  args: { auditId: v.id("audits"), voiceUrl: v.string() },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
    if (report) await ctx.db.patch(report._id, { voiceUrl: args.voiceUrl });
  },
});

export const incrementScaleRound = internalMutation({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.db.get(args.auditId);
    if (!audit) return;
    await ctx.db.patch(args.auditId, {
      scaleRound: (audit.scaleRound ?? 0) + 1,
    });
  },
});
