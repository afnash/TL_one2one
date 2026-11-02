"use client";

import { useSyncExternalStore } from "react";

// The sidebar is mounted by every page, so its collapsed state lives at module level.
// Client-side navigation keeps this module alive, which means the next page renders the
// sidebar in the right state on its first paint instead of expanding and then collapsing.
const KEY = "onetoone_sidebar_collapsed";
let collapsed: boolean | null = null;
const listeners = new Set<() => void>();

function read(): boolean {
  if (collapsed === null) {
    try {
      collapsed = localStorage.getItem(KEY) === "true";
    } catch {
      collapsed = false;
    }
  }
  return collapsed;
}

export function setSidebarCollapsed(next: boolean) {
  collapsed = next;
  try {
    localStorage.setItem(KEY, String(next));
  } catch {
    // storage unavailable: keep the in-memory value
  }
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => false,
  );
}
