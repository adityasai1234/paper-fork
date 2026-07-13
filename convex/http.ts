import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { auditPageUrl, reportPageUrl } from "./lib/app_url";
import { validateWebhookSecret } from "./lib/auth_helpers";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/audit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { paperId, paperIdType, githubUrl, secret, telegramChatId } = body as {
      paperId?: string;
      paperIdType?: "arxiv" | "doi";
      githubUrl?: string;
      secret?: string;
      telegramChatId?: string;
    };

    const validation = validateWebhookSecret(secret, process.env.PAPERFORK_WEBHOOK_SECRET);
    if (!validation.ok) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: validation.status,
      });
    }

    if (!paperId || !githubUrl) {
      return new Response(JSON.stringify({ error: "paperId and githubUrl required" }), {
        status: 400,
      });
    }

    const { auditId, sessionId } = await ctx.runMutation(internal.audits.createAuditWebhook, {
      paperId,
      paperIdType: paperIdType ?? "arxiv",
      githubUrl,
      telegramChatId,
    });

    return new Response(
      JSON.stringify({
        auditId,
        sessionId,
        auditUrl: auditPageUrl(auditId, sessionId),
        reportUrl: reportPageUrl(auditId, sessionId),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
