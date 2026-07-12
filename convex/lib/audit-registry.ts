import { z } from "zod";

export const AUDIT_DIMENSIONS = [
  "splits",
  "seeds",
  "metrics",
  "baselines",
  "data_leakage",
  "hardware",
  "checkpoints",
  "eval_protocol",
] as const;

export type AuditDimension = (typeof AUDIT_DIMENSIONS)[number];

export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const sectionClaimSchema = z.object({
  id: z.string(),
  section: z.string(),
  text: z.string(),
  dimension: z.enum(AUDIT_DIMENSIONS),
  quote: z.string().nullable(),
  confidence: confidenceSchema,
});

export type SectionClaim = z.infer<typeof sectionClaimSchema>;

export const evalProtocolSchema = z.object({
  splits: z.string().nullable(),
  seeds: z.string().nullable(),
  metrics: z.array(z.string()),
  baselines: z.array(z.string()),
  datasets: z.array(z.string()),
  hardware: z.string().nullable(),
  checkpointPolicy: z.string().nullable(),
  summary: z.string(),
});

export type EvalProtocol = z.infer<typeof evalProtocolSchema>;

export const methodsOutputSchema = z.object({
  evalProtocol: evalProtocolSchema,
  sectionClaims: z.array(sectionClaimSchema),
});

export type MethodsOutput = z.infer<typeof methodsOutputSchema>;

export const repoEvalSignalsSchema = z.object({
  splits: z.string().nullable(),
  seeds: z.string().nullable(),
  metrics: z.array(z.string()),
  baselines: z.array(z.string()),
  hardware: z.string().nullable(),
  checkpointPolicy: z.string().nullable(),
});

export type RepoEvalSignals = z.infer<typeof repoEvalSignalsSchema>;

export const PAPER_SECTIONS = [
  "abstract",
  "introduction",
  "methods",
  "experiments",
  "results",
  "discussion",
  "appendix",
] as const;

export type PaperSection = (typeof PAPER_SECTIONS)[number];

export type PaperSections = Partial<Record<PaperSection, string>>;

const DEPTH_KEYWORDS =
  /fold|seed|f1|accuracy|baseline|dataset|split|macro|hardware|checkpoint|cross.?val|auroc|precision|recall/i;

/** Shared eval-sentence gate for abstract + section regex extraction. */
export const EVAL_SENTENCE_PATTERN =
  /fold|seed|f1|metric|baseline|split|checkpoint|hardware|eval|test set|validation|auroc|accuracy|cross.?val|dataset/i;

export function classifyClaimDimension(text: string): AuditDimension {
  if (/fold|split|holdout|cross.?val/i.test(text)) return "splits";
  if (/seed|random/i.test(text)) return "seeds";
  if (/f1|auroc|accuracy|metric|precision|recall/i.test(text)) return "metrics";
  if (/baseline|sota|compare/i.test(text)) return "baselines";
  if (/gpu|cuda|batch|hardware|v100|a100/i.test(text)) return "hardware";
  if (/checkpoint|epoch|best model/i.test(text)) return "checkpoints";
  if (/leak|test set tuning|contamination/i.test(text)) return "data_leakage";
  return "eval_protocol";
}

export function extractEvalClaimsFromText(section: string, text: string): SectionClaim[] {
  const claims: SectionClaim[] = [];
  const sentences = text.split(/\.\s+/).filter((s) => s.length > 20);
  let idx = 0;
  for (const s of sentences) {
    if (!EVAL_SENTENCE_PATTERN.test(s)) continue;
    claims.push({
      id: `${section}:${idx++}`,
      section,
      text: s.trim(),
      dimension: classifyClaimDimension(s),
      quote: s.trim().slice(0, 200),
      confidence: "medium",
    });
  }
  return claims;
}

export function regexMethodsFromSections(
  sections: Array<{ name: string; text: string }>
): MethodsOutput {
  const sectionClaims = sections.flatMap((s) => extractEvalClaimsFromText(s.name, s.text));
  const splitsClaim = sectionClaims.find((c) => c.dimension === "splits");
  const seedsClaim = sectionClaims.find((c) => c.dimension === "seeds");
  const metrics = sectionClaims.filter((c) => c.dimension === "metrics").map((c) => c.text);
  const baselines = sectionClaims.filter((c) => c.dimension === "baselines").map((c) => c.text);

  const summary =
    sectionClaims.length === 0
      ? "No detailed evaluation protocol found in paper sections."
      : `How this paper evaluates: ${sectionClaims
          .slice(0, 4)
          .map((c) => `${c.section}: ${c.text}`)
          .join("; ")}`;

  return {
    evalProtocol: {
      splits: splitsClaim?.text ?? null,
      seeds: seedsClaim?.text ?? null,
      metrics,
      baselines,
      datasets: [],
      hardware: sectionClaims.find((c) => c.dimension === "hardware")?.text ?? null,
      checkpointPolicy: sectionClaims.find((c) => c.dimension === "checkpoints")?.text ?? null,
      summary,
    },
    sectionClaims,
  };
}

export function shouldFetchFullText(
  abstractClaims: string[],
  abstract?: string
): boolean {
  if (abstractClaims.length === 0) return Boolean(abstract && abstract.length > 80);
  const joined = abstractClaims.join(" ");
  const needsDetail = /fold|seed|macro|baseline|split|checkpoint|hardware/i.test(joined);
  const lacksSectionRefs = !/section|table|appendix|§|\d+\.\d+/i.test(joined);
  return needsDetail && lacksSectionRefs;
}

export function extractRegexClaims(abstract: string): string[] {
  const claims: string[] = [];
  const sentences = abstract.split(/\.\s+/).filter(Boolean);
  for (const s of sentences) {
    if (DEPTH_KEYWORDS.test(s)) claims.push(s.trim());
  }
  if (claims.length === 0 && abstract.length > 0) {
    claims.push(abstract.slice(0, 200));
  }
  return claims;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, maxChars = 48_000): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

export function emptyEvalProtocol(summary: string): EvalProtocol {
  return {
    splits: null,
    seeds: null,
    metrics: [],
    baselines: [],
    datasets: [],
    hardware: null,
    checkpointPolicy: null,
    summary,
  };
}

export const CHECKLIST_LABELS: Record<AuditDimension, string> = {
  splits: "splits",
  seeds: "seeds",
  metrics: "metrics",
  baselines: "baselines",
  data_leakage: "data leakage",
  hardware: "hardware",
  checkpoints: "checkpoints",
  eval_protocol: "eval protocol",
};

export function buildChecklistFromRegistry(
  repo: { seeds_found: string[]; splits_found: string[]; deps: string[]; baselines_in_code: string[] },
  methods: { evalProtocol: EvalProtocol } | undefined,
  findings: Array<{ claim: string; verdict: string; dimension?: string; repoEvidence?: string }>
): Array<{ item: string; status: "red" | "amber" | "green"; evidence: string }> {
  return AUDIT_DIMENSIONS.map((dim) => {
    const label = CHECKLIST_LABELS[dim];
    const related = findings.find(
      (f) => f.dimension === dim || f.claim.toLowerCase().includes(label)
    );
    if (related?.verdict === "FORKED") {
      return { item: label, status: "red" as const, evidence: related.repoEvidence ?? related.claim };
    }

    const protocol = methods?.evalProtocol;
    switch (dim) {
      case "splits":
        if (repo.splits_found.length > 0) {
          return { item: label, status: "green" as const, evidence: repo.splits_found.join(", ") };
        }
        if (protocol?.splits) {
          return { item: label, status: "amber" as const, evidence: `Paper: ${protocol.splits}` };
        }
        break;
      case "seeds":
        if (repo.seeds_found.length > 1) {
          return { item: label, status: "green" as const, evidence: `${repo.seeds_found.length} seed refs` };
        }
        if (protocol?.seeds) {
          return { item: label, status: "amber" as const, evidence: `Paper: ${protocol.seeds}` };
        }
        break;
      case "metrics":
        if (protocol?.metrics.length) {
          return { item: label, status: "amber" as const, evidence: protocol.metrics.join(", ") };
        }
        break;
      case "baselines":
        if (repo.baselines_in_code.length > 0) {
          return { item: label, status: "green" as const, evidence: repo.baselines_in_code.join(", ") };
        }
        if (protocol?.baselines.length) {
          return { item: label, status: "amber" as const, evidence: `Paper baselines: ${protocol.baselines.join(", ")}` };
        }
        break;
      case "deps":
        if (repo.deps.length > 0) {
          return { item: label, status: "green" as const, evidence: `${repo.deps.length} deps listed` };
        }
        break;
      case "eval_protocol":
        if (protocol?.summary && protocol.summary.length > 40) {
          return { item: label, status: "green" as const, evidence: protocol.summary.slice(0, 120) };
        }
        break;
      case "hardware":
        if (protocol?.hardware) {
          return { item: label, status: "amber" as const, evidence: protocol.hardware };
        }
        break;
      case "checkpoints":
        if (protocol?.checkpointPolicy) {
          return { item: label, status: "amber" as const, evidence: protocol.checkpointPolicy };
        }
        break;
      default: {
        const _exhaustive: never = dim;
        return _exhaustive;
      }
    }
    return { item: label, status: "amber" as const, evidence: "NEEDS_USER" };
  });
}
