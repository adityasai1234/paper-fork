"use client";

import { useState } from "react";
import { routes } from "@/lib/routes";

export function SessionBar({
  auditId,
  sessionId,
  status,
  urlSessionId,
  resourceType = "audit",
  label = "Session",
}: {
  auditId: string;
  sessionId?: string;
  status: string;
  urlSessionId?: string | null;
  resourceType?: "audit" | "research";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const effectiveSession = sessionId ?? urlSessionId ?? "";
  const shareUrl =
    typeof window !== "undefined"
      ? resourceType === "research"
        ? `${window.location.origin}${routes.researchRun(auditId, effectiveSession || undefined)}`
        : `${window.location.origin}${routes.audit(auditId, effectiveSession || undefined)}`
      : "";

  const mismatch =
    urlSessionId && sessionId && urlSessionId !== sessionId;

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("textarea");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          {copied ? "Copied" : "Copy session link"}
        </button>
      </div>
      {mismatch && (
        <p className="session-warn">URL session does not match this audit record.</p>
      )}
    </div>
  );
}
