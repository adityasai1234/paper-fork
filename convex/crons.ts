import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll scheduled re-audits",
  { minutes: 5 },
  internal.cron.listPending
);

export default crons;
