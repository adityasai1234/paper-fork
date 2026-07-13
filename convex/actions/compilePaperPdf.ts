"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { normalizeArxivId } from "../lib/arxiv_fetch";
import { parseGithubUrl } from "../lib/fork_rules";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.lib.audit_helpers.getAuditInternal, {
      auditId: args.auditId,
    });
    if (!audit) return;

    const report = await ctx.runQuery(internal.lib.audit_helpers.getReportInternal, {
      auditId: args.auditId,
    });
    if (!report?.sectionVerification) return;

    const allVerified = report.sectionVerification.every((s) => s.status === "verified");
    if (!allVerified) return;

    let arxivId: string | undefined;
    if (audit.paperIdType === "arxiv") {
      arxivId = normalizeArxivId(audit.paperId);
    }

    if (!arxivId) {
      return;
    }

    try {
      // ponytail: verified + unpatched → arXiv published PDF passthrough (no compile service v1)
      const res = await fetch(`https://arxiv.org/pdf/${arxivId}.pdf`, {
        headers: { "User-Agent": "paperfork/1.0" },
      });
      if (!res.ok) {
        return;
      }

      const pdfBytes = await res.arrayBuffer();
      const storageId = await ctx.storage.store(new Blob([pdfBytes], { type: "application/pdf" }));

      await ctx.runMutation(internal.lib.audit_helpers.patchReportPdf, {
        auditId: args.auditId,
        pdfStorageId: storageId,
        pdfSource: "arxiv_passthrough",
      });
    } catch {
      // PDF optional — audit report still valid without it
    }
  },
});
