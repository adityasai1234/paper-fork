"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const run = internalAction({
  args: { auditId: v.id("audits") },
  handler: async (ctx, args) => {
    const report = await ctx.runQuery(internal.actions.helpers.getReportInternal, {
      auditId: args.auditId,
    });
    if (!report) return;

    const forked = report.forkLedger.filter((f: { verdict: string }) => f.verdict === "FORKED");
    const script = `Paperfork audit complete. Found ${forked.length} forked items. ${
      forked[0] ? `Top issue: ${forked[0].claim}.` : ""
    } View the full report at paperfork.getkarpathy.com.`;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

    if (!apiKey) return;

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
    }
  },
});
