"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  buildIssueBody,
  buildReadmePatch,
  parseGithubUrl,
  runForkRules,
  type LiteraturePayload,
  type RepoPayload,
  type WebPayload,
} from "../lib/fork-rules";

const CHECKLIST_ITEMS = [
  "seeds",
  "splits",
  "metrics",
  "baselines",
  "data leakage",
  "deps",
  "hardware",
  "checkpoints",
] as const;

function buildChecklist(repo: RepoPayload, findings: ReturnType<typeof runForkRules>) {
  return CHECKLIST_ITEMS.map((item) => {
    const related = findings.find((f) => f.claim.toLowerCase().includes(item));
    if (related?.verdict === "FORKED") {
      return { item, status: "red" as const, evidence: related.repoEvidence ?? related.claim };
    }
    if (item === "seeds" && repo.seeds_found.length > 1) {
      return { item, status: "green" as const, evidence: `${repo.seeds_found.length} seed refs` };
    }
    if (item === "splits" && repo.splits_found.length > 0) {
      return { item, status: "green" as const, evidence: repo.splits_found.join(", ") };
    }
    if (item === "deps" && repo.deps.length > 0) {
      return { item, status: "green" as const, evidence: `${repo.deps.length} deps listed` };
    }
    return { item, status: "amber" as const, evidence: "NEEDS_USER" };
  });
}

function buildGapFills(findings: ReturnType<typeof runForkRules>, repo: RepoPayload) {
  const gapFills: Array<{ type: "readme" | "baseline" | "citation" | "code"; content: string; evidence: string }> = [];
  for (const f of findings.filter((x) => x.verdict === "FORKED")) {
    if (f.suggestedFix === "AUTO_DRAFT_README_SECTION") {
      gapFills.push({
        type: "readme",
        content: buildReadmePatch(
          {
            install: "pip install -r requirements.txt",
            train: "python train.py --config configs/default.yaml --seed 42",
            eval: "python eval.py --checkpoint checkpoints/best.pt --split test",
          },
          [f]
        ),
        evidence: "README missing run commands",
      });
    } else if (f.claim.includes("Macro F1")) {
      gapFills.push({
        type: "code",
        content: "Change f1_score(..., average='binary') to average='macro'",
        evidence: f.repoEvidence ?? "",
      });
    } else if (f.claim.includes("baseline") || f.claim.includes("Neighbor")) {
      gapFills.push({
        type: "baseline",
        content: `# scripts/baseline_neighbor.py\n# TODO: Implement baseline per neighbor paper\nraise NotImplementedError`,
        evidence: f.paperSource,
      });
    }
  }
  if (gapFills.length === 0 && repo.readme) {
    gapFills.push({
      type: "readme",
      content: buildReadmePatch({}, findings.filter((f) => f.verdict === "FORKED")),
      evidence: "fork report",
    });
  }
  return gapFills;
}

export const run = internalAction({
  args: {
    auditId: v.id("audits"),
    isReaudit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.actions.helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "judge",
      event: "start",
      payload: {},
    });

    const lit = (await ctx.runQuery(internal.actions.helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "literature",
    }))?.payload as LiteraturePayload | undefined;
    const repo = (await ctx.runQuery(internal.actions.helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "repo",
    }))?.payload as RepoPayload | undefined;
    const web = (await ctx.runQuery(internal.actions.helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "web",
    }))?.payload as WebPayload | undefined;

    if (!lit || !repo) {
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "failed",
        error: "Missing agent outputs",
      });
      return;
    }

    const webPayload: WebPayload = web ?? { linkup_sources: [], external_metrics: [] };
    const findings = runForkRules(lit, repo, webPayload);

    const parsed = parseGithubUrl(audit.githubUrl);
    const repoOwner = parsed?.owner ?? "unknown";
    const memories = await ctx.runQuery(internal.actions.helpers.listMemoriesInternal, {
      repoOwner,
    });
    const memoryBoost = memories.flatMap((m: { checklistBoost: string[] }) => m.checklistBoost);

    const unverifiableCount = findings.filter((f) => f.verdict === "UNVERIFIABLE").length;
    const scaleRound = audit.scaleRound ?? 0;

    if (unverifiableCount > 3 && scaleRound < 2) {
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "blocked",
      });
      await ctx.scheduler.runAfter(0, internal.actions.scaleEval.run, {
        auditId: args.auditId,
      });
      return;
    }

    const neighbors = (lit.neighbors ?? []).slice(0, 10).map((n) => ({
      s2Id: n.s2Id,
      title: n.title,
      year: n.year,
      metric: undefined,
      value: undefined,
      methodDelta: undefined,
      citationKeyDraft: `@article{${n.s2Id}, title={${n.title}}, year={${n.year ?? ""}}}`,
    }));

    const checklist = buildChecklist(repo, findings);
    for (const boost of memoryBoost) {
      checklist.push({ item: boost, status: "amber", evidence: "retrofit memory" });
    }

    const gapFills = buildGapFills(findings, repo);
    const forked = findings.filter((f) => f.verdict === "FORKED");

    const report = {
      paper: {
        id: audit.paperId,
        title: lit.paper.title,
        abstract: lit.paper.abstract,
        abstractClaims: lit.abstract_claims,
      },
      repo: {
        url: audit.githubUrl,
        sha: repo.sha,
        defaultBranch: repo.defaultBranch,
      },
      forkLedger: findings,
      neighbors,
      checklist,
      reproAppendix: {
        install: "pip install -r requirements.txt",
        train: repo.structure?.entrypoints?.find((e) => /train/i.test(e)) ?? "python train.py --seed 42",
        eval: repo.structure?.entrypoints?.find((e) => /eval/i.test(e)) ?? "python eval.py",
        seeds: repo.seeds_found.join(", ") || "NEEDS_USER",
        dataPath: "NEEDS_USER",
        hardware: "NEEDS_USER",
        checkpoints: "NEEDS_USER",
      },
      gapFills,
      linkupSources: webPayload.linkup_sources.map((s) => ({
        url: s.url,
        usedFor: s.used_for,
      })),
    };

    await ctx.runMutation(internal.actions.helpers.insertReport, {
      auditId: args.auditId,
      report,
    });

    const issueBody = buildIssueBody(
      args.auditId,
      audit.paperId,
      audit.githubUrl,
      findings
    );
    const readmePatch = buildReadmePatch(report.reproAppendix, forked);

    await ctx.runMutation(internal.actions.helpers.insertGithubOutput, {
      auditId: args.auditId,
      issueBody,
      readmePatch,
    });

    await ctx.scheduler.runAfter(0, internal.actions.emitOutputs.run, {
      auditId: args.auditId,
    });
    await ctx.scheduler.runAfter(0, internal.actions.generateVoiceBrief.run, {
      auditId: args.auditId,
    });

    const patterns = forked.map((f) => ({
      pattern: f.claim.slice(0, 80),
      checklistBoost: [f.claim],
    }));
    if (patterns.length > 0) {
      await ctx.runMutation(internal.memories.upsertFromLedger, {
        repoOwner,
        patterns,
      });
    }

    const needsSsh = forked.some((f) => /full test|eval/i.test(f.claim));
    if (needsSsh && parsed) {
      await ctx.runMutation(internal.actions.helpers.insertUserRequest, {
        auditId: args.auditId,
        type: "SSH",
        reason: 'Paperfork needs SSH access to verify claim: "Results on full test set"',
        command: `ssh gpu-lab.internal 'cd /repos/${parsed.repo} && bash scripts/full_eval.sh'`,
      });
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "blocked",
      });
    } else {
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "done",
      });
    }

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: "judge",
      event: "done",
      payload: { forkedCount: forked.length },
    });
  },
});
