import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  AppState,
  Course,
  Exercise,
  FeedbackMessage,
  Lang,
  Notification,
  Submission,
  SubmissionStatus,
  TheorySection,
  User,
} from "../types";
import { initialCourses } from "../data/initialData";
import { api, getServerUrl, LiveSync, setServerUrl as saveServerUrl } from "../services/api";

const STORAGE_KEY = "ai-academy-v2";

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultState: AppState = {
  users: [
    {
      id: "prof-default",
      name: "Prof. Karim",
      role: "professor",
      specialty: "Intelligence Artificielle",
      level: "PhD",
      createdAt: Date.now(),
    },
  ],
  currentUserId: null,
  courses: initialCourses,
  submissions: [],
  notifications: [],
  lang: "fr",
};

export type ServerStatus = "offline" | "connecting" | "live";

interface Ctx {
  state: AppState;
  currentUser: User | null;
  unreadCount: number;
  // server
  serverUrl: string;
  serverStatus: ServerStatus;
  setServerUrl: (url: string) => void;
  pingServer: () => Promise<boolean>;
  resyncFromServer: () => Promise<void>;
  // ui
  setLang: (l: Lang) => void;
  login: (userId: string) => void;
  logout: () => void;
  createUser: (u: Omit<User, "id" | "createdAt">) => User;
  deleteUser: (id: string) => void;
  // courses
  addCourse: (c: Omit<Course, "id" | "order" | "published">) => Course;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  publishCourse: (id: string) => void;
  unpublishCourse: (id: string) => void;
  // theory
  addTheory: (courseId: string, t: Omit<TheorySection, "id">) => void;
  updateTheory: (courseId: string, id: string, patch: Partial<TheorySection>) => void;
  deleteTheory: (courseId: string, id: string) => void;
  // exercises
  addExercise: (courseId: string, e: Omit<Exercise, "id">) => void;
  updateExercise: (courseId: string, id: string, patch: Partial<Exercise>) => void;
  deleteExercise: (courseId: string, id: string) => void;
  // submissions
  submitWork: (input: {
    courseId: string;
    exerciseId: string;
    content: string;
    score?: number;
    quizAnswers?: number[];
  }) => void;
  reviewSubmission: (
    id: string,
    decision: SubmissionStatus,
    grade?: number,
    feedback?: string,
  ) => void;
  addThreadMessage: (submissionId: string, text: string) => void;
  // notifications
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch {}
    return defaultState;
  });

  const [serverUrl, setServerUrlState] = useState<string>(() => {
    // Auto-pickup ?server=… query param (deep link from ngrok QR code)
    try {
      const qs = new URLSearchParams(window.location.search);
      const fromQuery = qs.get("server");
      if (fromQuery) {
        const cleaned = fromQuery.trim().replace(/\/+$/, "");
        saveServerUrl(cleaned);
        // Clean the URL so the param doesn't reappear after reload
        const url = new URL(window.location.href);
        url.searchParams.delete("server");
        window.history.replaceState({}, "", url.toString());
        return cleaned;
      }
    } catch {}
    return getServerUrl();
  });
  const [serverStatus, setServerStatus] = useState<ServerStatus>("offline");
  const liveRef = useRef<LiveSync | null>(null);
  // when SSE events trigger local state updates, mark them so we don't re-push
  const fromServerRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => n.userId === currentUser?.id && !n.read).length,
    [state.notifications, currentUser?.id],
  );

  /* ─────────────────────────────────────────────────────────
   * SERVER SYNC
   * ───────────────────────────────────────────────────────── */

  const resyncFromServer = useCallback(async () => {
    if (!serverUrl) return;
    try {
      const snap = await api.getState(serverUrl);
      fromServerRef.current = true;
      setState((prev) => ({
        ...prev,
        users: snap.users.length ? snap.users : prev.users,
        courses: snap.courses.length ? snap.courses : prev.courses,
        submissions: snap.submissions ?? [],
        notifications: snap.notifications ?? [],
      }));
      // If the server is empty, seed it with our default courses (one-time)
      if (snap.courses.length === 0 && initialCourses.length > 0) {
        await api.seedCourses(serverUrl, initialCourses);
      }
    } catch {
      // silent
    } finally {
      setTimeout(() => (fromServerRef.current = false), 50);
    }
  }, [serverUrl]);

  const pingServer = useCallback(async () => {
    if (!serverUrl) return false;
    try {
      await api.health(serverUrl);
      return true;
    } catch {
      return false;
    }
  }, [serverUrl]);

  // Set up SSE subscription whenever serverUrl changes
  useEffect(() => {
    liveRef.current?.stop();
    if (!serverUrl) {
      setServerStatus("offline");
      return;
    }

    const isSameOrigin =
      typeof window !== "undefined" && serverUrl === window.location.origin;

    if (isSameOrigin) {
      let stopped = false;
      setServerStatus("connecting");

      const sync = async () => {
        try {
          await api.health(serverUrl);
          if (stopped) return;
          setServerStatus("live");
          await resyncFromServer();
        } catch {
          if (!stopped) setServerStatus("offline");
        }
      };

      sync();
      const interval = window.setInterval(sync, 10000);
      return () => {
        stopped = true;
        window.clearInterval(interval);
      };
    }

    const live = new LiveSync(
      serverUrl,
      (e) => {
        fromServerRef.current = true;
        if (e.kind === "state") {
          resyncFromServer();
        } else if (e.kind === "users") {
          setState((prev) => {
            if (e.payload?.type === "added")
              return prev.users.find((u) => u.id === e.payload.user.id)
                ? prev
                : { ...prev, users: [...prev.users, e.payload.user] };
            if (e.payload?.type === "deleted")
              return {
                ...prev,
                users: prev.users.filter((u) => u.id !== e.payload.id),
              };
            return prev;
          });
        } else if (e.kind === "courses") {
          setState((prev) => {
            if (e.payload?.type === "added") {
              return prev.courses.find((c) => c.id === e.payload.course.id)
                ? prev
                : { ...prev, courses: [...prev.courses, e.payload.course] };
            }
            if (e.payload?.type === "updated") {
              return {
                ...prev,
                courses: prev.courses.map((c) =>
                  c.id === e.payload.course.id ? e.payload.course : c,
                ),
              };
            }
            if (e.payload?.type === "deleted") {
              return {
                ...prev,
                courses: prev.courses.filter((c) => c.id !== e.payload.id),
              };
            }
            return prev;
          });
        } else if (e.kind === "submissions") {
          setState((prev) => {
            if (e.payload?.type === "upserted" || e.payload?.type === "reviewed") {
              const incoming = e.payload.submission as Submission;
              const has = prev.submissions.find((s) => s.id === incoming.id);
              return has
                ? {
                    ...prev,
                    submissions: prev.submissions.map((s) =>
                      s.id === incoming.id ? incoming : s,
                    ),
                  }
                : { ...prev, submissions: [...prev.submissions, incoming] };
            }
            if (e.payload?.type === "message") {
              return {
                ...prev,
                submissions: prev.submissions.map((s) =>
                  s.id === e.payload.submissionId
                    ? {
                        ...s,
                        thread: s.thread.find((m) => m.id === e.payload.message.id)
                          ? s.thread
                          : [...s.thread, e.payload.message],
                      }
                    : s,
                ),
              };
            }
            return prev;
          });
        } else if (e.kind === "notifications") {
          setState((prev) => {
            if (e.payload?.type === "added") {
              const news = (e.payload.notifications as Notification[]).filter(
                (n) => !prev.notifications.find((x) => x.id === n.id),
              );
              return { ...prev, notifications: [...prev.notifications, ...news] };
            }
            if (e.payload?.type === "read") {
              return {
                ...prev,
                notifications: prev.notifications.map((n) =>
                  n.id === e.payload.id ? { ...n, read: true } : n,
                ),
              };
            }
            if (e.payload?.type === "read-all") {
              return {
                ...prev,
                notifications: prev.notifications.map((n) =>
                  n.userId === e.payload.userId ? { ...n, read: true } : n,
                ),
              };
            }
            return prev;
          });
        }
        setTimeout(() => (fromServerRef.current = false), 50);
      },
      (status) => setServerStatus(status),
    );
    liveRef.current = live;
    live.start();
    // initial fetch
    resyncFromServer();
    return () => live.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  const setServerUrl = (url: string) => {
    saveServerUrl(url);
    setServerUrlState(url.trim().replace(/\/+$/, ""));
  };

  // Helper: fire-and-forget API call (no await in setState)
  const remote = (fn: (base: string) => Promise<any>) => {
    if (!serverUrl || fromServerRef.current) return;
    fn(serverUrl).catch(() => {
      /* offline → local-only */
    });
  };

  /* ─────────────────────────────────────────────────────────
   * LOCAL ACTIONS (mirror to server)
   * ───────────────────────────────────────────────────────── */

  const setLang = (lang: Lang) => setState((s) => ({ ...s, lang }));
  const login = (id: string) => setState((s) => ({ ...s, currentUserId: id }));
  const logout = () => setState((s) => ({ ...s, currentUserId: null }));

  const createUser: Ctx["createUser"] = (u) => {
    const user: User = { ...u, id: uid(), createdAt: Date.now() };
    setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
    remote((base) => api.createUser(base, user));
    return user;
  };

  const deleteUser: Ctx["deleteUser"] = (id) => {
    setState((s) => ({
      ...s,
      users: s.users.filter((u) => u.id !== id),
      submissions: s.submissions.filter((sub) => sub.studentId !== id),
      notifications: s.notifications.filter((n) => n.userId !== id),
      currentUserId: s.currentUserId === id ? null : s.currentUserId,
    }));
    remote((base) => api.deleteUser(base, id));
  };

  /* ─────── notification helpers ─────── */
  const pushNotificationsToAllStudents = (
    s: AppState,
    notif: Omit<Notification, "id" | "userId" | "read" | "at">,
  ): Notification[] => {
    const students = s.users.filter((u) => u.role === "student");
    return students.map((stu) => ({
      ...notif,
      id: uid(),
      userId: stu.id,
      read: false,
      at: Date.now(),
    }));
  };

  const pushNotificationToProfs = (
    s: AppState,
    notif: Omit<Notification, "id" | "userId" | "read" | "at">,
  ): Notification[] => {
    const profs = s.users.filter((u) => u.role === "professor");
    return profs.map((p) => ({
      ...notif,
      id: uid(),
      userId: p.id,
      read: false,
      at: Date.now(),
    }));
  };

  const pushNotificationToUser = (
    notif: Omit<Notification, "id" | "userId" | "read" | "at">,
    userId: string,
  ): Notification => ({
    ...notif,
    id: uid(),
    userId,
    read: false,
    at: Date.now(),
  });

  /* ─────── courses ─────── */
  const addCourse: Ctx["addCourse"] = (c) => {
    const newCourse: Course = {
      ...c,
      id: uid(),
      order: state.courses.length + 1,
      theory: c.theory ?? [],
      exercises: c.exercises ?? [],
      published: false,
      authorId: state.currentUserId ?? undefined,
    };
    setState((s) => ({ ...s, courses: [...s.courses, newCourse] }));
    remote((base) => api.upsertCourse(base, newCourse));
    return newCourse;
  };

  const updateCourse: Ctx["updateCourse"] = (id, patch) => {
    setState((s) => ({
      ...s,
      courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    remote((base) => api.updateCourse(base, id, patch));
  };

  const deleteCourse: Ctx["deleteCourse"] = (id) => {
    setState((s) => ({
      ...s,
      courses: s.courses.filter((c) => c.id !== id),
      submissions: s.submissions.filter((sub) => sub.courseId !== id),
    }));
    remote((base) => api.deleteCourse(base, id));
  };

  const publishCourse: Ctx["publishCourse"] = (id) => {
    let createdNotifs: Notification[] = [];
    let updatedCourse: Course | null = null;
    setState((s) => {
      const course = s.courses.find((c) => c.id === id);
      if (!course) return s;
      createdNotifs = pushNotificationsToAllStudents(s, {
        type: "new_course",
        title_fr: "📚 Nouveau cours disponible",
        title_ar: "📚 درس جديد متاح",
        body_fr: `Le cours « ${course.title_fr} » a été publié par votre professeur.`,
        body_ar: `تم نشر الدرس « ${course.title_ar} » من قبل أستاذك.`,
        link: { view: "course", id: course.id },
      });
      updatedCourse = { ...course, published: true, publishedAt: Date.now() };
      return {
        ...s,
        courses: s.courses.map((c) => (c.id === id ? updatedCourse! : c)),
        notifications: [...s.notifications, ...createdNotifs],
      };
    });
    if (updatedCourse) {
      remote((base) =>
        api.updateCourse(base, id, {
          published: true,
          publishedAt: (updatedCourse as Course).publishedAt,
        }),
      );
    }
    if (createdNotifs.length) {
      remote((base) => api.pushNotifications(base, createdNotifs));
    }
  };

  const unpublishCourse: Ctx["unpublishCourse"] = (id) => {
    setState((s) => ({
      ...s,
      courses: s.courses.map((c) => (c.id === id ? { ...c, published: false } : c)),
    }));
    remote((base) => api.updateCourse(base, id, { published: false }));
  };

  /* ─────── theory ─────── */
  const addTheory: Ctx["addTheory"] = (courseId, t) => {
    const newTh = { ...t, id: uid() };
    let nextCourse: Course | undefined;
    setState((s) => {
      const cs = s.courses.map((c) =>
        c.id === courseId ? { ...c, theory: [...c.theory, newTh] } : c,
      );
      nextCourse = cs.find((c) => c.id === courseId);
      return { ...s, courses: cs };
    });
    if (nextCourse) remote((base) => api.updateCourse(base, courseId, { theory: nextCourse!.theory }));
  };

  const updateTheory: Ctx["updateTheory"] = (courseId, id, patch) => {
    let nextCourse: Course | undefined;
    setState((s) => {
      const cs = s.courses.map((c) =>
        c.id === courseId
          ? { ...c, theory: c.theory.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
          : c,
      );
      nextCourse = cs.find((c) => c.id === courseId);
      return { ...s, courses: cs };
    });
    if (nextCourse) remote((base) => api.updateCourse(base, courseId, { theory: nextCourse!.theory }));
  };

  const deleteTheory: Ctx["deleteTheory"] = (courseId, id) => {
    let nextCourse: Course | undefined;
    setState((s) => {
      const cs = s.courses.map((c) =>
        c.id === courseId ? { ...c, theory: c.theory.filter((t) => t.id !== id) } : c,
      );
      nextCourse = cs.find((c) => c.id === courseId);
      return { ...s, courses: cs };
    });
    if (nextCourse) remote((base) => api.updateCourse(base, courseId, { theory: nextCourse!.theory }));
  };

  /* ─────── exercises ─────── */
  const addExercise: Ctx["addExercise"] = (courseId, e) => {
    const newEx = { ...e, id: uid() };
    let createdNotifs: Notification[] = [];
    let nextCourse: Course | undefined;
    setState((s) => {
      const course = s.courses.find((c) => c.id === courseId);
      const newCourses = s.courses.map((c) =>
        c.id === courseId ? { ...c, exercises: [...c.exercises, newEx] } : c,
      );
      nextCourse = newCourses.find((c) => c.id === courseId);
      let notifs = s.notifications;
      if (course?.published) {
        createdNotifs = pushNotificationsToAllStudents(s, {
          type: "new_exercise",
          title_fr: "🎯 Nouvel exercice",
          title_ar: "🎯 تمرين جديد",
          body_fr: `« ${e.title_fr} » a été ajouté au cours « ${course.title_fr} ».`,
          body_ar: `تمت إضافة « ${e.title_ar} » إلى درس « ${course.title_ar} ».`,
          link: { view: "course", id: courseId },
        });
        notifs = [...notifs, ...createdNotifs];
      }
      return { ...s, courses: newCourses, notifications: notifs };
    });
    if (nextCourse)
      remote((base) =>
        api.updateCourse(base, courseId, { exercises: nextCourse!.exercises }),
      );
    if (createdNotifs.length) remote((base) => api.pushNotifications(base, createdNotifs));
  };

  const updateExercise: Ctx["updateExercise"] = (courseId, id, patch) => {
    let nextCourse: Course | undefined;
    setState((s) => {
      const cs = s.courses.map((c) =>
        c.id === courseId
          ? { ...c, exercises: c.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)) }
          : c,
      );
      nextCourse = cs.find((c) => c.id === courseId);
      return { ...s, courses: cs };
    });
    if (nextCourse)
      remote((base) =>
        api.updateCourse(base, courseId, { exercises: nextCourse!.exercises }),
      );
  };

  const deleteExercise: Ctx["deleteExercise"] = (courseId, id) => {
    let nextCourse: Course | undefined;
    setState((s) => {
      const cs = s.courses.map((c) =>
        c.id === courseId ? { ...c, exercises: c.exercises.filter((e) => e.id !== id) } : c,
      );
      nextCourse = cs.find((c) => c.id === courseId);
      return {
        ...s,
        courses: cs,
        submissions: s.submissions.filter((sub) => sub.exerciseId !== id),
      };
    });
    if (nextCourse)
      remote((base) =>
        api.updateCourse(base, courseId, { exercises: nextCourse!.exercises }),
      );
  };

  /* ─────── submissions ─────── */
  const submitWork: Ctx["submitWork"] = (input) => {
    if (!currentUser) return;
    let newSubRef: Submission | null = null;
    let notifs: Notification[] = [];
    setState((s) => {
      const course = s.courses.find((c) => c.id === input.courseId);
      const exercise = course?.exercises.find((e) => e.id === input.exerciseId);
      const existing = s.submissions.find(
        (sub) =>
          sub.studentId === currentUser.id &&
          sub.exerciseId === input.exerciseId &&
          sub.courseId === input.courseId,
      );
      const attempt = existing ? existing.attempt + 1 : 1;
      const newSub: Submission = {
        id: existing?.id ?? uid(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        courseId: input.courseId,
        exerciseId: input.exerciseId,
        content: input.content,
        score: input.score,
        quizAnswers: input.quizAnswers,
        status: "submitted",
        submittedAt: Date.now(),
        attempt,
        thread: existing?.thread ?? [],
      };
      newSubRef = newSub;

      const submissions = existing
        ? s.submissions.map((sub) => (sub.id === existing.id ? newSub : sub))
        : [...s.submissions, newSub];

      notifs = pushNotificationToProfs(s, {
        type: "submission_received",
        title_fr: "📥 Nouvelle soumission",
        title_ar: "📥 تسليم جديد",
        body_fr: `${currentUser.name} a soumis « ${exercise?.title_fr ?? ""} » (tentative ${attempt}).`,
        body_ar: `${currentUser.name} سلّم « ${exercise?.title_ar ?? ""} » (المحاولة ${attempt}).`,
        link: { view: "submissions", id: newSub.id },
      });
      return { ...s, submissions, notifications: [...s.notifications, ...notifs] };
    });
    if (newSubRef) remote((base) => api.upsertSubmission(base, newSubRef!));
    if (notifs.length) remote((base) => api.pushNotifications(base, notifs));
  };

  const reviewSubmission: Ctx["reviewSubmission"] = (id, decision, grade, feedback) => {
    let notif: Notification | null = null;
    setState((s) => {
      const sub = s.submissions.find((x) => x.id === id);
      if (!sub) return s;
      const course = s.courses.find((c) => c.id === sub.courseId);
      const exercise = course?.exercises.find((e) => e.id === sub.exerciseId);
      const updated: Submission = {
        ...sub,
        status: decision,
        grade: grade ?? sub.grade,
        feedback: feedback ?? sub.feedback,
        gradedAt: Date.now(),
      };
      const notifMap: Record<
        SubmissionStatus,
        Omit<Notification, "id" | "userId" | "read" | "at">
      > = {
        submitted: {
          type: "feedback",
          title_fr: "Soumission reçue",
          title_ar: "تم استلام التسليم",
          body_fr: "",
          body_ar: "",
        },
        validated: {
          type: "validated",
          title_fr: "✅ Travail validé",
          title_ar: "✅ تم اعتماد العمل",
          body_fr: `Votre travail « ${exercise?.title_fr} » a été validé${grade !== undefined ? ` avec la note ${grade}/20` : ""}.`,
          body_ar: `تم اعتماد عملك « ${exercise?.title_ar} »${grade !== undefined ? ` بعلامة ${grade}/20` : ""}.`,
          link: { view: "submissions", id },
        },
        needs_revision: {
          type: "needs_revision",
          title_fr: "✏️ Correction demandée",
          title_ar: "✏️ مطلوب تصحيح",
          body_fr: `Votre travail « ${exercise?.title_fr} » nécessite une correction.`,
          body_ar: `يحتاج عملك « ${exercise?.title_ar} » إلى تصحيح.`,
          link: { view: "submissions", id },
        },
        rejected: {
          type: "rejected",
          title_fr: "❌ Travail rejeté",
          title_ar: "❌ تم رفض العمل",
          body_fr: `Votre travail « ${exercise?.title_fr} » a été rejeté.`,
          body_ar: `تم رفض عملك « ${exercise?.title_ar} ».`,
          link: { view: "submissions", id },
        },
      };
      notif = pushNotificationToUser(notifMap[decision], sub.studentId);
      return {
        ...s,
        submissions: s.submissions.map((x) => (x.id === id ? updated : x)),
        notifications: [...s.notifications, notif],
      };
    });
    remote((base) =>
      api.reviewSubmission(base, id, { status: decision, grade, feedback }),
    );
    if (notif) remote((base) => api.pushNotifications(base, [notif!]));
  };

  const addThreadMessage: Ctx["addThreadMessage"] = (submissionId, text) => {
    if (!currentUser || !text.trim()) return;
    let msg: FeedbackMessage | null = null;
    let notifs: Notification[] = [];
    setState((s) => {
      const sub = s.submissions.find((x) => x.id === submissionId);
      if (!sub) return s;
      msg = {
        id: uid(),
        fromId: currentUser.id,
        fromName: currentUser.name,
        fromRole: currentUser.role,
        text: text.trim(),
        at: Date.now(),
      };
      const recipientId = currentUser.role === "professor" ? sub.studentId : null;
      const course = s.courses.find((c) => c.id === sub.courseId);
      const exercise = course?.exercises.find((e) => e.id === sub.exerciseId);
      const notifBase = {
        type: "feedback" as const,
        title_fr: `💬 Message de ${currentUser.name}`,
        title_ar: `💬 رسالة من ${currentUser.name}`,
        body_fr: `À propos de « ${exercise?.title_fr ?? ""} » : ${text.slice(0, 80)}`,
        body_ar: `حول « ${exercise?.title_ar ?? ""} »: ${text.slice(0, 80)}`,
        link: { view: "submissions" as const, id: submissionId },
      };
      notifs = recipientId
        ? [pushNotificationToUser(notifBase, recipientId)]
        : pushNotificationToProfs(s, notifBase);

      return {
        ...s,
        submissions: s.submissions.map((x) =>
          x.id === submissionId ? { ...x, thread: [...x.thread, msg!] } : x,
        ),
        notifications: [...s.notifications, ...notifs],
      };
    });
    if (msg) remote((base) => api.addMessage(base, submissionId, msg!));
    if (notifs.length) remote((base) => api.pushNotifications(base, notifs));
  };

  /* ─────── notifications ─────── */
  const markAllRead = () => {
    if (!currentUser) return;
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n,
      ),
    }));
    remote((base) => api.markAllRead(base, currentUser.id));
  };

  const markRead = (id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    remote((base) => api.markRead(base, id));
  };

  return (
    <AppCtx.Provider
      value={{
        state,
        currentUser,
        unreadCount,
        serverUrl,
        serverStatus,
        setServerUrl,
        pingServer,
        resyncFromServer,
        setLang,
        login,
        logout,
        createUser,
        deleteUser,
        addCourse,
        updateCourse,
        deleteCourse,
        publishCourse,
        unpublishCourse,
        addTheory,
        updateTheory,
        deleteTheory,
        addExercise,
        updateExercise,
        deleteExercise,
        submitWork,
        reviewSubmission,
        addThreadMessage,
        markAllRead,
        markRead,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
