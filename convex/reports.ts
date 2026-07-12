import { v } from "convex/values";
import { query } from "./_generated/server";
import { getOwnedAuditOrNull, requireOwnedAudit } from "./lib/auth";
import { githubOutputDoc, reportDoc } from "./lib/validators";

export const getReport = query({
  args: { auditId: v.id("audits") },
  returns: v.union(reportDoc, v.null()),
  handler: async (ctx, args) => {
    const audit = await getOwnedAuditOrNull(ctx, args.auditId);
    if (!audit) return null;
    return await ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
  },
});

export const getGithubOutput = query({
  args: { auditId: v.id("audits") },
  returns: v.union(githubOutputDoc, v.null()),
  handler: async (ctx, args) => {
    const audit = await getOwnedAuditOrNull(ctx, args.auditId);
    if (!audit) return null;
    return await ctx.db
      .query("githubOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first();
  },
});
