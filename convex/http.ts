import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";
import { appBaseUrl } from "./lib/app_url";
import { auditPageUrl, reportPageUrl } from "./lib/app_url";
import { validateWebhookSecret } from "./lib/auth_helpers";
import { readBearerToken } from "./lib/research_experiments";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function validateResearchWorker(request: Request): Response | null {
  const validation = validateWebhookSecret(
    readBearerToken(request),
    process.env.PAPERFORK_RESEARCH_WORKER_SECRET
  );
  return validation.ok ? null : json({ error: validation.error }, validation.status);
}

function githubCallbackUrl(): string {
  const site = process.env.CONVEX_SITE_URL?.replace(/\/$/, "");
  if (!site) throw new Error("CONVEX_SITE_URL not configured");
  return process.env.GITHUB_OAUTH_CALLBACK_URL ?? `${site}/integrations/github/callback`;
}

http.route({
  path: "/integrations/github/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const appUrl = appBaseUrl();

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/audits?github=error` },
      });
    }

    const userId = await ctx.runQuery(internal.github.getOAuthStateUser, { state });
    if (!userId) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/audits?github=expired` },
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/audits?github=unconfigured` },
      });
    }

    try {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: githubCallbackUrl(),
        }),
      });

      if (!tokenRes.ok) throw new Error("token exchange failed");
      const tokenData = (await tokenRes.json()) as {
        access_token?: string;
        error?: string;
      };
      if (!tokenData.access_token) {
        throw new Error(tokenData.error ?? "no token");
      }

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "paperfork",
        },
      });
      if (!userRes.ok) throw new Error("user fetch failed");
      const userData = (await userRes.json()) as { login: string };

      await ctx.runMutation(api.github.upsertGithubConnection, {
        state,
        githubLogin: userData.login,
        accessToken: tokenData.access_token,
      });

      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/audits?github=connected` },
      });
    } catch {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/audits?github=error` },
      });
    }
  }),
});

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

http.route({
  path: "/research/experiments/claim",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const denied = validateResearchWorker(request);
    if (denied) return denied;
    try {
      const body = (await request.json()) as { workerId?: string };
      if (!body.workerId?.trim()) return json({ error: "workerId is required" }, 400);
      const job = await ctx.runMutation(
        internal.researchWorker.claimNextExperiment,
        { workerId: body.workerId }
      );
      return job ? json({ job }) : new Response(null, { status: 204 });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid request" }, 400);
    }
  }),
});

http.route({
  path: "/research/experiments/heartbeat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const denied = validateResearchWorker(request);
    if (denied) return denied;
    try {
      const body = (await request.json()) as {
        experimentId?: string;
        workerId?: string;
        leaseToken?: string;
      };
      if (!body.experimentId || !body.workerId || !body.leaseToken) {
        return json({ error: "experimentId, workerId, and leaseToken are required" }, 400);
      }
      const lease = await ctx.runMutation(
        internal.researchWorker.heartbeatExperiment,
        {
          experimentId: body.experimentId as Id<"researchExperiments">,
          workerId: body.workerId,
          leaseToken: body.leaseToken,
        }
      );
      return json(lease);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid request" }, 400);
    }
  }),
});

http.route({
  path: "/research/experiments/report",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const denied = validateResearchWorker(request);
    if (denied) return denied;
    try {
      const body = (await request.json()) as {
        experimentId?: string;
        workerId?: string;
        leaseToken?: string;
        outcome?: "succeeded" | "failed";
        metricValue?: number;
        commitSha?: string;
        resultRef?: string;
        patch?: string;
        runtimeSeconds?: number;
        hardware?: string;
        stdoutTail?: string;
        error?: string;
      };
      if (
        !body.experimentId ||
        !body.workerId ||
        !body.leaseToken ||
        (body.outcome !== "succeeded" && body.outcome !== "failed")
      ) {
        return json(
          { error: "experimentId, workerId, leaseToken, and outcome are required" },
          400
        );
      }
      const result = await ctx.runMutation(internal.researchWorker.reportExperiment, {
        experimentId: body.experimentId as Id<"researchExperiments">,
        workerId: body.workerId,
        leaseToken: body.leaseToken,
        outcome: body.outcome,
        metricValue: body.metricValue,
        commitSha: body.commitSha,
        resultRef: body.resultRef,
        patch: body.patch,
        runtimeSeconds: body.runtimeSeconds,
        hardware: body.hardware,
        stdoutTail: body.stdoutTail,
        error: body.error,
      });
      return json(result);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Invalid request" }, 400);
    }
  }),
});

export default http;
