"use client";
import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { apiRequest } from "./supabase";

const ERROR_VISIBLE_MS = 8000;
const MAX_BACKOFF_MS = 30000;

// Rows are only fetched while `enabled` (a signed-in session exists). Edits apply
// optimistically and are written in order; when a write is rejected the error is
// surfaced (waitForSave throws, `error` is set) and the collection is reloaded from the
// server so the rejected change is rolled back. Polling continues either way.
// `pollMs` is the refresh interval (paused while the tab is hidden, backs off after
// failed loads, and refreshes immediately when the tab becomes visible again).
export function useRemoteCollection<T extends { id: string }>(table: string, enabled = true, pollMs = 5000) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // `loaded` closes a gap: on the render where `enabled` flips to true, `loading` is still
  // false from the disabled state, which made callers think nothing was left to load.
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const current = useRef<T[]>([]);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const generation = useRef(0);
  const unreported = useRef("");          // newest save failure not yet thrown from waitForSave
  const errorUntil = useRef(0);           // keep a save error on screen until then
  const refreshing = useRef(false);
  const refreshAgain = useRef(false);
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const failures = useRef(0);             // consecutive failed loads, drives back-off

  const refresh = useCallback(async () => {
    if (pending.current) return;
    if (refreshing.current) { refreshAgain.current = true; return; }
    refreshing.current = true;
    const version = generation.current;
    try {
      const all: T[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await apiRequest<T[]>(`/api/data/${table}?offset=${offset}`);
        all.push(...result);
        if (result.length < 500) break;
      }
      failures.current = 0;
      if (version === generation.current && !pending.current) {
        if (JSON.stringify(all) !== JSON.stringify(current.current)) { current.current = all; setRows(all); }
        if (Date.now() > errorUntil.current) setError("");
      }
    } catch (e) {
      failures.current++;
      setError(e instanceof Error ? e.message : "Unable to load data");
    } finally {
      refreshing.current = false;
      setLoading(false);
      setLoaded(true);
      if (refreshAgain.current) { refreshAgain.current = false; void refreshRef.current(); }
    }
  }, [table]);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      current.current = [];
      setRows([]);
      setError("");
      setLoading(false);
      setLoaded(false);
      return;
    }
    setLoading(true);
    void refresh();
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const schedule = () => {
      const delay = Math.min(MAX_BACKOFF_MS, pollMs * 2 ** Math.min(failures.current, 4)) * (0.9 + Math.random() * 0.2);
      timer = setTimeout(async () => {
        if (stopped) return;
        if (!document.hidden) await refresh();
        schedule();
      }, delay);
    };
    schedule();
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh, enabled, pollMs]);

  const update = useCallback((action: SetStateAction<T[]>, previousOverrides?: Record<string, Partial<T>>) => {
    const before = current.current;
    const after = typeof action === "function" ? action(before) : action;
    const changes = after.filter(row => JSON.stringify(row) !== JSON.stringify(before.find(old => old.id === row.id)));
    const removed = before.filter(row => !after.some(next => next.id === row.id));
    if (!changes.length && !removed.length) return;
    generation.current++;
    pending.current++;
    setSaving(true);
    current.current = after;
    setRows(after);
    queue.current = queue.current.then(async () => {
      let firstError: unknown = null;
      // Every row is attempted; the first failure is reported once the batch is done.
      for (const row of changes) {
        try {
          const stored = before.find(old => old.id === row.id);
          const previous = stored ? { ...stored, ...previousOverrides?.[row.id] } : undefined;
          // Atomic JSON field patches prevent unrelated fields being overwritten by another browser.
          const patch = Object.fromEntries(Object.entries(row).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(previous?.[k as keyof T])));
          await apiRequest(`/api/data/${table}`, { method: "POST", body: JSON.stringify({ id: row.id, patch, previous: previous || {} }) });
        } catch (e) { firstError ??= e; }
      }
      for (const row of removed) {
        try { await apiRequest(`/api/data/${table}?id=${encodeURIComponent(row.id)}`, { method: "DELETE" }); } catch (e) { firstError ??= e; }
      }
      if (firstError) throw firstError;
    }).catch(e => {
      unreported.current = `Changes were not saved: ${e instanceof Error ? e.message : "Connection failed"}. The latest saved data has been restored.`;
      errorUntil.current = Date.now() + ERROR_VISIBLE_MS;
      setError(unreported.current);
    }).finally(() => {
      pending.current--;
      setSaving(pending.current > 0);
      // Once the queue is empty, reload server state: this rolls back rejected edits.
      if (pending.current === 0 && unreported.current) {
        generation.current++;
        void refresh();
        setTimeout(() => { unreported.current = ""; }, 0); // waitForSave callers have resumed by then
      }
    });
  }, [table, refresh]);

  const waitForSave = useCallback(async () => {
    await queue.current;
    // `finally` of the last op has run by now, but allow a microtask for ordering.
    await Promise.resolve();
    if (unreported.current) {
      const message = unreported.current;
      unreported.current = "";
      throw new Error(message);
    }
  }, []);
  return [rows, update, { error, loading: loading || (enabled && !loaded), saving, refresh, waitForSave }] as const;
}
