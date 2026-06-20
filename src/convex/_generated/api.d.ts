/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as users from "../users.js";
import type * as userProfiles from "../userProfiles.js";
import type * as tasks from "../tasks.js";
import type * as habits from "../habits.js";
import type * as wallets from "../wallets.js";
import type * as transactions from "../transactions.js";
import type * as goals from "../goals.js";
import type * as focusSessions from "../focusSessions.js";
import type * as moods from "../moods.js";
import type * as sleepLogs from "../sleepLogs.js";
import type * as gratitudeEntries from "../gratitudeEntries.js";
import type * as admin from "../admin.js";
import type * as journal from "../journal.js";
import type * as readingList from "../readingList.js";
import type * as mealLogs from "../mealLogs.js";
import type * as contacts from "../contacts.js";
import type * as savingsGoals from "../savingsGoals.js";
import type * as studySessions from "../studySessions.js";
import type * as dailyCheckins from "../dailyCheckins.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  users: typeof users;
  userProfiles: typeof userProfiles;
  tasks: typeof tasks;
  habits: typeof habits;
  wallets: typeof wallets;
  transactions: typeof transactions;
  goals: typeof goals;
  focusSessions: typeof focusSessions;
  moods: typeof moods;
  sleepLogs: typeof sleepLogs;
  gratitudeEntries: typeof gratitudeEntries;
  admin: typeof admin;
  journal: typeof journal;
  readingList: typeof readingList;
  mealLogs: typeof mealLogs;
  contacts: typeof contacts;
  savingsGoals: typeof savingsGoals;
  studySessions: typeof studySessions;
  dailyCheckins: typeof dailyCheckins;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;
