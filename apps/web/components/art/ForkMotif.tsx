export function ForkMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden
    >
      <path
        d="M60 8 L60 80 M60 80 L28 148 M60 80 L92 148"
        stroke="rgba(77, 107, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M60 40 L44 72 M60 40 L76 72"
        stroke="rgba(77, 107, 255, 0.12)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
