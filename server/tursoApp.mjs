import express from "express";
import cors from "cors";
import { createClient } from "@libsql/client";

const defaultProfessor = {
  id: "prof-default",
  name: "Prof. Karim",
  role: "professor",
  specialty: "Intelligence Artificielle",
  level: "PhD",
  createdAt: Date.now(),
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

function rows(result) {
  return result.rows.map((row) => Object.fromEntries(Object.entries(row)));
}

function courseFromRow(row) {
  return {
    id: row.id,
    order: Number(row.order ?? 999),
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
    attempt: Number(row.attempt ?? 1),
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

export function createTursoApp() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));

  const ready = init(client);
  const touch = () =>
    client.execute({
      sql: "INSERT OR REPLACE INTO meta (key, value) VALUES ('updatedAt', ?)",
      args: [String(Date.now())],
    });

  async function snapshot() {
    await ready;
    const [users, courses, submissions, notifications, meta] = await Promise.all([
      client.execute("SELECT * FROM users ORDER BY createdAt ASC"),
      client.execute('SELECT * FROM courses ORDER BY "order" ASC, rowid ASC'),
      client.execute("SELECT * FROM submissions ORDER BY submittedAt DESC"),
      client.execute('SELECT * FROM notifications ORDER BY "at" DESC'),
      client.execute("SELECT key, value FROM meta"),
    ]);
    return {
      users: rows(users),
      courses: rows(courses).map(courseFromRow),
      submissions: rows(submissions).map(submissionFromRow),
      notifications: rows(notifications).map(notificationFromRow),
      meta: Object.fromEntries(
        rows(meta).map((item) => [
          item.key,
          item.key === "version" || item.key === "updatedAt" ? Number(item.value) : item.value,
        ]),
      ),
    };
  }

  app.get("/api/health", async (_req, res, next) => {
    try {
      const data = await snapshot();
      res.json({
        ok: true,
        version: data.meta.version ?? 1,
        updatedAt: data.meta.updatedAt ?? 0,
        clients: 0,
        db: "turso-libsql",
        counts: {
          users: data.users.length,
          courses: data.courses.length,
          submissions: data.submissions.length,
          notifications: data.notifications.length,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/state", async (_req, res, next) => {
    try {
      res.json(await snapshot());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/state/seed", async (req, res, next) => {
    try {
      await ready;
      const { courses } = req.body || {};
      if (!Array.isArray(courses)) return res.status(400).json({ error: "courses array required" });
      const count = Number((await client.execute("SELECT COUNT(*) AS count FROM courses")).rows[0].count);
      if (count === 0) {
        for (const c of courses) {
          await client.execute({
            sql: `
              INSERT INTO courses (
                id, "order", title_fr, title_ar, summary_fr, summary_ar,
                theory, exercises, published, publishedAt, authorId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              c.id ?? crypto.randomUUID(),
              c.order ?? 999,
              c.title_fr ?? "",
              c.title_ar ?? "",
              c.summary_fr ?? "",
              c.summary_ar ?? "",
              json(c.theory, []),
              json(c.exercises, []),
              bool(c.published),
              c.publishedAt ?? null,
              c.authorId ?? null,
            ],
          });
        }
        await touch();
      }
      const seeded = Number((await client.execute("SELECT COUNT(*) AS count FROM courses")).rows[0].count);
      res.json({ ok: true, seeded });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/state/reset", async (_req, res, next) => {
    try {
      await ready;
      await client.batch([
        "DELETE FROM notifications",
        "DELETE FROM submissions",
        "DELETE FROM courses",
        "DELETE FROM users WHERE id <> 'prof-default'",
      ]);
      await touch();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", async (req, res, next) => {
    try {
      await ready;
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
      await client.execute({
        sql: "INSERT OR REPLACE INTO users (id, name, role, specialty, level, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        args: [user.id, user.name, user.role, user.specialty, user.level, user.createdAt],
      });
      await touch();
      res.json({ ...user, specialty: user.specialty ?? undefined, level: user.level ?? undefined });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", async (req, res, next) => {
    try {
      await ready;
      await client.batch([
        { sql: "DELETE FROM users WHERE id = ?", args: [req.params.id] },
        { sql: "DELETE FROM submissions WHERE studentId = ?", args: [req.params.id] },
        { sql: "DELETE FROM notifications WHERE userId = ?", args: [req.params.id] },
      ]);
      await touch();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses", async (req, res, next) => {
    try {
      await ready;
      const c = req.body || {};
      const count = Number((await client.execute("SELECT COUNT(*) AS count FROM courses")).rows[0].count);
      const values = {
        id: c.id ?? crypto.randomUUID(),
        order: c.order ?? count + 1,
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
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO courses (
            id, "order", title_fr, title_ar, summary_fr, summary_ar,
            theory, exercises, published, publishedAt, authorId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: Object.values(values),
      });
      await touch();
      const saved = rows(await client.execute({ sql: "SELECT * FROM courses WHERE id = ?", args: [values.id] }))[0];
      res.json(courseFromRow(saved));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/courses/:id", async (req, res, next) => {
    try {
      await ready;
      const row = rows(await client.execute({ sql: "SELECT * FROM courses WHERE id = ?", args: [req.params.id] }))[0];
      if (!row) return res.status(404).json({ error: "not found" });
      const nextCourse = { ...courseFromRow(row), ...(req.body || {}) };
      await client.execute({
        sql: `
          UPDATE courses SET
            "order" = ?, title_fr = ?, title_ar = ?, summary_fr = ?, summary_ar = ?,
            theory = ?, exercises = ?, published = ?, publishedAt = ?, authorId = ?
          WHERE id = ?
        `,
        args: [
          nextCourse.order ?? 999,
          nextCourse.title_fr ?? "",
          nextCourse.title_ar ?? "",
          nextCourse.summary_fr ?? "",
          nextCourse.summary_ar ?? "",
          json(nextCourse.theory, []),
          json(nextCourse.exercises, []),
          bool(nextCourse.published),
          nextCourse.publishedAt ?? null,
          nextCourse.authorId ?? null,
          req.params.id,
        ],
      });
      await touch();
      const saved = rows(await client.execute({ sql: "SELECT * FROM courses WHERE id = ?", args: [req.params.id] }))[0];
      res.json(courseFromRow(saved));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/courses/:id", async (req, res, next) => {
    try {
      await ready;
      await client.batch([
        { sql: "DELETE FROM courses WHERE id = ?", args: [req.params.id] },
        { sql: "DELETE FROM submissions WHERE courseId = ?", args: [req.params.id] },
      ]);
      await touch();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/submissions", async (req, res, next) => {
    try {
      await ready;
      const s = req.body || {};
      if (!s.studentId || !s.courseId || !s.exerciseId) return res.status(400).json({ error: "missing fields" });
      const existing = rows(
        await client.execute({
          sql: "SELECT * FROM submissions WHERE studentId = ? AND exerciseId = ?",
          args: [s.studentId, s.exerciseId],
        }),
      )[0];
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
        attempt: existing ? Number(existing.attempt ?? 1) + 1 : 1,
        thread: existing?.thread ?? json(s.thread, []),
      };
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO submissions (
            id, studentId, studentName, courseId, exerciseId, content, score,
            quizAnswers, grade, feedback, status, submittedAt, gradedAt, attempt, thread
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: Object.values(sub),
      });
      await touch();
      const saved = rows(await client.execute({ sql: "SELECT * FROM submissions WHERE id = ?", args: [sub.id] }))[0];
      res.json(submissionFromRow(saved));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/submissions/:id/review", async (req, res, next) => {
    try {
      await ready;
      const { status, grade, feedback } = req.body || {};
      await client.execute({
        sql: "UPDATE submissions SET status = ?, grade = ?, feedback = ?, gradedAt = ? WHERE id = ?",
        args: [status, grade ?? null, feedback ?? null, Date.now(), req.params.id],
      });
      await touch();
      const saved = rows(await client.execute({ sql: "SELECT * FROM submissions WHERE id = ?", args: [req.params.id] }))[0];
      if (!saved) return res.status(404).json({ error: "not found" });
      res.json(submissionFromRow(saved));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/submissions/:id/messages", async (req, res, next) => {
    try {
      await ready;
      const row = rows(await client.execute({ sql: "SELECT * FROM submissions WHERE id = ?", args: [req.params.id] }))[0];
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
      await client.execute({
        sql: "UPDATE submissions SET thread = ? WHERE id = ?",
        args: [json(thread, []), req.params.id],
      });
      await touch();
      res.json(msg);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications", async (req, res, next) => {
    try {
      await ready;
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
      for (const n of created) {
        await client.execute({
          sql: `
            INSERT OR REPLACE INTO notifications (
              id, userId, type, title_fr, title_ar, body_fr, body_ar, link, read, "at"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: Object.values(n),
        });
      }
      await touch();
      res.json(created.map(notificationFromRow));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/:id/read", async (req, res, next) => {
    try {
      await ready;
      await client.execute({ sql: "UPDATE notifications SET read = 1 WHERE id = ?", args: [req.params.id] });
      await touch();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/read-all/:userId", async (req, res, next) => {
    try {
      await ready;
      await client.execute({ sql: "UPDATE notifications SET read = 1 WHERE userId = ?", args: [req.params.userId] });
      await touch();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "server_error", message: error.message });
  });

  return app;
}

async function init(client) {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      specialty TEXT,
      level TEXT,
      createdAt INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
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
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
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
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
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
    )`,
    `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
  ]);
  await client.execute("INSERT OR IGNORE INTO meta (key, value) VALUES ('version', '1')");
  await client.execute({
    sql: "INSERT OR IGNORE INTO meta (key, value) VALUES ('updatedAt', ?)",
    args: [String(Date.now())],
  });
  await client.execute({
    sql: "INSERT OR IGNORE INTO users (id, name, role, specialty, level, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      defaultProfessor.id,
      defaultProfessor.name,
      defaultProfessor.role,
      defaultProfessor.specialty,
      defaultProfessor.level,
      defaultProfessor.createdAt,
    ],
  });
}
