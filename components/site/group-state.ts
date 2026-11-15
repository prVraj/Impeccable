"use client";

import { useSyncExternalStore } from "react";

/**
 * Remembers which sidebar groups (Components, Buttons, ...) someone opened or
 * closed, so going to another page leaves every dropdown exactly as they left it.
 * Each page draws its own sidebar, so without this every group would reset on
 * every click. Kept for this tab (sessionStorage), and in memory when storage is blocked.
 *
 * `scope` keeps the desktop sidebar and the phone menu apart: they start
 * differently (desktop all open, phone only the current page's group).
 */

type State = Record<string, boolean>;

const KEY = "impeccable:groups";
let cache: Record<string, State> | null = null;
const listeners = new Set<() => void>();

function read(): Record<string, State> {
  if (cache) return cache;
  try {
    cache = JSON.parse(sessionStorage.getItem(KEY) || "{}") || {};
  } catch {
    cache = {};
  }
  return cache!;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Open or close one group, and remember it. */
export function setGroupOpen(scope: string, id: string, open: boolean) {
  const all = read();
  cache = { ...all, [scope]: { ...all[scope], [id]: open } };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage blocked (private mode): it still holds for this visit.
  }
  listeners.forEach((fn) => fn());
}

const EMPTY: State = {};

/**
 * What someone chose for this scope, by group id; groups they never touched
 * are missing. The server (and the first paint) sees nothing chosen yet.
 */
export function useGroupState(scope: string): State {
  return useSyncExternalStore(
    subscribe,
    () => read()[scope] ?? EMPTY,
    () => EMPTY,
  );
}
