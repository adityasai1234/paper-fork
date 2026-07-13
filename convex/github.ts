import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth_session";

const GITHUB_SCOPES = "repo read:user";

function convexSiteUrl(): string {
  const url = process.env.CONVEX_SITE_URL;
  if (!url) throw new Error("CONVEX_SITE_URL not configured");
  return url.replace(/\/$/, "");
}

function githubCallbackUrl(): string {
  return (
    process.env.GITHUB_OAUTH_CALLBACK_URL ??
    `${convexSiteUrl()}/integrations/github/callback`
  );
}

export const getGithubConnection = query({
  args: {},
  returns: v.union(
    v.object({
      githubLogin: v.string(),
      connectedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const row = await ctx.db
      .query("githubConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!row) return null;
    return { githubLogin: row.githubLogin, connectedAt: row.connectedAt };
  },
});

export const startGithubOAuth = mutation({
  args: {},
  returns: v.object({ authorizeUrl: v.string() }),
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_CLIENT_ID not configured");

    const state = crypto.randomUUID();
    await ctx.db.insert("githubOAuthStates", {
      state,
      userId,
      createdAt: Date.now(),
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: githubCallbackUrl(),
      scope: GITHUB_SCOPES,
      state,
    });

    return {
      authorizeUrl: `https://github.com/login/oauth/authorize?${params.toString()}`,
    };
  },
});

export const disconnectGithub = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const row = await ctx.db
      .query("githubConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (row) await ctx.db.delete(row._id);
    return null;
  },
});

export const getGithubTokenForUser = internalQuery({
  args: { userId: v.optional(v.id("users")) },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    if (args.userId) {
      const row = await ctx.db
        .query("githubConnections")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .first();
      if (row?.accessToken) return row.accessToken;
    }
    // ponytail: deployment fallback for webhook audits without user context
    return process.env.GITHUB_TOKEN ?? null;
  },
});

export const upsertGithubConnection = mutation({
  args: {
    state: v.string(),
    githubLogin: v.string(),
    accessToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("githubOAuthStates")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();
    if (!pending || Date.now() - pending.createdAt > 15 * 60 * 1000) {
      throw new Error("Invalid or expired OAuth state");
    }

    const existing = await ctx.db
      .query("githubConnections")
      .withIndex("by_user", (q) => q.eq("userId", pending.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        githubLogin: args.githubLogin,
        accessToken: args.accessToken,
        connectedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("githubConnections", {
        userId: pending.userId,
        githubLogin: args.githubLogin,
        accessToken: args.accessToken,
        connectedAt: Date.now(),
      });
    }

    await ctx.db.delete(pending._id);
    return null;
  },
});

export const getOAuthStateUser = internalQuery({
  args: { state: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("githubOAuthStates")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();
    if (!pending || Date.now() - pending.createdAt > 15 * 60 * 1000) return null;
    return pending.userId;
  },
});
