/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_emitOutputs from "../actions/emitOutputs.js";
import type * as actions_generateVoiceBrief from "../actions/generateVoiceBrief.js";
import type * as actions_runJudge from "../actions/runJudge.js";
import type * as actions_runLiterature from "../actions/runLiterature.js";
import type * as actions_runMethods from "../actions/runMethods.js";
import type * as actions_runRepo from "../actions/runRepo.js";
import type * as actions_runRuntimeVerify from "../actions/runRuntimeVerify.js";
import type * as actions_runWeb from "../actions/runWeb.js";
import type * as actions_scaleEval from "../actions/scaleEval.js";
import type * as audits from "../audits.js";
import type * as auth from "../auth.js";
import type * as cron from "../cron.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_agent_hierarchy from "../lib/agent_hierarchy.js";
import type * as lib_ai_gateway from "../lib/ai_gateway.js";
import type * as lib_arxiv_fetch from "../lib/arxiv_fetch.js";
import type * as lib_audit_helpers from "../lib/audit_helpers.js";
import type * as lib_audit_registry from "../lib/audit_registry.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_fork_rules from "../lib/fork_rules.js";
import type * as lib_hermes_parse from "../lib/hermes_parse.js";
import type * as lib_paper_fetch from "../lib/paper_fetch.js";
import type * as lib_s2_fetch from "../lib/s2_fetch.js";
import type * as lib_telegram from "../lib/telegram.js";
import type * as lib_validators from "../lib/validators.js";
import type * as memories from "../memories.js";
import type * as reports from "../reports.js";
import type * as requests from "../requests.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/emitOutputs": typeof actions_emitOutputs;
  "actions/generateVoiceBrief": typeof actions_generateVoiceBrief;
  "actions/runJudge": typeof actions_runJudge;
  "actions/runLiterature": typeof actions_runLiterature;
  "actions/runMethods": typeof actions_runMethods;
  "actions/runRepo": typeof actions_runRepo;
  "actions/runRuntimeVerify": typeof actions_runRuntimeVerify;
  "actions/runWeb": typeof actions_runWeb;
  "actions/scaleEval": typeof actions_scaleEval;
  audits: typeof audits;
  auth: typeof auth;
  cron: typeof cron;
  crons: typeof crons;
  http: typeof http;
  "lib/agent_hierarchy": typeof lib_agent_hierarchy;
  "lib/ai_gateway": typeof lib_ai_gateway;
  "lib/arxiv_fetch": typeof lib_arxiv_fetch;
  "lib/audit_helpers": typeof lib_audit_helpers;
  "lib/audit_registry": typeof lib_audit_registry;
  "lib/auth": typeof lib_auth;
  "lib/fork_rules": typeof lib_fork_rules;
  "lib/hermes_parse": typeof lib_hermes_parse;
  "lib/paper_fetch": typeof lib_paper_fetch;
  "lib/s2_fetch": typeof lib_s2_fetch;
  "lib/telegram": typeof lib_telegram;
  "lib/validators": typeof lib_validators;
  memories: typeof memories;
  reports: typeof reports;
  requests: typeof requests;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
