"use node";

import { createGroq } from "@ai-sdk/groq";
import {
  APICallError,
  generateText,
  NoObjectGeneratedError,
  Output,
  type LanguageModelUsage,
} from "ai";
import type { z } from "zod";

const DEFAULT_MODEL = process.env.PAPERFORK_LLM_MODEL ?? "openai/gpt-5.4";
const FALLBACK_MODEL = "anthropic/claude-sonnet-4.6";
const GROQ_GATEWAY_MODEL =
  process.env.PAPERFORK_LLM_GROQ_MODEL ?? "groq/llama-3.3-70b-versatile";
const GROQ_DIRECT_MODEL = process.env.PAPERFORK_GROQ_MODEL ?? "llama-3.3-70b-versatile";

export function isGatewayAvailable(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export function isGroqDirectAvailable(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function isLlmAvailable(): boolean {
  return isGatewayAvailable() || isGroqDirectAvailable();
}

/** Deterministic mock for local eval / dry-run (no Gateway calls). */
export function isMockLlmMode(): boolean {
  return process.env.PAPERFORK_LLM_MOCK === "1";
}

export type ExtractStructuredArgs<T extends z.ZodTypeAny> = {
  schema: T;
  name: string;
  description: string;
  system: string;
  prompt: string;
  model?: string;
  auditId?: string;
  worker?: string;
  tags?: string[];
  maxOutputTokens?: number;
};

export type ExtractStructuredResult<T> = {
  output: T;
  usage: LanguageModelUsage;
  model: string;
  primaryModel: string;
  usedFallback: boolean;
  provider: "gateway" | "groq" | "mock";
};

const ZERO_USAGE: LanguageModelUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
};

export async function extractStructured<T extends z.ZodTypeAny>(
  args: ExtractStructuredArgs<T>
): Promise<ExtractStructuredResult<z.infer<T>>> {
  const primaryModel = args.model ?? DEFAULT_MODEL;

  if (isMockLlmMode()) {
    const output = mockStructuredOutput(args.name) as z.infer<T>;
    return {
      output,
      usage: ZERO_USAGE,
      model: "mock",
      primaryModel: "mock",
      usedFallback: false,
      provider: "mock",
    };
  }

  if (isGatewayAvailable()) {
    try {
      return await callGatewayExtract(args, primaryModel, primaryModel, false);
    } catch (error) {
      if (shouldTryGatewayFallback(error)) {
        try {
          return await callGatewayExtract(args, FALLBACK_MODEL, primaryModel, true);
        } catch (fallbackError) {
          if (isGroqDirectAvailable() && shouldTryDirectGroq(fallbackError)) {
            return await callGroqDirectExtract(args, primaryModel);
          }
          throw mapGatewayError(fallbackError);
        }
      }
      if (isGroqDirectAvailable() && shouldTryDirectGroq(error)) {
        return await callGroqDirectExtract(args, primaryModel);
      }
      throw mapGatewayError(error);
    }
  }

  if (isGroqDirectAvailable()) {
    return await callGroqDirectExtract(args, primaryModel);
  }

  throw new Error("No LLM provider configured (AI_GATEWAY_API_KEY or GROQ_API_KEY)");
}

function shouldTryGatewayFallback(error: unknown): boolean {
  return (
    NoObjectGeneratedError.isInstance(error) ||
    (APICallError.isInstance(error) && error.isRetryable)
  );
}

function shouldTryDirectGroq(error: unknown): boolean {
  if (NoObjectGeneratedError.isInstance(error)) return false;
  if (APICallError.isInstance(error)) {
    const code = error.statusCode ?? 0;
    return code === 402 || code === 429 || code >= 500 || error.isRetryable;
  }
  return true;
}

async function callGatewayExtract<T extends z.ZodTypeAny>(
  args: ExtractStructuredArgs<T>,
  model: string,
  primaryModel: string,
  usedFallback: boolean
): Promise<ExtractStructuredResult<z.infer<T>>> {
  const gatewayTags = buildGatewayTags(args);

  const { output, usage } = await generateText({
    model,
    output: Output.object({
      name: args.name,
      description: args.description,
      schema: args.schema,
    }),
    system: args.system,
    prompt: args.prompt,
    temperature: 0,
    maxOutputTokens: args.maxOutputTokens ?? 2048,
    maxRetries: 2,
    providerOptions: {
      gateway: {
        models: [FALLBACK_MODEL, GROQ_GATEWAY_MODEL],
        tags: gatewayTags,
        ...(args.auditId ? { user: args.auditId } : {}),
      },
    },
  });

  return {
    output,
    usage,
    model,
    primaryModel,
    usedFallback,
    provider: "gateway",
  };
}

async function callGroqDirectExtract<T extends z.ZodTypeAny>(
  args: ExtractStructuredArgs<T>,
  primaryModel: string
): Promise<ExtractStructuredResult<z.infer<T>>> {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const { output, usage } = await generateText({
    model: groq(GROQ_DIRECT_MODEL),
    output: Output.object({
      name: args.name,
      description: args.description,
      schema: args.schema,
    }),
    system: args.system,
    prompt: args.prompt,
    temperature: 0,
    maxOutputTokens: args.maxOutputTokens ?? 2048,
    maxRetries: 2,
  });

  return {
    output,
    usage,
    model: `groq/${GROQ_DIRECT_MODEL}`,
    primaryModel,
    usedFallback: true,
    provider: "groq",
  };
}

function buildGatewayTags(args: ExtractStructuredArgs<z.ZodTypeAny>): string[] {
  return [
    "feature:micro-audit",
    ...(args.worker ? [`worker:${args.worker}`] : []),
    ...(args.auditId ? [`audit:${args.auditId}`] : []),
    ...(args.tags ?? []),
  ];
}

function mockStructuredOutput(name: string): unknown {
  if (name === "RepoEvalSignals") {
    return {
      splits: null,
      seeds: null,
      metrics: [],
      baselines: [],
      hardware: null,
      checkpointPolicy: null,
    };
  }
  if (name === "GapFills") {
    return { gapFills: [] };
  }
  if (name === "Adjudication") {
    return { verdict: "UNVERIFIABLE", reasoning: "mock" };
  }
  return {
    evalProtocol: {
      splits: null,
      seeds: null,
      metrics: [],
      baselines: [],
      datasets: [],
      hardware: null,
      checkpointPolicy: null,
      summary: "Mock LLM mode (PAPERFORK_LLM_MOCK=1)",
    },
    sectionClaims: [],
  };
}

function mapGatewayError(error: unknown): Error {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 402) {
      return new Error("AI Gateway budget exceeded");
    }
    if (error.statusCode === 429) {
      const retryAfter = error.responseHeaders?.["retry-after"];
      return new Error(`AI Gateway rate limited; retry after ${retryAfter ?? "60"}s`);
    }
    return new Error(`AI Gateway error ${error.statusCode}: ${error.message}`);
  }
  if (NoObjectGeneratedError.isInstance(error)) {
    return new Error(`Structured output failed: ${error.finishReason}`);
  }
  if (error instanceof Error) return error;
  return new Error(String(error));
}

export function llmTurnPayload(
  model: string,
  usage: LanguageModelUsage,
  worker: string,
  tags: string[],
  extras?: { primaryModel?: string; usedFallback?: boolean; provider?: string }
) {
  return {
    model,
    worker,
    tags,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    ...(extras?.primaryModel ? { primaryModel: extras.primaryModel } : {}),
    ...(extras?.usedFallback ? { usedFallback: true } : {}),
    ...(extras?.provider ? { provider: extras.provider } : {}),
  };
}
