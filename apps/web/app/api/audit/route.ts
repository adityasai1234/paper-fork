import { randomUUID } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";

function appReportUrl(auditId: string): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://paperfork.getkarpathy.com";
  return `${appUrl.replace(/\/$/, "")}/report/${auditId}`;
}

export async function POST(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return Response.json(
      { error: "NEXT_PUBLIC_CONVEX_URL is not configured" },
      { status: 503 }
    );
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    paperId?: string;
    paperIdType?: "arxiv" | "doi";
    githubUrl?: string;
    sessionId?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { paperId, paperIdType = "arxiv", githubUrl } = body;
  if (!paperId?.trim() || !githubUrl?.trim()) {
    return Response.json(
      { error: "paperId and githubUrl are required" },
      { status: 400 }
    );
  }

  const sessionId = body.sessionId ?? randomUUID();

  try {
    const client = new ConvexHttpClient(convexUrl);
    client.setAuth(token);

    const result = await client.mutation(api.audits.createAudit, {
      paperId: paperId.trim(),
      paperIdType,
      githubUrl: githubUrl.trim(),
      sessionId,
      ingressSource: "web",
    });

    return Response.json({
      auditId: result.auditId,
      sessionId: result.sessionId,
      reportUrl: appReportUrl(result.auditId),
      auditUrl: `/app/audit/${result.auditId}?session=${result.sessionId}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit start failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
