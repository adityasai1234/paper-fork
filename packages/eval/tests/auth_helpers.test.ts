import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertResourceAccess,
  canAccessResource,
  timingSafeEqual,
  validateWebhookSecret,
} from "../../../convex/lib/auth_helpers";

describe("timingSafeEqual", () => {
  it("matches equal strings", () => {
    assert.equal(timingSafeEqual("secret", "secret"), true);
  });

  it("rejects different lengths", () => {
    assert.equal(timingSafeEqual("short", "longer"), false);
  });

  it("rejects same-length mismatches", () => {
    assert.equal(timingSafeEqual("aaaa", "aaab"), false);
  });
});

describe("validateWebhookSecret", () => {
  it("returns 503 when env not configured", () => {
    const result = validateWebhookSecret("x", undefined);
    assert.deepEqual(result, { ok: false, status: 503, error: "webhook not configured" });
  });

  it("returns 401 for missing secret", () => {
    const result = validateWebhookSecret(undefined, "expected");
    assert.deepEqual(result, { ok: false, status: 401, error: "unauthorized" });
  });

  it("returns 401 for wrong secret", () => {
    const result = validateWebhookSecret("wrong", "expected");
    assert.deepEqual(result, { ok: false, status: 401, error: "unauthorized" });
  });

  it("accepts matching secret", () => {
    const result = validateWebhookSecret("expected", "expected");
    assert.deepEqual(result, { ok: true });
  });
});

describe("assertResourceAccess", () => {
  const userA = "userA" as never;
  const userB = "userB" as never;

  it("allows owner access", () => {
    assert.doesNotThrow(() =>
      assertResourceAccess({
        resourceUserId: userA,
        callerUserId: userA,
      })
    );
  });

  it("allows session match for legacy rows", () => {
    assert.doesNotThrow(() =>
      assertResourceAccess({
        resourceSessionId: "sess-1",
        providedSessionId: "sess-1",
      })
    );
  });

  it("denies unrelated caller without session", () => {
    assert.throws(
      () =>
        assertResourceAccess({
          resourceUserId: userA,
          callerUserId: userB,
          resourceSessionId: "sess-1",
          providedSessionId: "sess-2",
        }),
      /Unauthorized/
    );
  });

  it("canAccessResource mirrors assertResourceAccess", () => {
    assert.equal(
      canAccessResource({
        resourceUserId: userA,
        callerUserId: userA,
      }),
      true
    );
    assert.equal(
      canAccessResource({
        resourceUserId: userA,
        callerUserId: userB,
      }),
      false
    );
  });
});
