"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const SCHEDULE_OPTIONS = {
  day: { label: "Tomorrow", delayMs: 24 * 60 * 60 * 1000 },
  week: { label: "In one week", delayMs: 7 * 24 * 60 * 60 * 1000 },
  month: { label: "In thirty days", delayMs: 30 * 24 * 60 * 60 * 1000 },
} as const;

export function CronScheduleCard({
  auditId,
  sessionId,
}: {
  auditId: Id<"audits">;
  sessionId?: string;
}) {
  const schedule = useMutation(api.cron.schedule);
  const [interval, setInterval] = useState<keyof typeof SCHEDULE_OPTIONS>("week");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionArgs = sessionId ? { sessionId } : {};

  async function onSchedule() {
    setLoading(true);
    setError(null);
    try {
      await schedule({
        auditId,
        scheduledAt: Date.now() + SCHEDULE_OPTIONS[interval].delayMs,
        ...sessionArgs,
      });
      setDone(true);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Could not schedule the re-audit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Schedule re-audit</h2>
      <p className="card-summary">Run the same evidence checks again after the repository has had time to change.</p>
      <div className="inline-form">
        <div className="field">
          <label htmlFor="reaudit-interval">Run again</label>
          <select
            id="reaudit-interval"
            value={interval}
            onChange={(event) => setInterval(event.target.value as keyof typeof SCHEDULE_OPTIONS)}
            disabled={done || loading}
          >
            {Object.entries(SCHEDULE_OPTIONS).map(([value, option]) => (
              <option key={value} value={value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={onSchedule} disabled={done || loading}>
          {done ? "Re-audit scheduled" : loading ? "Scheduling…" : "Schedule re-audit"}
        </button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <p className="sr-only" aria-live="polite">{done ? `Scheduled ${SCHEDULE_OPTIONS[interval].label.toLowerCase()}.` : ""}</p>
    </div>
  );
}
