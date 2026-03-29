import { writable } from "svelte/store";
import type { LyricLine } from "./protocol";

export const connectionStatus = writable<
  "connected" | "disconnected" | "connecting"
>("connecting");

export const demoMode = writable(false);
export const audioAvailable = writable(true);

export const currentPosition = writable(4);
export const lyrics = writable<LyricLine[]>([]);
export const isPlaying = writable(false);
export const playbackTime = writable(0);
export const songDuration = writable(0);

export interface LogEntry {
  direction: "rx" | "tx";
  type: string;
  detail?: string;
  timestamp: string;
}

export const logMessages = writable<LogEntry[]>([]);

export function addLogMessage(entry: Omit<LogEntry, "timestamp">): void {
  const now = new Date();
  const ts =
    now.getMinutes().toString().padStart(2, "0") +
    ":" +
    now.getSeconds().toString().padStart(2, "0") +
    "." +
    now.getMilliseconds().toString().padStart(3, "0");
  logMessages.update((msgs) => {
    const updated = [...msgs, { ...entry, timestamp: ts }];
    if (updated.length > 80) return updated.slice(-80);
    return updated;
  });
}
