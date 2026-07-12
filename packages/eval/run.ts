/**
 * Paperfork eval runner.
 *
 * Extraction paths:
 * - Default: fork-rules fixtures (no network, no Gateway) — always runs.
 * - --no-llm: skips methods fixture (abstract-only rubric path).
 *
 * Regex vs Gateway in production:
 * - Regex: literature/methods workers when AI_GATEWAY_API_KEY unset or LLM throws.
 * - Gateway: structured evalProtocol + sectionClaims; required for full micro-audit depth.
 * - PAPERFORK_LLM_MOCK=1: dry-run Gateway calls in Convex actions (empty structured output).
 */
import { parseArxivAtom } from "../../convex/lib/arxiv-fetch";
import { scoreFixture, scoreMethodsFixture } from "./rubric";

const noLlm = process.argv.includes("--no-llm");

// ponytail: atom parser sanity (issue #31)
const atomSample = parseArxivAtom(
  '<feed><title>Feed</title><entry><title>Paper Title</title><summary>5-fold CV.</summary></entry></feed>'
);
if (atomSample.title !== "Paper Title" || !atomSample.abstract?.includes("5-fold")) {
  console.log("Paperfork eval: FAIL (arxiv atom parser)");
  process.exit(1);
}

const abstract = scoreFixture();
const methods = noLlm ? null : scoreMethodsFixture();

const passed = abstract.passed && (noLlm || methods!.passed);

const parts = [`${abstract.forkedCount} FORKED on abstract fixture`];
if (methods) {
  parts.push(`${methods.forkedCount} FORKED on methods fixture`);
} else {
  parts.push("methods fixture skipped (--no-llm)");
}

console.log(`Paperfork eval: ${passed ? "PASS" : "FAIL"} (${parts.join("; ")})`);
process.exit(passed ? 0 : 1);
