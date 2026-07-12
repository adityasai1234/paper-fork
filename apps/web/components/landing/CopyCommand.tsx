"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-white/20 bg-white/95 px-4 py-3 font-mono text-xs text-black shadow-lg",
        className
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 rounded border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-black/70 hover:bg-black/5"
        aria-label="Copy command"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
