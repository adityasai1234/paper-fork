import { AGENT_TREE } from "@/components/landing/data";

export function HeroArtPanel() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-white/50">
            paperfork — live audit
          </span>
        </div>
        <div className="space-y-4 p-5 font-mono text-[11px] leading-relaxed text-white/85">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-signal">Input</p>
            <p className="mt-1">paper: 1706.03762 · repo: github.com/tensorflow/tensor2tensor</p>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-white/10 bg-[#0a0c14] p-3 text-[10px] leading-relaxed text-emerald-200/90">
            {AGENT_TREE}
          </pre>
          <div className="grid grid-cols-3 gap-2">
            {["literature", "repo", "web"].map((worker) => (
              <div
                key={worker}
                className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-2 text-center text-[10px] uppercase tracking-wide text-amber-100"
              >
                {worker}
                <span className="mt-1 block text-[9px] text-amber-200/70">running</span>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-[10px] uppercase tracking-wider text-red-300">Verdict</p>
            <p className="mt-1 font-display text-sm text-red-200">
              Forked — missing eval seeds
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
        Real-time hierarchy · session forensics · memory recall · fork report
      </p>
    </div>
  );
}
