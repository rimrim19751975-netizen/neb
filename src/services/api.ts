/**
 * API client for the optional Node.js backend.
 *
 * Behaviour:
 * - The user (prof) configures a server URL in the app settings.
 * - If empty / unreachable → app runs in OFFLINE mode (localStorage only).
 * - If reachable → app SYNCS every mutation to the server AND
 *   subscribes to Server-Sent Events for real-time updates.
 *
 * Students just enter the same URL on their phone and the prof's
 * published content + their submissions flow through the server.
 */

import type {
  Course,
  FeedbackMessage,
  Notification,
  Submission,
  User,
} from "../types";

export interface ServerSnapshot {
  users: User[];
  courses: Course[];
  submissions: Submission[];
  notifications: Notification[];
  meta?: { version: number; updatedAt: number };
}

const SERVER_URL_KEY = "ai-academy-server-url";

export function getServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) ?? "";
}

export function setServerUrl(url: string) {
  const cleaned = url.trim().replace(/\/+$/, "");
  if (cleaned) localStorage.setItem(SERVER_URL_KEY, cleaned);
  else localStorage.removeItem(SERVER_URL_KEY);
}

async function jfetch<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${base}${path}`;
  const r = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} on ${path}`);
  return (await r.json()) as T;
}

export const api = {
  health: (base: string) =>
    jfetch<{ ok: boolean; version: number; updatedAt: number; clients: number }>(
      base,
      "/api/health",
    ),

  getState: (base: string) => jfetch<ServerSnapshot>(base, "/api/state"),

  seedCourses: (base: string, courses: Course[]) =>
    jfetch<{ ok: boolean; seeded: number }>(base, "/api/state/seed", {
      method: "POST",
      body: JSON.stringify({ courses }),
    }),

  reset: (base: string) =>
    jfetch<{ ok: boolean }>(base, "/api/state/reset", { method: "POST" }),

  // users
  createUser: (base: string, user: User) =>
    jfetch<User>(base, "/api/users", { method: "POST", body: JSON.stringify(user) }),
  deleteUser: (base: string, id: string) =>
    jfetch<{ ok: boolean }>(base, `/api/users/${id}`, { method: "DELETE" }),

  // courses
  upsertCourse: (base: string, course: Course) =>
    jfetch<Course>(base, `/api/courses`, {
      method: "POST",
      body: JSON.stringify(course),
    }),
  updateCourse: (base: string, id: string, patch: Partial<Course>) =>
    jfetch<Course>(base, `/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  deleteCourse: (base: string, id: string) =>
    jfetch<{ ok: boolean }>(base, `/api/courses/${id}`, { method: "DELETE" }),

  // submissions
  upsertSubmission: (base: string, sub: Submission) =>
    jfetch<Submission>(base, `/api/submissions`, {
      method: "POST",
      body: JSON.stringify(sub),
    }),
  reviewSubmission: (
    base: string,
    id: string,
    body: { status: string; grade?: number; feedback?: string },
  ) =>
    jfetch<Submission>(base, `/api/submissions/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  addMessage: (base: string, submissionId: string, message: FeedbackMessage) =>
    jfetch<FeedbackMessage>(base, `/api/submissions/${submissionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // notifications
  pushNotifications: (base: string, notifs: Notification[]) =>
    jfetch<Notification[]>(base, "/api/notifications", {
      method: "POST",
      body: JSON.stringify(notifs),
    }),
  markRead: (base: string, id: string) =>
    jfetch<{ ok: boolean }>(base, `/api/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: (base: string, userId: string) =>
    jfetch<{ ok: boolean }>(base, `/api/notifications/read-all/${userId}`, {
      method: "PUT",
    }),
};

/* ─────────────────────────────────────────────────────────────
 * SSE client
 * ───────────────────────────────────────────────────────────── */
export type SyncEvent =
  | { kind: "hello" }
  | { kind: "state"; payload: any }
  | { kind: "users"; payload: any }
  | { kind: "courses"; payload: any }
  | { kind: "submissions"; payload: any }
  | { kind: "notifications"; payload: any };

export class LiveSync {
  private es: EventSource | null = null;
  private base: string;
  private onEvent: (e: SyncEvent) => void;
  private onStatus: (status: "connecting" | "live" | "offline") => void;
  private retryTimer: number | null = null;

  constructor(
    base: string,
    onEvent: (e: SyncEvent) => void,
    onStatus: (status: "connecting" | "live" | "offline") => void,
  ) {
    this.base = base;
    this.onEvent = onEvent;
    this.onStatus = onStatus;
  }

  start() {
    this.stop();
    this.onStatus("connecting");
    try {
      this.es = new EventSource(`${this.base}/api/events`);
      this.es.addEventListener("hello", () => {
        this.onStatus("live");
        this.onEvent({ kind: "hello" });
      });
      this.es.addEventListener("state", (ev) =>
        this.onEvent({ kind: "state", payload: safeParse(ev.data) }),
      );
      this.es.addEventListener("users", (ev) =>
        this.onEvent({ kind: "users", payload: safeParse(ev.data) }),
      );
      this.es.addEventListener("courses", (ev) =>
        this.onEvent({ kind: "courses", payload: safeParse(ev.data) }),
      );
      this.es.addEventListener("submissions", (ev) =>
        this.onEvent({ kind: "submissions", payload: safeParse(ev.data) }),
      );
      this.es.addEventListener("notifications", (ev) =>
        this.onEvent({ kind: "notifications", payload: safeParse(ev.data) }),
      );
      this.es.onerror = () => {
        this.onStatus("offline");
        this.es?.close();
        this.es = null;
        if (this.retryTimer) window.clearTimeout(this.retryTimer);
        this.retryTimer = window.setTimeout(() => this.start(), 4000);
      };
    } catch {
      this.onStatus("offline");
    }
  }

  stop() {
    if (this.retryTimer) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.es?.close();
    this.es = null;
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
