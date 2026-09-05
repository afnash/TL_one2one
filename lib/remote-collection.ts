"use client";
import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { supabaseRequest } from "./supabase";

export function useRemoteCollection<T extends { id: string }>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const current = useRef<T[]>([]);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const generation = useRef(0);
  const failed = useRef(false);
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (pending.current || failed.current || refreshing.current) return;
    refreshing.current = true;
    const version = generation.current;
    try {
      const all: T[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await supabaseRequest<{ data: T }[]>(`/rest/v1/${table}?select=data&order=id&offset=${offset}&limit=500`);
        all.push(...result.map(row => row.data));
        if (result.length < 500) break;
      }
      if (version === generation.current && !pending.current) {
        if (JSON.stringify(all) !== JSON.stringify(current.current)) { current.current = all; setRows(all); }
        setError("");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load data"); }
    finally { refreshing.current = false; setLoading(false); }
  }, [table]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { if (!document.hidden) void refresh(); }, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const update = useCallback((action: SetStateAction<T[]>, previousOverrides?: Record<string, Partial<T>>) => {
    if (failed.current) return;
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
      if (failed.current) return;
      for (const row of changes) {
        const stored = before.find(old => old.id === row.id);
        const previous = stored ? { ...stored, ...previousOverrides?.[row.id] } : undefined;
        // Atomic JSON field patches prevent unrelated fields being overwritten by another browser.
        const patch = Object.fromEntries(Object.entries(row).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(previous?.[k as keyof T])));
        await supabaseRequest("/rest/v1/rpc/lms_patch", { method: "POST", body: JSON.stringify({ p_table: table, p_id: row.id, p_patch: patch, p_previous: previous || {} }) });
      }
      for (const row of removed) await supabaseRequest(`/rest/v1/${table}?id=eq.${encodeURIComponent(row.id)}`, { method: "DELETE" });
      setError("");
    }).catch(e => {
      failed.current = true;
      setError(`Changes were not saved: ${e instanceof Error ? e.message : "Connection failed"}. Reload to restore server data, then retry.`);
    }).finally(() => { pending.current--; setSaving(pending.current > 0); });
  }, [table]);
  return [rows, update, { error, loading, saving, refresh }] as const;
}
