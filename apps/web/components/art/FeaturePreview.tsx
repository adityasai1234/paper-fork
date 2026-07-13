import type { ReactNode } from "react";

type PreviewKind =
  | "literature"
  | "repo"
  | "web"
  | "fork-rules"
  | "judge"
  | "outputs";

const PREVIEWS: Record<PreviewKind, ReactNode> = {
  literature: (
    <div className="space-y-2 p-3 font-mono text-[10px] text-white/80">
      <p className="text-signal">ARXIV · 1706.03762</p>
      <p className="text-white/60">Attention Is All You Need</p>
      <p className="border-t border-white/10 pt-2 text-white/50">
        claims: 8 · sections: abstract, methods, results
      </p>
    </div>
  ),
  repo: (
    <div className="space-y-1 p-3 font-mono text-[10px] text-emerald-200/80">
      <p>src/train.py</p>
      <p className="text-white/40">├── configs/default.yaml</p>
      <p className="text-white/40">├── scripts/eval.sh</p>
      <p className="text-amber-200/70">└── README.md ← mismatch</p>
    </div>
  ),
  web: (
    <div className="space-y-2 p-3 font-mono text-[10px]">
      <p className="text-sky-300/90">linkup · deep search</p>
      <p className="text-white/50">paperswithcode.com/method/...</p>
      <p className="text-white/50">huggingface.co/models/...</p>
    </div>
  ),
  "fork-rules": (
    <div className="grid grid-cols-2 gap-2 p-3 font-mono text-[9px] uppercase tracking-wide">
      <span className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1.5 text-red-200">
        seeds ✗
      </span>
      <span className="rounded border border-emerald-400/30 bg-emerald-500/10 px-2 py-1.5 text-emerald-200">
        metrics ✓
      </span>
      <span className="rounded border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-amber-200">
        splits ?
      </span>
      <span className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1.5 text-red-200">
        repro ✗
      </span>
    </div>
  ),
  judge: (
    <div className="space-y-2 p-3 font-mono text-[10px]">
      <p className="text-violet-300/90">judge + gap-filler</p>
      <p className="text-red-300/90">FORKED · 3 ledger rows</p>
      <p className="text-white/45">memory: recurring seed gap (2 audits)</p>
    </div>
  ),
  outputs: (
    <div className="space-y-2 p-3 font-mono text-[10px] text-white/70">
      <p>github issue draft</p>
      <p>readme patch · voice brief</p>
      <p className="text-signal">cron re-audit scheduled</p>
    </div>
  ),
};

export function FeaturePreview({ kind }: { kind: PreviewKind }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-black/25 backdrop-blur-sm">
      <div className="border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
        Preview
      </div>
      <div className="aspect-[4/3]">{PREVIEWS[kind]}</div>
    </div>
  );
}
