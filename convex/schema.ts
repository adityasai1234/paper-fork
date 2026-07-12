import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const chipStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("done"),
  v.literal("error")
);

const auditStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("done"),
  v.literal("blocked"),
  v.literal("failed")
);

const verdict = v.union(
  v.literal("FORKED"),
  v.literal("ALIGNED"),
  v.literal("UNVERIFIABLE")
);

export default defineSchema({
  audits: defineTable({
    paperId: v.string(),
    paperIdType: v.union(v.literal("arxiv"), v.literal("doi")),
    githubUrl: v.string(),
    status: auditStatus,
    chips: v.object({
      literature: chipStatus,
      repo: chipStatus,
      web: chipStatus,
    }),
    error: v.optional(v.string()),
    scaleRound: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  agentOutputs: defineTable({
    auditId: v.id("audits"),
    agent: v.union(
      v.literal("literature"),
      v.literal("repo"),
      v.literal("web"),
      v.literal("structure"),
      v.literal("runtime")
    ),
    payload: v.any(),
    completedAt: v.number(),
  }).index("by_audit", ["auditId"]),

  reports: defineTable({
    auditId: v.id("audits"),
    paper: v.object({
      id: v.string(),
      title: v.string(),
      abstract: v.optional(v.string()),
      abstractClaims: v.array(v.string()),
    }),
    repo: v.object({
      url: v.string(),
      sha: v.optional(v.string()),
      defaultBranch: v.optional(v.string()),
    }),
    forkLedger: v.array(
      v.object({
        claim: v.string(),
        paperSource: v.string(),
        repoEvidence: v.optional(v.string()),
        verdict,
        suggestedFix: v.optional(v.string()),
        effort: v.optional(v.union(v.literal("S"), v.literal("M"), v.literal("L"))),
      })
    ),
    neighbors: v.array(
      v.object({
        s2Id: v.string(),
        title: v.string(),
        year: v.optional(v.number()),
        metric: v.optional(v.string()),
        value: v.optional(v.string()),
        methodDelta: v.optional(v.string()),
        citationKeyDraft: v.optional(v.string()),
      })
    ),
    checklist: v.array(
      v.object({
        item: v.string(),
        status: v.union(v.literal("red"), v.literal("amber"), v.literal("green")),
        evidence: v.string(),
      })
    ),
    reproAppendix: v.object({
      install: v.optional(v.string()),
      train: v.optional(v.string()),
      eval: v.optional(v.string()),
      seeds: v.optional(v.string()),
      dataPath: v.optional(v.string()),
      hardware: v.optional(v.string()),
      checkpoints: v.optional(v.string()),
    }),
    gapFills: v.array(
      v.object({
        type: v.union(
          v.literal("readme"),
          v.literal("baseline"),
          v.literal("citation"),
          v.literal("code")
        ),
        content: v.string(),
        evidence: v.string(),
      })
    ),
    linkupSources: v.array(
      v.object({
        url: v.string(),
        usedFor: v.string(),
      })
    ),
    voiceUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_audit", ["auditId"]),

  userRequests: defineTable({
    auditId: v.id("audits"),
    type: v.union(
      v.literal("SSH"),
      v.literal("DATA_PATH"),
      v.literal("HF_TOKEN"),
      v.literal("GPU")
    ),
    reason: v.string(),
    command: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("denied"),
      v.literal("done")
    ),
    simulatedOutput: v.optional(v.string()),
  }).index("by_audit", ["auditId"]),

  sessions: defineTable({
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
    ts: v.number(),
  }).index("by_audit", ["auditId"]),

  memories: defineTable({
    repoOwner: v.string(),
    pattern: v.string(),
    occurrences: v.number(),
    lastSeenAt: v.number(),
    checklistBoost: v.array(v.string()),
  }).index("by_owner", ["repoOwner"]),

  cronJobs: defineTable({
    auditId: v.id("audits"),
    githubUrl: v.string(),
    scheduledAt: v.number(),
    notifyEmail: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("fired"),
      v.literal("cancelled")
    ),
  }).index("by_scheduled", ["scheduledAt"]),

  githubOutputs: defineTable({
    auditId: v.id("audits"),
    issueUrl: v.optional(v.string()),
    issueBody: v.string(),
    readmePatch: v.string(),
  }).index("by_audit", ["auditId"]),
});
