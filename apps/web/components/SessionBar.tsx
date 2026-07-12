"use client";

import { useState } from "react";

export function SessionBar({
  auditId,
  sessionId,
  status,
  urlSessionId,
  basePath = "",
  resourceType = "audit",
  label = "Session",
}: {
  auditId: string;
  sessionId?: string;
  status: string;
  urlSessionId?: string | null;
  basePath?: string;
  resourceType?: "audit" | "research";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const effectiveSession = sessionId ?? urlSessionId ?? "";
  const prefix = basePath.replace(/\/$/, "");
  const segment = resourceType === "research" ? "research" : "audit";
  const shareUrl =
    typeof window !== "undefined" && effectiveSession
      ? `${window.location.origin}${prefix}/${segment}/${auditId}?session=${effectiveSession}`
      : "";

  const mismatch =
    urlSessionId && sessionId && urlSessionId !== sessionId;

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card session-bar">
      <div className="session-bar-row">
        <div>
          <span className="session-label">{label}</span>
          <code className="session-id">{effectiveSession || "—"}</code>
        </div>
        <div>
          <span className="session-label">Status</span>
          <span className="session-status">{status}</span>
        </div>
        <button type="button" className="secondary" onClick={copyLink} disabled={!shareUrl}>
          {copied ? "Copied" : "Copy demo link"}
        </button>
      </div>
      {mismatch && (
        <p className="session-warn">URL session does not match this audit record.</p>
      )}
    </div>
  );
}
