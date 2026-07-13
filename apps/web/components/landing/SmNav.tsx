"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GITHUB_REPO } from "./data";

const NAV_ITEMS = [
  { label: "Features", href: "#catalog" },
  { label: "How it works", href: "#how" },
  { label: "Compare", href: "#compare" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: GITHUB_REPO, external: true },
  { label: "Waitlist", href: "/signup", route: true },
] as const;

function navHref(pathname: string, item: (typeof NAV_ITEMS)[number]) {
  if ("route" in item && item.route) return item.href;
  if ("external" in item && item.external) return item.href;
  return pathname === "/" ? item.href : `/${item.href}`;
}

export function SmNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function renderNavLink(item: (typeof NAV_ITEMS)[number], className?: string) {
    const href = navHref(pathname, item);
    const isExternal = "external" in item && item.external;

    if ("route" in item && item.route) {
      return (
        <Link key={item.label} href={href} className={className} onClick={() => setMenuOpen(false)}>
          {item.label}
        </Link>
      );
    }

    return (
      <a
        key={item.label}
        href={href}
        className={className}
        onClick={() => setMenuOpen(false)}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {item.label}
      </a>
    );
  }

  return (
    <header className="sm-nav">
      <div className="sm-container sm-nav-inner">
        <Link href="/" className="sm-logo no-underline hover:no-underline">
          <span className="sm-logo-mark" aria-hidden>
            ⑂
          </span>
          <span>paperfork</span>
        </Link>

        <nav className="sm-nav-links hidden lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => renderNavLink(item))}
        </nav>

        <div className="sm-nav-actions">
          <button
            type="button"
            className="sm-nav-menu-btn lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="sm-nav-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sm-nav-menu-icon" aria-hidden />
          </button>
          <Link href="/login" className="sm-btn sm-btn-ghost hidden sm:inline-flex">
            Login
          </Link>
          <Link href="/login" className="sm-btn sm-btn-primary">
            Start audit →
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="sm-nav-mobile-menu"
          className="sm-nav-mobile lg:hidden"
          aria-label="Mobile primary"
        >
          <div className="sm-container sm-nav-mobile-inner">
            {NAV_ITEMS.map((item) => renderNavLink(item, "sm-nav-mobile-link"))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
