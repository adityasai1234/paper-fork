"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { parseGithubUrl } from "../lib/fork-rules";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.actions.helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const githubOutput = await ctx.runQuery(internal.actions.helpers.getGithubOutputInternal, {
      auditId: args.auditId,
    });
    if (!githubOutput) return;

    const token = process.env.GITHUB_TOKEN;
    const parsed = parseGithubUrl(audit.githubUrl);

    if (token && parsed) {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "paperfork",
          },
          body: JSON.stringify({
            title: `Paperfork audit: ${audit.paperId}`,
            body: githubOutput.issueBody,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        await ctx.runMutation(internal.actions.helpers.patchGithubIssueUrl, {
          auditId: args.auditId,
          issueUrl: data.html_url,
        });
      }
    }
  },
});
