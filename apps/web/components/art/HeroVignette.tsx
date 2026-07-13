export function HeroVignette({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[min(100%,520px)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(77, 107, 255, 0.1) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
