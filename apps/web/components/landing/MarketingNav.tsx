"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GITHUB_REPO } from "./data";

const NAV_ITEMS = [
  { label: "Product", href: "/#product" },
  { label: "Research loop", href: "/#research-loop" },
  { label: "Evidence", href: "/#evidence" },
] as const;

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="marketing-nav">
      <div className="marketing-container marketing-nav-inner">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">pf/</span>
          <span>Paperfork</span>
        </Link>

        <nav className="marketing-nav-links" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>

        <div className="marketing-nav-actions">
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <Link className="ui-button ui-button-primary nav-cta" href="/login">
            <span className="nav-cta-full">Open workspace</span>
            <span className="nav-cta-short">Open</span>
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
          <div className="marketing-container mobile-navigation-inner">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
