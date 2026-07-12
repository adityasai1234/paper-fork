"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { parseGithubUrl } from "../lib/fork-rules";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "paperfork",
};
if (GITHUB_TOKEN) GITHUB_HEADERS.Authorization = `Bearer ${GITHUB_TOKEN}`;

async function ghFetch(path: string) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json();
}

function extractFromContent(path: string, content: string) {
  const seeds = [...content.matchAll(/seed\s*=\s*\d+|random\.seed\(|--seed/gi)].map((m) => m[0]);
  const splits = [...content.matchAll(/train_test_split|KFold|StratifiedKFold|val_split/gi)].map((m) => m[0]);
  const metrics: Array<{ name: string; file: string; line: number; snippet: string }> = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (/f1_score|accuracy|torchmetrics|sklearn\.metrics/i.test(line)) {
      metrics.push({ name: "metric", file: path, line: i + 1, snippet: line.trim() });
    }
  });
  return { seeds, splits, metrics };
}

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.actions.helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const parsed = parseGithubUrl(audit.githubUrl);
    if (!parsed) {
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "repo",
        status: "error",
      });
      return;
    }

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "repo",
      event: "start",
      payload: parsed,
    });
    await ctx.runMutation(internal.audits.patchChip, {
      auditId: args.auditId,
      agent: "repo",
      status: "running",
    });

    try {
      const { owner, repo } = parsed;
      const repoMeta = await ghFetch(`/repos/${owner}/${repo}`);
      const sha = repoMeta.default_branch
        ? (await ghFetch(`/repos/${owner}/${repo}/git/ref/heads/${repoMeta.default_branch}`)).object?.sha
        : undefined;

      let readme = "";
      try {
        const readmeData = await ghFetch(`/repos/${owner}/${repo}/readme`);
        readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
      } catch {
        readme = "";
      }

      const treeData = sha
        ? await ghFetch(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`)
        : { tree: [] };

      const pattern = /(readme|eval|train|test|config|requirements|pyproject)/i;
      const files: Array<{ path: string; snippet: string }> = [];
      const seeds_found: string[] = [];
      const splits_found: string[] = [];
      const metrics_found: Array<{ name: string; file: string; line: number; snippet: string }> = [];
      const deps: string[] = [];
      const entrypoints: string[] = [];

      for (const node of treeData.tree ?? []) {
        if (node.type !== "blob") continue;
        const p: string = node.path;
        if (/^(train|eval|main)\.py$/i.test(p)) entrypoints.push(p);
        if (!pattern.test(p) && !/^scripts\//.test(p) && !/^configs\//.test(p)) continue;
        if (files.length >= 15) continue;
        try {
          const fileData = await ghFetch(`/repos/${owner}/${repo}/contents/${p}`);
          const content = Buffer.from(fileData.content, "base64").toString("utf-8").slice(0, 8000);
          files.push({ path: p, snippet: content.slice(0, 500) });
          const extracted = extractFromContent(p, content);
          seeds_found.push(...extracted.seeds);
          splits_found.push(...extracted.splits);
          metrics_found.push(...extracted.metrics);
          if (/requirements/.test(p)) {
            deps.push(...content.split("\n").filter((l) => l.trim() && !l.startsWith("#")));
          }
        } catch {
          // skip unreadable files
        }
      }

      const configChain = files.filter((f) => /config/i.test(f.path)).map((f) => f.path);

      const payload = {
        sha,
        defaultBranch: repoMeta.default_branch,
        readme,
        files,
        seeds_found: [...new Set(seeds_found)],
        splits_found: [...new Set(splits_found)],
        metrics_found,
        baselines_in_code: files.filter((f) => /baseline/i.test(f.path)).map((f) => f.path),
        deps,
        structure: {
          entrypoints,
          moduleCount: (treeData.tree ?? []).filter((n: { type: string }) => n.type === "blob").length,
          configChain,
        },
      };

      await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "repo",
        payload,
      });
      await ctx.runMutation(internal.actions.helpers.insertAgentOutput, {
        auditId: args.auditId,
        agent: "structure",
        payload: payload.structure,
      });
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "repo",
        status: "done",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: "repo",
        event: "done",
        payload: { fileCount: files.length },
      });
      await ctx.runMutation(internal.audits.tryScheduleJudge, { auditId: args.auditId });
    } catch (e) {
      await ctx.runMutation(internal.audits.patchChip, {
        auditId: args.auditId,
        agent: "repo",
        status: "error",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: "repo",
        event: "error",
        payload: { message: String(e) },
      });
    }
  },
});
