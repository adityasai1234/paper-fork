import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateWebhookSecret } from "../../../convex/lib/auth_helpers";

describe("webhook_auth", () => {
  it("rejects empty provided secret", () => {
    const result = validateWebhookSecret("", "configured-secret");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
  });

  it("accepts timing-safe equal secrets", () => {
    const secret = "paperfork-webhook-secret";
    const result = validateWebhookSecret(secret, secret);
    assert.deepEqual(result, { ok: true });
  });
});
