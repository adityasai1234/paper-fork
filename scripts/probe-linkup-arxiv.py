#!/usr/bin/env python3
"""Probe the Linkup arXiv research prompt without exposing credentials."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATH = ROOT / "packages/agents/linkup-arxiv-research-prompt.md"
SCHEMA_PATH = ROOT / "packages/agents/linkup-arxiv-research-schema.json"


def load_local_env() -> None:
    for name in (".env", ".env.local"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line and not line.lstrip().startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--arxiv-id", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--github-url", default="not_provided")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_local_env()
    api_key = os.environ.get("LINKUP_API_KEY")
    if not api_key:
        raise SystemExit("LINKUP_API_KEY is not configured")

    prompt = PROMPT_PATH.read_text(encoding="utf-8")
    prompt = (
        prompt.replace("{{ARXIV_ID}}", args.arxiv_id)
        .replace("{{PAPER_TITLE}}", args.title)
        .replace("{{GITHUB_URL}}", args.github_url)
    )
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    payload = json.dumps(
        {
            "q": prompt,
            "depth": "deep",
            "outputType": "structured",
            "structuredOutputSchema": schema,
        }
    ).encode()
    request = Request(
        "https://api.linkup.so/v1/search",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urlopen(request, timeout=180) as response:
        result = json.load(response)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    structured = result.get("structuredOutput", result)
    print(
        json.dumps(
            {
                "output": str(output),
                "sources": len(structured.get("sources", [])),
                "results": len(structured.get("reported_results", [])),
                "alignment_items": len(structured.get("repository_alignment", [])),
                "gaps": len(structured.get("research_gaps", [])),
            }
        )
    )


if __name__ == "__main__":
    main()
