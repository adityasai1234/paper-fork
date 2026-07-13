"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { parseGithubUrl } from "../lib/fork_rules";

type GhHeaders = Record<string, string>;

function ghHeaders(token: string): GhHeaders {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "paperfork",
  };
}

async function ghJson<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...ghHeaders(token), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${path}: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function extractCodeFilePath(content: string): string | null {
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  const match = firstLine.match(/^#\s*([\w./-]+\.(py|ts|js|rs|go|sh))$/);
  return match?.[1] ?? null;
}

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.lib.audit_helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const githubOutput = await ctx.runQuery(internal.lib.audit_helpers.getGithubOutputInternal, {
      auditId: args.auditId,
    });
    if (!githubOutput) return;

    const report = await ctx.runQuery(internal.lib.audit_helpers.getReportInternal, {
      auditId: args.auditId,
    });

    const token = await ctx.runQuery(internal.github.getGithubTokenForUser, {
      userId: audit.userId,
    });
    const parsed = parseGithubUrl(audit.githubUrl);

    if (token && parsed) {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues`,
        {
          method: "POST",
          headers: ghHeaders(token),
          body: JSON.stringify({
            title: `Paperfork audit: ${audit.paperId}`,
            body: githubOutput.issueBody,
          }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as { html_url: string };
        await ctx.runMutation(internal.lib.audit_helpers.patchGithubIssueUrl, {
          auditId: args.auditId,
          issueUrl: data.html_url,
        });
      }
    }

    const allVerified =
      report?.sectionVerification?.every((s) => s.status === "verified") ?? false;
    const hasGapFills = (report?.gapFills?.length ?? 0) > 0;

    if (!token || !parsed || allVerified || !hasGapFills) {
      return;
    }

    const branchName = `paperfork/audit-${args.auditId.slice(-6)}`;

    try {
      const repoMeta = await ghJson<{ default_branch: string }>(
        token,
        `/repos/${parsed.owner}/${parsed.repo}`
      );
      const ref = await ghJson<{ object: { sha: string } }>(
        token,
        `/repos/${parsed.owner}/${parsed.repo}/git/ref/heads/${repoMeta.default_branch}`
      );
      const baseSha = ref.object.sha;

      await ghJson(token, `/repos/${parsed.owner}/${parsed.repo}/git/refs`, {
        method: "POST",
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      });

      try {
        const readme = await ghJson<{ content: string; sha: string }>(
          token,
          `/repos/${parsed.owner}/${parsed.repo}/contents/README.md?ref=${branchName}`
        );
        const existing = Buffer.from(readme.content, "base64").toString("utf8");
        const patched = existing.includes("## Reproduction (Paperfork)")
          ? existing
          : `${existing}\n\n${githubOutput.readmePatch}`;
        await ghJson(token, `/repos/${parsed.owner}/${parsed.repo}/contents/README.md`, {
          method: "PUT",
          body: JSON.stringify({
            message: "Paperfork: add reproduction section to README",
            content: Buffer.from(patched, "utf8").toString("base64"),
            branch: branchName,
            sha: readme.sha,
          }),
        });
      } catch {
        await ghJson(token, `/repos/${parsed.owner}/${parsed.repo}/contents/README.md`, {
          method: "PUT",
          body: JSON.stringify({
            message: "Paperfork: add README with reproduction section",
            content: Buffer.from(githubOutput.readmePatch, "utf8").toString("base64"),
            branch: branchName,
          }),
        });
      }

      const codeFill = report?.gapFills.find((g) => g.type === "code");
      if (codeFill) {
        const filePath = extractCodeFilePath(codeFill.content);
        if (filePath) {
          const lines = codeFill.content.split("\n");
          const fileBody = lines.slice(1).join("\n").trim() || codeFill.content;
          await ghJson(token, `/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`, {
            method: "PUT",
            body: JSON.stringify({
              message: `Paperfork: ${filePath} fix`,
              content: Buffer.from(fileBody, "utf8").toString("base64"),
              branch: branchName,
            }),
          });
        }
      }

      const pr = await ghJson<{ html_url: string }>(
        token,
        `/repos/${parsed.owner}/${parsed.repo}/pulls`,
        {
          method: "POST",
          body: JSON.stringify({
            title: "Paperfork: align repo with paper eval protocol",
            head: branchName,
            base: repoMeta.default_branch,
            body: githubOutput.issueBody,
          }),
        }
      );

      await ctx.runMutation(internal.lib.audit_helpers.patchGithubPr, {
        auditId: args.auditId,
        prUrl: pr.html_url,
        branchName,
        applyStatus: "pr_opened",
      });
    } catch {
      await ctx.runMutation(internal.lib.audit_helpers.patchGithubPr, {
        auditId: args.auditId,
        branchName,
        applyStatus: "failed",
      });
    }
  },
});
