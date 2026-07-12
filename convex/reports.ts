import { v } from "convex/values";
import { query } from "./_generated/server";

export const getReport = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("reports")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first(),
});

export const getGithubOutput = query({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) =>
    ctx.db
      .query("githubOutputs")
      .withIndex("by_audit", (q) => q.eq("auditId", args.auditId))
      .first(),
});
