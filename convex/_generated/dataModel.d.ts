/* eslint-disable */
export type DataModel = {
  audits: {
    document: {
      _id: import("./dataModel").Id<"audits">;
      _creationTime: number;
      paperId: string;
      paperIdType: "arxiv" | "doi";
      githubUrl: string;
      status: "queued" | "running" | "done" | "blocked" | "failed";
      chips: { literature: string; repo: string; web: string };
      error?: string;
      scaleRound?: number;
      createdAt: number;
    };
    fieldPaths: "_id" | "_creationTime" | "paperId" | "paperIdType" | "githubUrl" | "status" | "chips" | "error" | "scaleRound" | "createdAt";
  };
  agentOutputs: { document: { _id: Id<"agentOutputs">; _creationTime: number; auditId: Id<"audits">; agent: string; payload: unknown; completedAt: number }; fieldPaths: string };
  reports: { document: { _id: Id<"reports">; _creationTime: number; auditId: Id<"audits">; paper: unknown; repo: unknown; forkLedger: unknown[]; neighbors: unknown[]; checklist: unknown[]; reproAppendix: unknown; gapFills: unknown[]; linkupSources: unknown[]; voiceUrl?: string; createdAt: number }; fieldPaths: string };
  userRequests: { document: { _id: Id<"userRequests">; _creationTime: number; auditId: Id<"audits">; type: string; reason: string; command?: string; status: string; simulatedOutput?: string }; fieldPaths: string };
  sessions: { document: { _id: Id<"sessions">; _creationTime: number; auditId: Id<"audits">; agent: string; event: string; payload: unknown; ts: number }; fieldPaths: string };
  memories: { document: { _id: Id<"memories">; _creationTime: number; repoOwner: string; pattern: string; occurrences: number; lastSeenAt: number; checklistBoost: string[] }; fieldPaths: string };
  cronJobs: { document: { _id: Id<"cronJobs">; _creationTime: number; auditId: Id<"audits">; githubUrl: string; scheduledAt: number; notifyEmail?: string; status: string }; fieldPaths: string };
  githubOutputs: { document: { _id: Id<"githubOutputs">; _creationTime: number; auditId: Id<"audits">; issueUrl?: string; issueBody: string; readmePatch: string }; fieldPaths: string };
};

export type TableNames = keyof DataModel;
export type Id<TableName extends TableNames> = string & { __tableName: TableName };
