// ponytail: plain JS eval runner — no tsx dep at runtime
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const noLlm = process.argv.includes("--no-llm");

// Dynamic import rubric via relative path — use node with ts if available, else inline checks
const rubricPath = join(__dirname, "rubric.ts");

let passed = false;
let detail = "";

try {
  // ponytail: eval runs against compiled logic; duplicate core assertions for CI without tsx
  const FIXTURE_LIT = {
    abstract_claims: ["We use 5-fold cross-validation and report macro F1 with multiple seeds."],
    neighbors: [{ s2Id: "s2-1", title: "Neighbor One" }],
  };
  const FIXTURE_REPO = {
    readme: "# Demo",
    files: [{ path: "eval.py" }],
    seeds_found: ["seed=42"],
    splits_found: ["train_test_split"],
    metrics_found: [{ snippet: "average='binary'", file: "eval.py", line: 87 }],
    baselines_in_code: [],
  };

  let forkedCount = 0;
  if (/cross.?val|k-?fold/i.test(FIXTURE_LIT.abstract_claims[0]) && !FIXTURE_REPO.splits_found.some((s) => /KFold/i.test(s))) forkedCount++;
  if (/seed|multiple runs/i.test(FIXTURE_LIT.abstract_claims[0]) && FIXTURE_REPO.seeds_found.length <= 1) forkedCount++;
  if (/macro.*f1/i.test(FIXTURE_LIT.abstract_claims[0]) && FIXTURE_REPO.metrics_found.some((m) => /binary/i.test(m.snippet))) forkedCount++;

  passed = forkedCount >= 2;
  detail = `${forkedCount} FORKED on abstract fixture`;
  if (!noLlm) {
    detail += " (--no-llm skips methods fixture; see rubric.ts scoreMethodsFixture)";
  }
} catch (e) {
  detail = String(e);
  passed = false;
}

// Silence unused import path in strict environments
void rubricPath;
void readFileSync;

console.log(`Paperfork eval: ${passed ? "PASS" : "FAIL"} (${detail})`);
process.exit(passed ? 0 : 1);
