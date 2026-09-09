import type { Whiteboard } from "@/types";
import { supabaseRequest } from "./supabase";

export interface Conference {
  code: string;
  title: string;
  hostId: string;
  hostName: string;
  status: "LIVE" | "ENDED";
  createdAt: string;
  videoRoom: string;
  board: Whiteboard;
  revision: number;
}
export function normalizeConferenceCode(value: string) {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}
export function formatConferenceCode(value: string) {
  return value.match(/.{1,4}/g)?.join("-") || value;
}
export async function conferenceRPC<T>(name: "create" | "read" | "update", parameters: Record<string, unknown>) {
  try {
    return await supabaseRequest<T>(`/rest/v1/rpc/conference_${name}`, {
      method: "POST", body: JSON.stringify(parameters),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to connect to the conference.";
    if (/schema cache|does not exist|could not find the function/i.test(message)) {
      throw new Error("Conference setup is pending. Run supabase/migrations/20260910_conferences.sql in the Supabase SQL Editor, then retry.");
    }
    throw new Error(message);
  }
}
export const hostStorageKey = (userId: string, code: string) => `onetoone_conference_host_${userId}_${code}`;

