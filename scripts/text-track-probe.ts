#!/usr/bin/env npx tsx
/**
 * Text-track coverage probe for a paper id.
 * Usage: npx tsx scripts/text-track-probe.ts [paperId] [arxiv|doi]
 * Example: npx tsx scripts/text-track-probe.ts 2401.00001 arxiv
 */
import { probeTextTracks } from "../convex/lib/paper_fetch";

const paperId = process.argv[2] ?? "2401.00001";
const paperIdType = (process.argv[3] === "doi" ? "doi" : "arxiv") as "arxiv" | "doi";

async function main() {
  const result = await probeTextTracks(paperId, paperIdType);

  console.log(`Paperfork text-track probe: ${paperId} (${paperIdType})`);
  console.log(
    `  arXiv:  ${result.arxiv.ok ? "ok" : "fail"} abstract=${result.arxiv.abstractLen} chars${result.arxiv.error ? ` (${result.arxiv.error})` : ""}`
  );
  console.log(
    `  HTML:   status=${result.html.status} sections=[${result.html.sections.join(", ")}] mode=${result.html.parseMode}`
  );
  console.log(
    `  Linkup: ${result.linkup.configured ? "configured" : "LINKUP_API_KEY not set"}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
