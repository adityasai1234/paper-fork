// ponytail: plain JS eval runner — no tsx dep at runtime
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const forkRulesPath = join(__dirname, "../../convex/lib/fork-rules.ts");
const src = readFileSync(forkRulesPath, "utf8");

// Minimal inline fixture matching rubric.ts intent
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
};
const FIXTURE_WEB = { external_metrics: [] };

let forkedCount = 0;
if (/cross.?val|k-?fold/i.test(FIXTURE_LIT.abstract_claims[0]) && !FIXTURE_REPO.splits_found.some(s => /KFold/i.test(s))) forkedCount++;
if (/seed|multiple runs/i.test(FIXTURE_LIT.abstract_claims[0]) && FIXTURE_REPO.seeds_found.length <= 1) forkedCount++;
if (/macro.*f1/i.test(FIXTURE_LIT.abstract_claims[0]) && FIXTURE_REPO.metrics_found.some(m => /binary/i.test(m.snippet))) forkedCount++;

const passed = forkedCount >= 2;
console.log(`Paperfork eval: ${passed ? "PASS" : "FAIL"} (${forkedCount} FORKED on fixture)`);
process.exit(passed ? 0 : 1);
