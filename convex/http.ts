import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/audit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { paperId, paperIdType, githubUrl, secret } = body as {
      paperId?: string;
      paperIdType?: "arxiv" | "doi";
      githubUrl?: string;
      secret?: string;
    };

    const expected = process.env.PAPERFORK_WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    if (!paperId || !githubUrl) {
      return new Response(JSON.stringify({ error: "paperId and githubUrl required" }), {
        status: 400,
      });
    }

    const auditId = await ctx.runMutation(api.audits.createAudit, {
      paperId,
      paperIdType: paperIdType ?? "arxiv",
      githubUrl,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://paperfork.getkarpathy.com";
    return new Response(
      JSON.stringify({
        auditId,
        auditUrl: `${appUrl}/audit/${auditId}`,
        reportUrl: `${appUrl}/report/${auditId}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
