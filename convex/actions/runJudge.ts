"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, workerReportPayload } from "../lib/agent_hierarchy";
import {
  buildChecklistFromRegistry,
  emptyEvalProtocol,
} from "../lib/audit_registry";
import {
  extractStructured,
  isLlmAvailable,
  llmTurnPayload,
} from "../lib/ai_gateway";
import {
  buildIssueBody,
  buildReadmePatch,
  parseGithubUrl,
  runForkRules,
  type ForkFinding,
  type LiteraturePayload,
  type MethodsPayload,
  type RepoPayload,
  type WebPayload,
} from "../lib/fork_rules";

const gapFillSchema = z.object({
  gapFills: z.array(
    z.object({
      type: z.enum(["readme", "baseline", "citation", "code"]),
      content: z.string(),
      evidence: z.string(),
    })
  ),
});

const adjudicationSchema = z.object({
  verdict: z.enum(["ALIGNED", "UNVERIFIABLE"]),
  reasoning: z.string(),
});

type GapFill = {
  type: "readme" | "baseline" | "citation" | "code";
  content: string;
  evidence: string;
};

function buildGapFillsTemplate(findings: ForkFinding[], repo: RepoPayload): GapFill[] {
  const gapFills: GapFill[] = [];
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
    } else if (f.suggestedFix) {
      gapFills.push({
        type: "code",
        content: f.suggestedFix,
        evidence: f.repoEvidence ?? f.claim,
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
    const audit = await ctx.runQuery(internal.lib.audit_helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.judge,
      event: "start",
      payload: {},
    });

    const lit = (await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "literature",
    }))?.payload as LiteraturePayload | undefined;
    const repo = (await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "repo",
    }))?.payload as RepoPayload | undefined;
    const web = (await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "web",
    }))?.payload as WebPayload | undefined;
    const methodsRow = await ctx.runQuery(internal.lib.audit_helpers.getAgentOutput, {
      auditId: args.auditId,
      agent: "methods",
    });
    const methods = methodsRow?.payload as MethodsPayload | undefined;

    if (!lit || !repo) {
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "failed",
        error: "Missing agent outputs",
      });
      return;
    }

    const webPayload: WebPayload = web ?? { linkup_sources: [], external_metrics: [] };
    let findings = runForkRules({ literature: lit, repo, web: webPayload, methods });

    if (isLlmAvailable()) {
      const unverifiable = findings.filter((f) => f.verdict === "UNVERIFIABLE").slice(0, 3);
      for (const f of unverifiable) {
        try {
          const result = await extractStructured({
            schema: adjudicationSchema,
            name: "Adjudication",
            description: "Soft adjudication for unverifiable claims only",
            system:
              "Classify as ALIGNED only with strong repo evidence. Never downgrade FORKED. UNVERIFIABLE if uncertain.",
            prompt: JSON.stringify({
              claim: f.claim,
              repoEvidence: f.repoEvidence,
              paperSource: f.paperSource,
            }),
            auditId: args.auditId,
            worker: AGENTS.workers.judge,
            tags: ["feature:adjudication"],
          });

          await ctx.runMutation(internal.audits.logSessionEvent, {
            auditId: args.auditId,
            agent: AGENTS.workers.judge,
            event: "llm_turn",
            payload: llmTurnPayload(result.model, result.usage, AGENTS.workers.judge, [
              "feature:adjudication",
            ], { primaryModel: result.primaryModel, usedFallback: result.usedFallback, provider: result.provider }),
          });

          if (result.output.verdict === "ALIGNED") {
            findings = findings.map((x) =>
              x.claim === f.claim && x.paperSource === f.paperSource
                ? { ...x, verdict: "ALIGNED" as const, repoEvidence: result.output.reasoning }
                : x
            );
          }
        } catch {
          // keep UNVERIFIABLE
        }
      }
    }

    const parsed = parseGithubUrl(audit.githubUrl);
    const repoOwner = parsed?.owner ?? "unknown";
    const memories = await ctx.runQuery(internal.lib.audit_helpers.listMemoriesInternal, {
      repoOwner,
    });
    const memoryBoost = memories.flatMap((m) => {
      const boost = (m as { checklistBoost?: string[] }).checklistBoost;
      return boost ?? [];
    });

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

    const evalProtocol = methods?.evalProtocol ?? emptyEvalProtocol(
      "Evaluation protocol not extracted from paper sections."
    );

    const checklist = buildChecklistFromRegistry(repo, methods, findings);
    for (const boost of memoryBoost) {
      checklist.push({ item: boost, status: "amber", evidence: "retrofit memory" });
    }

    let gapFills = buildGapFillsTemplate(findings, repo);
    if (isLlmAvailable() && findings.some((f) => f.verdict === "FORKED")) {
      try {
        const result = await extractStructured({
          schema: gapFillSchema,
          name: "GapFills",
          description: "Draft README/code/baseline patches for forked claims",
          system: "Draft minimal fixes for each FORKED claim. Cite evidence.",
          prompt: JSON.stringify({
            forked: findings.filter((f) => f.verdict === "FORKED"),
            readme: repo.readme?.slice(0, 2000),
          }),
          auditId: args.auditId,
          worker: AGENTS.workers.gapFiller,
          tags: ["feature:gap-filler"],
        });

        await ctx.runMutation(internal.audits.logSessionEvent, {
          auditId: args.auditId,
          agent: AGENTS.workers.gapFiller,
          event: "llm_turn",
          payload: llmTurnPayload(result.model, result.usage, AGENTS.workers.gapFiller, [
            "feature:gap-filler",
          ], { primaryModel: result.primaryModel, usedFallback: result.usedFallback, provider: result.provider }),
        });

        if (result.output.gapFills.length > 0) gapFills = result.output.gapFills;
      } catch {
        // template fallback
      }
    }

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.gapFiller,
      event: "worker_report",
      payload: workerReportPayload(
        AGENTS.workers.gapFiller,
        `Gap fills: ${gapFills.length} draft patches for forked claims`,
        { gapFillCount: gapFills.length }
      ),
    });

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
      evalProtocol,
      neighbors,
      checklist,
      reproAppendix: {
        install: "pip install -r requirements.txt",
        train: repo.structure?.entrypoints?.find((e) => /train/i.test(e)) ?? "python train.py --seed 42",
        eval: repo.structure?.entrypoints?.find((e) => /eval/i.test(e)) ?? "python eval.py",
        seeds: evalProtocol.seeds ?? (repo.seeds_found.join(", ") || "NEEDS_USER"),
        dataPath: evalProtocol.datasets.join(", ") || "NEEDS_USER",
        hardware: evalProtocol.hardware ?? "NEEDS_USER",
        checkpoints: evalProtocol.checkpointPolicy ?? "NEEDS_USER",
      },
      gapFills,
      linkupSources: webPayload.linkup_sources.map((s) => ({
        url: s.url,
        usedFor: s.used_for,
      })),
    };

    await ctx.runMutation(internal.lib.audit_helpers.insertReport, {
      auditId: args.auditId,
      report,
    });

    const issueBody = buildIssueBody(args.auditId, audit.paperId, audit.githubUrl, findings);
    const readmePatch = buildReadmePatch(report.reproAppendix, forked);

    await ctx.runMutation(internal.lib.audit_helpers.insertGithubOutput, {
      auditId: args.auditId,
      issueBody,
      readmePatch,
    });

    await ctx.scheduler.runAfter(0, internal.actions.emitOutputs.run, { auditId: args.auditId });
    await ctx.scheduler.runAfter(0, internal.actions.generateVoiceBrief.run, {
      auditId: args.auditId,
    });

    const patterns = forked.map((f) => ({
      pattern: f.claim.slice(0, 80),
      checklistBoost: [f.claim],
    }));
    if (patterns.length > 0) {
      await ctx.runMutation(internal.memories.upsertFromLedger, { repoOwner, patterns });
    }

    const needsSsh = forked.some((f) => /full test|eval/i.test(f.claim));
    if (needsSsh && parsed) {
      await ctx.runMutation(internal.lib.audit_helpers.insertUserRequest, {
        auditId: args.auditId,
        type: "SSH",
        reason: 'Paperfork needs SSH access to verify claim: "Results on full test set"',
        command: `ssh gpu-lab.internal 'cd /repos/${parsed.repo} && bash scripts/full_eval.sh'`,
      });
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "blocked",
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.ruler,
        event: "delegate",
        payload: {
          action: "blocked",
          reason: "SSH approval required before runtime verify",
          userRequest: "SSH",
        },
      });
    } else {
      await ctx.runMutation(internal.audits.patchStatus, {
        auditId: args.auditId,
        status: "done",
      });
    }

    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.judge,
      event: "worker_report",
      payload: workerReportPayload(
        AGENTS.workers.judge,
        `Verdict: ${forked.length} forked, ${unverifiableCount} unverifiable`,
        { forkedCount: forked.length }
      ),
    });
    await ctx.runMutation(internal.audits.logSessionEvent, {
      auditId: args.auditId,
      agent: AGENTS.workers.judge,
      event: "done",
      payload: { forkedCount: forked.length },
    });
  },
});
