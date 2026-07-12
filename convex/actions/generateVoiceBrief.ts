"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { AGENTS, rulerBriefScript } from "../lib/agent-hierarchy";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const report = await ctx.runQuery(internal.actions.helpers.getReportInternal, {
      auditId: args.auditId,
    });
    if (!report) return;

    const script = rulerBriefScript({
      paper: report.paper,
      forkLedger: report.forkLedger,
      repo: report.repo,
    });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

    if (!apiKey) {
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.ruler,
        event: "ruler_brief",
        payload: { script, voiceSkipped: true, reason: "ELEVENLABS_API_KEY not set" },
      });
      return;
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const voiceUrl = `data:audio/mpeg;base64,${base64}`;
      await ctx.runMutation(internal.actions.helpers.patchReportVoice, {
        auditId: args.auditId,
        voiceUrl,
      });
      await ctx.runMutation(internal.audits.logSessionEvent, {
        auditId: args.auditId,
        agent: AGENTS.ruler,
        event: "ruler_brief",
        payload: { script, voiceGenerated: true, speaker: "ruler" },
      });
    }
  },
});
