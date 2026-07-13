"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function SmReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sm-reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--sm-reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
