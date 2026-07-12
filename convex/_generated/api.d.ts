/* eslint-disable */
/**
 * Generated API stub. Run `npx convex dev` to regenerate from deployment.
 */
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import type * as audits from "../audits.js";
import type * as cron from "../cron.js";
import type * as memories from "../memories.js";
import type * as reports from "../reports.js";
import type * as requests from "../requests.js";
import type * as actions_emitOutputs from "../actions/emitOutputs.js";
import type * as actions_generateVoiceBrief from "../actions/generateVoiceBrief.js";
import type * as actions_helpers from "../actions/helpers.js";
import type * as actions_runJudge from "../actions/runJudge.js";
import type * as actions_runLiterature from "../actions/runLiterature.js";
import type * as actions_runMethods from "../actions/runMethods.js";
import type * as actions_runRepo from "../actions/runRepo.js";
import type * as actions_runRuntimeVerify from "../actions/runRuntimeVerify.js";
import type * as actions_runWeb from "../actions/runWeb.js";
import type * as actions_scaleEval from "../actions/scaleEval.js";

declare const fullApi: ApiFromModules<{
  audits: typeof audits;
  cron: typeof cron;
  memories: typeof memories;
  reports: typeof reports;
  requests: typeof requests;
  "actions/emitOutputs": typeof actions_emitOutputs;
  "actions/generateVoiceBrief": typeof actions_generateVoiceBrief;
  "actions/helpers": typeof actions_helpers;
  "actions/runJudge": typeof actions_runJudge;
  "actions/runLiterature": typeof actions_runLiterature;
  "actions/runMethods": typeof actions_runMethods;
  "actions/runRepo": typeof actions_runRepo;
  "actions/runRuntimeVerify": typeof actions_runRuntimeVerify;
  "actions/runWeb": typeof actions_runWeb;
  "actions/scaleEval": typeof actions_scaleEval;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
