import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  isGatewayAvailable,
  isGroqDirectAvailable,
  isLlmAvailable,
  isMockLlmMode,
  isStructuredLlmAvailable,
} from "../../../convex/lib/ai_gateway";

const ENV_KEYS = [
  "AI_GATEWAY_API_KEY",
  "VERCEL_OIDC_TOKEN",
  "GROQ_API_KEY",
  "PAPERFORK_LLM_MOCK",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe("ai_gateway env helpers", () => {
  it("isGatewayAvailable when AI_GATEWAY_API_KEY set", () => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
    assert.equal(isGatewayAvailable(), true);
  });

  it("isGatewayAvailable when VERCEL_OIDC_TOKEN set", () => {
    process.env.VERCEL_OIDC_TOKEN = "oidc";
    assert.equal(isGatewayAvailable(), true);
  });

  it("isGroqDirectAvailable when GROQ_API_KEY set", () => {
    process.env.GROQ_API_KEY = "groq";
    assert.equal(isGroqDirectAvailable(), true);
  });

  it("isLlmAvailable when either provider configured", () => {
    assert.equal(isLlmAvailable(), false);
    process.env.GROQ_API_KEY = "groq";
    assert.equal(isLlmAvailable(), true);
  });

  it("isStructuredLlmAvailable when gateway or groq configured", () => {
    assert.equal(isStructuredLlmAvailable(), false);
    process.env.GROQ_API_KEY = "groq";
    assert.equal(isStructuredLlmAvailable(), true);
    delete process.env.GROQ_API_KEY;
    process.env.AI_GATEWAY_API_KEY = "gateway";
    assert.equal(isStructuredLlmAvailable(), true);
  });

  it("isMockLlmMode when PAPERFORK_LLM_MOCK=1", () => {
    process.env.PAPERFORK_LLM_MOCK = "1";
    assert.equal(isMockLlmMode(), true);
  });
});
