import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";

const defaultData = {
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
  courses: [],
  submissions: [],
  notifications: [],
  meta: { version: 1, updatedAt: Date.now() },
};

function json(value, fallback = null) {
  if (value === undefined) return fallback;
  return JSON.stringify(value);
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function bool(value) {
  return value ? 1 : 0;
}

function normalizeDbPath(dbPath) {
  if (dbPath) return dbPath;
  if (process.env.DB_PATH) return process.env.DB_PATH;
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "ai-academy.sqlite");
  }
  if (process.env.RENDER) return "/var/data/ai-academy.sqlite";
  if (process.env.VERCEL) return path.join(os.tmpdir(), "ai-academy.sqlite");
  return path.join(process.cwd(), "server", "ai-academy.sqlite");
}

export function openDatabase(dbPath) {
  const file = normalizeDbPath(dbPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      specialty TEXT,
      level TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      "order" INTEGER NOT NULL DEFAULT 999,
      title_fr TEXT,
      title_ar TEXT,
      summary_fr TEXT,
      summary_ar TEXT,
      theory TEXT NOT NULL DEFAULT '[]',
      exercises TEXT NOT NULL DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 0,
      publishedAt INTEGER,
      authorId TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentName TEXT,
      courseId TEXT NOT NULL,
      exerciseId TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      score REAL,
      quizAnswers TEXT,
      grade REAL,
      feedback TEXT,
      status TEXT NOT NULL,
      submittedAt INTEGER NOT NULL,
      gradedAt INTEGER,
      attempt INTEGER NOT NULL DEFAULT 1,
      thread TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title_fr TEXT,
      title_ar TEXT,
      body_fr TEXT,
      body_ar TEXT,
      link TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      "at" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const now = Date.now();
  db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('version', '1')").run();
  db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('updatedAt', ?)").run(String(now));
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, role, specialty, level, createdAt)
    VALUES (@id, @name, @role, @specialty, @level, @createdAt)
  `).run(defaultData.users[0]);

  return { db, file };
}

function courseFromRow(row) {
  return {
    id: row.id,
    order: row.order,
    title_fr: row.title_fr ?? "",
    title_ar: row.title_ar ?? "",
    summary_fr: row.summary_fr ?? "",
    summary_ar: row.summary_ar ?? "",
    theory: parseJson(row.theory, []),
    exercises: parseJson(row.exercises, []),
    published: Boolean(row.published),
    publishedAt: row.publishedAt ?? undefined,
    authorId: row.authorId ?? undefined,
  };
}

function submissionFromRow(row) {
  return {
    id: row.id,
    studentId: row.studentId,
    studentName: row.studentName ?? "",
    courseId: row.courseId,
    exerciseId: row.exerciseId,
    content: row.content ?? "",
    score: row.score ?? undefined,
    quizAnswers: parseJson(row.quizAnswers, undefined),
    grade: row.grade ?? undefined,
    feedback: row.feedback ?? undefined,
    status: row.status,
    submittedAt: row.submittedAt,
    gradedAt: row.gradedAt ?? undefined,
    attempt: row.attempt,
    thread: parseJson(row.thread, []),
  };
}

function notificationFromRow(row) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title_fr: row.title_fr ?? "",
    title_ar: row.title_ar ?? "",
    body_fr: row.body_fr ?? "",
    body_ar: row.body_ar ?? "",
    link: parseJson(row.link, undefined),
    read: Boolean(row.read),
    at: row.at,
  };
}

function getMeta(db) {
  return Object.fromEntries(
    db.prepare("SELECT key, value FROM meta").all().map((m) => [
      m.key,
      m.key === "version" || m.key === "updatedAt" ? Number(m.value) : m.value,
    ]),
  );
}

function setUpdatedAt(db) {
  const updatedAt = Date.now();
  db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('updatedAt', ?)").run(String(updatedAt));
  return updatedAt;
}

function snapshot(db) {
  return {
    users: db.prepare("SELECT * FROM users ORDER BY createdAt ASC").all(),
    courses: db.prepare('SELECT * FROM courses ORDER BY "order" ASC, rowid ASC').all().map(courseFromRow),
    submissions: db.prepare("SELECT * FROM submissions ORDER BY submittedAt DESC").all().map(submissionFromRow),
    notifications: db.prepare('SELECT * FROM notifications ORDER BY "at" DESC').all().map(notificationFromRow),
    meta: getMeta(db),
  };
}

export function createApp(options = {}) {
  const { db, file } = openDatabase(options.dbPath);
  const app = express();
  const sseClients = new Set();

  function broadcast(event, payload) {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of sseClients) {
      try {
        res.write(data);
      } catch {
        sseClients.delete(res);
      }
    }
  }

  app.locals.dbFile = file;
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/events", (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();
    res.write("retry: 5000\n\n");
    res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);
    sseClients.add(res);

    const keepAlive = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(keepAlive);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get("/api/health", (_req, res) => {
    const data = snapshot(db);
    res.json({
      ok: true,
      version: data.meta.version ?? 1,
      updatedAt: data.meta.updatedAt ?? 0,
      clients: sseClients.size,
      db: "sqlite",
      counts: {
        users: data.users.length,
        courses: data.courses.length,
        submissions: data.submissions.length,
        notifications: data.notifications.length,
      },
    });
  });

  app.get("/api/state", (_req, res) => res.json(snapshot(db)));

  app.post("/api/state/seed", (req, res) => {
    const { courses } = req.body || {};
    if (!Array.isArray(courses)) return res.status(400).json({ error: "courses array required" });

    const count = db.prepare("SELECT COUNT(*) AS count FROM courses").get().count;
    if (count === 0) {
      const insert = db.prepare(`
        INSERT INTO courses (
          id, "order", title_fr, title_ar, summary_fr, summary_ar,
          theory, exercises, published, publishedAt, authorId
        ) VALUES (
          @id, @order, @title_fr, @title_ar, @summary_fr, @summary_ar,
          @theory, @exercises, @published, @publishedAt, @authorId
        )
      `);
      const seed = db.transaction((items) => {
        for (const c of items) {
          insert.run({
            id: c.id ?? crypto.randomUUID(),
            order: c.order ?? 999,
            title_fr: c.title_fr ?? "",
            title_ar: c.title_ar ?? "",
            summary_fr: c.summary_fr ?? "",
            summary_ar: c.summary_ar ?? "",
            theory: json(c.theory, []),
            exercises: json(c.exercises, []),
            published: bool(c.published),
            publishedAt: c.publishedAt ?? null,
            authorId: c.authorId ?? null,
          });
        }
        setUpdatedAt(db);
      });
      seed(courses);
      broadcast("state", { reason: "seed" });
    }

    res.json({ ok: true, seeded: db.prepare("SELECT COUNT(*) AS count FROM courses").get().count });
  });

  app.post("/api/state/reset", (_req, res) => {
    db.transaction(() => {
      db.prepare("DELETE FROM notifications").run();
      db.prepare("DELETE FROM submissions").run();
      db.prepare("DELETE FROM courses").run();
      db.prepare("DELETE FROM users WHERE id <> 'prof-default'").run();
      setUpdatedAt(db);
    })();
    broadcast("state", { reason: "reset" });
    res.json({ ok: true });
  });

  app.get("/api/users", (_req, res) => {
    res.json(db.prepare("SELECT * FROM users ORDER BY createdAt ASC").all());
  });

  app.post("/api/users", (req, res) => {
    const u = req.body || {};
    if (!u.name || !u.role) return res.status(400).json({ error: "name + role required" });
    const user = {
      id: u.id ?? crypto.randomUUID(),
      name: u.name,
      role: u.role,
      specialty: u.specialty ?? null,
      level: u.level ?? null,
      createdAt: u.createdAt ?? Date.now(),
    };
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, role, specialty, level, createdAt)
      VALUES (@id, @name, @role, @specialty, @level, @createdAt)
    `).run(user);
    setUpdatedAt(db);
    broadcast("users", { type: "added", user });
    res.json({ ...user, specialty: user.specialty ?? undefined, level: user.level ?? undefined });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    db.transaction(() => {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      db.prepare("DELETE FROM submissions WHERE studentId = ?").run(id);
      db.prepare("DELETE FROM notifications WHERE userId = ?").run(id);
      setUpdatedAt(db);
    })();
    broadcast("users", { type: "deleted", id });
    res.json({ ok: true });
  });

  app.post("/api/courses", (req, res) => {
    const c = req.body || {};
    const course = {
      id: c.id ?? crypto.randomUUID(),
      order: c.order ?? db.prepare("SELECT COUNT(*) + 1 AS nextOrder FROM courses").get().nextOrder,
      title_fr: c.title_fr ?? "",
      title_ar: c.title_ar ?? "",
      summary_fr: c.summary_fr ?? "",
      summary_ar: c.summary_ar ?? "",
      theory: json(c.theory, []),
      exercises: json(c.exercises, []),
      published: bool(c.published),
      publishedAt: c.publishedAt ?? null,
      authorId: c.authorId ?? null,
    };
    db.prepare(`
      INSERT OR REPLACE INTO courses (
        id, "order", title_fr, title_ar, summary_fr, summary_ar,
        theory, exercises, published, publishedAt, authorId
      ) VALUES (
        @id, @order, @title_fr, @title_ar, @summary_fr, @summary_ar,
        @theory, @exercises, @published, @publishedAt, @authorId
      )
    `).run(course);
    setUpdatedAt(db);
    const saved = courseFromRow(db.prepare("SELECT * FROM courses WHERE id = ?").get(course.id));
    broadcast("courses", { type: "added", course: saved });
    res.json(saved);
  });

  app.put("/api/courses/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    const current = courseFromRow(row);
    const next = { ...current, ...(req.body || {}) };
    db.prepare(`
      UPDATE courses SET
        "order" = @order,
        title_fr = @title_fr,
        title_ar = @title_ar,
        summary_fr = @summary_fr,
        summary_ar = @summary_ar,
        theory = @theory,
        exercises = @exercises,
        published = @published,
        publishedAt = @publishedAt,
        authorId = @authorId
      WHERE id = @id
    `).run({
      id: req.params.id,
      order: next.order ?? 999,
      title_fr: next.title_fr ?? "",
      title_ar: next.title_ar ?? "",
      summary_fr: next.summary_fr ?? "",
      summary_ar: next.summary_ar ?? "",
      theory: json(next.theory, []),
      exercises: json(next.exercises, []),
      published: bool(next.published),
      publishedAt: next.publishedAt ?? null,
      authorId: next.authorId ?? null,
    });
    setUpdatedAt(db);
    const course = courseFromRow(db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id));
    broadcast("courses", { type: "updated", course });
    res.json(course);
  });

  app.delete("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    db.transaction(() => {
      db.prepare("DELETE FROM courses WHERE id = ?").run(id);
      db.prepare("DELETE FROM submissions WHERE courseId = ?").run(id);
      setUpdatedAt(db);
    })();
    broadcast("courses", { type: "deleted", id });
    res.json({ ok: true });
  });

  app.post("/api/submissions", (req, res) => {
    const s = req.body || {};
    if (!s.studentId || !s.courseId || !s.exerciseId) {
      return res.status(400).json({ error: "missing fields" });
    }

    const existing = db.prepare(
      "SELECT * FROM submissions WHERE studentId = ? AND exerciseId = ?",
    ).get(s.studentId, s.exerciseId);
    const sub = {
      id: existing?.id ?? s.id ?? crypto.randomUUID(),
      studentId: s.studentId,
      studentName: s.studentName ?? "",
      courseId: s.courseId,
      exerciseId: s.exerciseId,
      content: s.content ?? "",
      score: s.score ?? null,
      quizAnswers: json(s.quizAnswers, null),
      grade: null,
      feedback: null,
      status: "submitted",
      submittedAt: Date.now(),
      gradedAt: null,
      attempt: existing ? (existing.attempt ?? 1) + 1 : 1,
      thread: existing?.thread ?? json(s.thread, []),
    };

    db.prepare(`
      INSERT OR REPLACE INTO submissions (
        id, studentId, studentName, courseId, exerciseId, content, score,
        quizAnswers, grade, feedback, status, submittedAt, gradedAt, attempt, thread
      ) VALUES (
        @id, @studentId, @studentName, @courseId, @exerciseId, @content, @score,
        @quizAnswers, @grade, @feedback, @status, @submittedAt, @gradedAt, @attempt, @thread
      )
    `).run(sub);
    setUpdatedAt(db);
    const saved = submissionFromRow(db.prepare("SELECT * FROM submissions WHERE id = ?").get(sub.id));
    broadcast("submissions", { type: "upserted", submission: saved });
    res.json(saved);
  });

  app.put("/api/submissions/:id/review", (req, res) => {
    const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    const { status, grade, feedback } = req.body || {};
    db.prepare(`
      UPDATE submissions
      SET status = ?, grade = ?, feedback = ?, gradedAt = ?
      WHERE id = ?
    `).run(status, grade ?? null, feedback ?? null, Date.now(), req.params.id);
    setUpdatedAt(db);
    const submission = submissionFromRow(db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id));
    broadcast("submissions", { type: "reviewed", submission });
    res.json(submission);
  });

  app.post("/api/submissions/:id/messages", (req, res) => {
    const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    const { message } = req.body || {};
    if (!message?.text) return res.status(400).json({ error: "message.text required" });
    const msg = {
      id: message.id ?? crypto.randomUUID(),
      fromId: message.fromId,
      fromName: message.fromName,
      fromRole: message.fromRole,
      text: message.text,
      at: Date.now(),
    };
    const thread = [...parseJson(row.thread, []), msg];
    db.prepare("UPDATE submissions SET thread = ? WHERE id = ?").run(json(thread, []), req.params.id);
    setUpdatedAt(db);
    broadcast("submissions", { type: "message", submissionId: req.params.id, message: msg });
    res.json(msg);
  });

  app.post("/api/notifications", (req, res) => {
    const list = Array.isArray(req.body) ? req.body : [req.body];
    const created = list.map((n) => ({
      id: n.id ?? crypto.randomUUID(),
      userId: n.userId,
      type: n.type,
      title_fr: n.title_fr ?? "",
      title_ar: n.title_ar ?? "",
      body_fr: n.body_fr ?? "",
      body_ar: n.body_ar ?? "",
      link: json(n.link, null),
      read: bool(n.read),
      at: n.at ?? Date.now(),
    }));
    const insert = db.prepare(`
      INSERT OR REPLACE INTO notifications (
        id, userId, type, title_fr, title_ar, body_fr, body_ar, link, read, "at"
      ) VALUES (
        @id, @userId, @type, @title_fr, @title_ar, @body_fr, @body_ar, @link, @read, @at
      )
    `);
    db.transaction((items) => {
      for (const item of items) insert.run(item);
      setUpdatedAt(db);
    })(created);
    const response = created.map((n) => notificationFromRow({ ...n, at: n.at }));
    broadcast("notifications", { type: "added", notifications: response });
    res.json(response);
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
    setUpdatedAt(db);
    broadcast("notifications", { type: "read", id: req.params.id });
    res.json({ ok: true });
  });

  app.put("/api/notifications/read-all/:userId", (req, res) => {
    db.prepare("UPDATE notifications SET read = 1 WHERE userId = ?").run(req.params.userId);
    setUpdatedAt(db);
    broadcast("notifications", { type: "read-all", userId: req.params.userId });
    res.json({ ok: true });
  });

  return app;
}
