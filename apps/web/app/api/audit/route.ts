import { randomUUID } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  let body: {
    paperId?: string;
    paperIdType?: "arxiv" | "doi";
    githubUrl?: string;
    sessionId?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paperId = body.paperId?.trim();
  const githubUrl = body.githubUrl?.trim();
  const paperIdType = body.paperIdType ?? "arxiv";

  if (!paperId || !githubUrl) {
    return NextResponse.json(
      { error: "paperId and githubUrl are required" },
      { status: 400 }
    );
  }

  const sessionId = body.sessionId ?? randomUUID();

  try {
    const result = await convex.mutation(api.audits.createAudit, {
      paperId,
      paperIdType,
      githubUrl,
      sessionId,
    });

    return NextResponse.json({
      auditId: result.auditId,
      sessionId: result.sessionId,
      auditUrl: `/app/audit/${result.auditId}?session=${result.sessionId}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
