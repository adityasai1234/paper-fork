"use node";

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

export function isLlmAvailable(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
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
};

export async function extractStructured<T extends z.ZodTypeAny>(
  args: ExtractStructuredArgs<T>
): Promise<ExtractStructuredResult<z.infer<T>>> {
  const primaryModel = args.model ?? DEFAULT_MODEL;
  try {
    return await callExtract(args, primaryModel);
  } catch (error) {
    if (
      primaryModel !== FALLBACK_MODEL &&
      (NoObjectGeneratedError.isInstance(error) ||
        (APICallError.isInstance(error) && error.isRetryable))
    ) {
      return await callExtract(args, FALLBACK_MODEL);
    }
    throw mapGatewayError(error);
  }
}

async function callExtract<T extends z.ZodTypeAny>(
  args: ExtractStructuredArgs<T>,
  model: string
): Promise<ExtractStructuredResult<z.infer<T>>> {
  const gatewayTags = [
    "feature:micro-audit",
    ...(args.worker ? [`worker:${args.worker}`] : []),
    ...(args.auditId ? [`audit:${args.auditId}`] : []),
    ...(args.tags ?? []),
  ];

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
        models: [FALLBACK_MODEL],
        tags: gatewayTags,
        ...(args.auditId ? { user: args.auditId } : {}),
      },
    },
  });

  return { output, usage, model };
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
  tags: string[]
) {
  return {
    model,
    worker,
    tags,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };
}
