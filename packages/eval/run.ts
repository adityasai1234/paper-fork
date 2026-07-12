import { scoreFixture } from "./rubric";

const result = scoreFixture();
console.log(`Paperfork eval: ${result.passed ? "PASS" : "FAIL"} (${result.forkedCount} FORKED on fixture)`);
process.exit(result.passed ? 0 : 1);
