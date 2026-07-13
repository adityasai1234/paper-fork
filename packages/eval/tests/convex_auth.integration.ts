import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import schema from "../../../convex/schema";

const modules = import.meta.glob("../../../convex/**/*.ts");

describe("convex auth enforcement", () => {
  it("createAudit throws without identity", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.audits.createAudit, {
        paperId: "2401.12345",
        paperIdType: "arxiv",
        githubUrl: "https://github.com/owner/repo",
      })
    ).rejects.toThrow(/Unauthenticated/);
  });

  it("createAudit succeeds with identity and stores userId", async () => {
    const t = convexTest(schema, modules);
    const userId = (await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    })) as Id<"users">;

    const asUser = t.withIdentity({ subject: userId });
    const result = await asUser.mutation(api.audits.createAudit, {
      paperId: "2401.12345",
      paperIdType: "arxiv",
      githubUrl: "https://github.com/owner/repo",
    });

    const audit = await t.run(async (ctx) => ctx.db.get(result.auditId));
    expect(audit?.userId).toBe(userId);
    expect(typeof result.sessionId).toBe("string");
  });

  it("getAudit denies a different user without matching session", async () => {
    const t = convexTest(schema, modules);
    const ownerId = (await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    })) as Id<"users">;
    const otherId = (await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    })) as Id<"users">;

    const asOwner = t.withIdentity({ subject: ownerId });
    const { auditId } = await asOwner.mutation(api.audits.createAudit, {
      paperId: "2401.12345",
      paperIdType: "arxiv",
      githubUrl: "https://github.com/owner/repo",
    });

    const asOther = t.withIdentity({ subject: otherId });
    const denied = await asOther.query(api.audits.getAudit, { auditId });
    expect(denied).toBeNull();
  });

  it("getAudit allows owner access", async () => {
    const t = convexTest(schema, modules);
    const userId = (await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    })) as Id<"users">;

    const asUser = t.withIdentity({ subject: userId });
    const { auditId } = await asUser.mutation(api.audits.createAudit, {
      paperId: "2401.12345",
      paperIdType: "arxiv",
      githubUrl: "https://github.com/owner/repo",
    });

    const audit = await asUser.query(api.audits.getAudit, { auditId });
    expect(audit?._id).toBe(auditId);
  });

  it("getAudit allows session access for legacy rows", async () => {
    const t = convexTest(schema, modules);
    const sessionId = "legacy-session-123";
    const auditId = (await t.run(async (ctx) => {
      return await ctx.db.insert("audits", {
        paperId: "2401.12345",
        paperIdType: "arxiv",
        githubUrl: "https://github.com/owner/repo",
        status: "queued",
        chips: {
          literature: "pending",
          repo: "pending",
          web: "pending",
          methods: "pending",
        },
        sessionId,
        createdAt: Date.now(),
      });
    })) as Id<"audits">;

    const audit = await t.query(api.audits.getAudit, { auditId, sessionId });
    expect(audit?.sessionId).toBe(sessionId);
  });

  it("createAuditWebhook works without identity", async () => {
    const t = convexTest(schema, modules);
    const result = await t.mutation(internal.audits.createAuditWebhook, {
      paperId: "2401.12345",
      paperIdType: "arxiv",
      githubUrl: "https://github.com/owner/repo",
    });

    expect(typeof result.auditId).toBe("string");
    expect(typeof result.sessionId).toBe("string");
  });
});
