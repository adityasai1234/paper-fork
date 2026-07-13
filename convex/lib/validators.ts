import { v } from "convex/values";

export const chipStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("done"),
  v.literal("error")
);

export const auditStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("done"),
  v.literal("blocked"),
  v.literal("failed")
);

export const verdict = v.union(
  v.literal("FORKED"),
  v.literal("ALIGNED"),
  v.literal("UNVERIFIABLE")
);

export const auditDoc = v.object({
  _id: v.id("audits"),
  _creationTime: v.number(),
  paperId: v.string(),
  paperIdType: v.union(v.literal("arxiv"), v.literal("doi")),
  githubUrl: v.string(),
  status: auditStatus,
  chips: v.object({
    literature: chipStatus,
    repo: chipStatus,
    web: chipStatus,
    methods: v.optional(chipStatus),
  }),
  error: v.optional(v.string()),
  scaleRound: v.optional(v.number()),
  telegramChatId: v.optional(v.string()),
  ingressSource: v.optional(
    v.union(v.literal("webhook"), v.literal("web"), v.literal("cron"))
  ),
  sessionId: v.optional(v.string()),
  userId: v.optional(v.id("users")),
  createdAt: v.number(),
});

export const sessionDoc = v.object({
  _id: v.id("sessions"),
  _creationTime: v.number(),
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
});

export const memoryDoc = v.object({
  _id: v.id("memories"),
  _creationTime: v.number(),
  repoOwner: v.string(),
  pattern: v.string(),
  occurrences: v.number(),
  lastSeenAt: v.number(),
  checklistBoost: v.array(v.string()),
});

export const auditLiveProgressDoc = v.object({
  audit: auditDoc,
  repoOwner: v.string(),
  sessions: v.array(sessionDoc),
  recalledPatterns: v.array(memoryDoc),
});

export const userRequestDoc = v.object({
  _id: v.id("userRequests"),
  _creationTime: v.number(),
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
});

export const cronJobDoc = v.object({
  _id: v.id("cronJobs"),
  _creationTime: v.number(),
  auditId: v.id("audits"),
  githubUrl: v.string(),
  scheduledAt: v.number(),
  notifyEmail: v.optional(v.string()),
  status: v.union(v.literal("pending"), v.literal("fired"), v.literal("cancelled")),
});

export const reportDoc = v.object({
  _id: v.id("reports"),
  _creationTime: v.number(),
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
      section: v.optional(v.string()),
      claimId: v.optional(v.string()),
      dimension: v.optional(v.string()),
    })
  ),
  evalProtocol: v.optional(
    v.object({
      splits: v.optional(v.string()),
      seeds: v.optional(v.string()),
      metrics: v.array(v.string()),
      baselines: v.array(v.string()),
      datasets: v.array(v.string()),
      hardware: v.optional(v.string()),
      checkpointPolicy: v.optional(v.string()),
      summary: v.string(),
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
  sectionVerification: v.optional(
    v.array(
      v.object({
        section: v.union(
          v.literal("methods"),
          v.literal("experiments"),
          v.literal("results")
        ),
        status: v.union(
          v.literal("verified"),
          v.literal("forked"),
          v.literal("unverifiable")
        ),
        discrepancies: v.array(v.string()),
      })
    )
  ),
  pdfStorageId: v.optional(v.id("_storage")),
  pdfSource: v.optional(
    v.union(
      v.literal("arxiv_passthrough"),
      v.literal("compiled"),
      v.literal("failed")
    )
  ),
  createdAt: v.number(),
});

export const githubOutputDoc = v.object({
  _id: v.id("githubOutputs"),
  _creationTime: v.number(),
  auditId: v.id("audits"),
  issueUrl: v.optional(v.string()),
  issueBody: v.string(),
  readmePatch: v.string(),
  prUrl: v.optional(v.string()),
  branchName: v.optional(v.string()),
  applyStatus: v.optional(
    v.union(v.literal("draft"), v.literal("pr_opened"), v.literal("failed"))
  ),
});
