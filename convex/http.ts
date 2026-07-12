import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

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

    const expected = process.env.PAPERFORK_WEBHOOK_SECRET;
    if (!expected) {
      return new Response(JSON.stringify({ error: "webhook not configured" }), { status: 503 });
    }
    if (!secret || !timingSafeEqual(secret, expected)) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://paperfork.getkarpathy.com";
    return new Response(
      JSON.stringify({
        auditId,
        sessionId,
        auditUrl: `${appUrl}/app/audit/${auditId}?session=${sessionId}`,
        reportUrl: `${appUrl}/report/${auditId}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
