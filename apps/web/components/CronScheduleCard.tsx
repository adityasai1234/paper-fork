"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function CronScheduleCard({
  auditId,
  sessionId,
}: {
  auditId: Id<"audits">;
  githubUrl: string;
  sessionId?: string;
}) {
  const schedule = useMutation(api.cron.schedule);
  const [datetime, setDatetime] = useState("");
  const [done, setDone] = useState(false);
  const sessionArgs = sessionId ? { sessionId } : {};

  async function onSchedule() {
    if (!datetime) return;
    await schedule({
      auditId,
      scheduledAt: new Date(datetime).getTime(),
      ...sessionArgs,
    });
    setDone(true);
  }

  return (
    <div className="card">
      <h2>Schedule re-audit</h2>
      <label htmlFor="cron">Re-run at</label>
      <input
        id="cron"
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />
      <button onClick={onSchedule} disabled={done}>
        {done ? "Scheduled" : "Schedule cron re-audit"}
      </button>
    </div>
  );
}
