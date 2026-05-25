import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { statusBadge, t } from "../../i18n";
import { Badge, Button, Card, Label, Modal } from "../ui";
import { CourseFormModal, ExerciseFormModal, TheoryFormModal } from "../CourseEditor";
import TheoryView from "../shared/TheoryView";
import SubmissionDetail from "../shared/SubmissionDetail";
import Guide from "./Guide";
import type { Exercise, Submission } from "../../types";

export type ProfView = "dashboard" | "courses" | "inbox" | "students" | "guide";

const typeColors: Record<Exercise["type"], "indigo" | "emerald" | "amber" | "violet"> = {
  quiz: "indigo",
  practical: "emerald",
  project: "violet",
  research: "amber",
};
const typeIcons: Record<Exercise["type"], string> = {
  quiz: "📝",
  practical: "💻",
  project: "🚀",
  research: "🔬",
};

export default function ProfessorSpace({
  view,
  focusCourseId,
  focusSubmissionId,
  onClearFocus,
}: {
  view: ProfView;
  focusCourseId?: string | null;
  focusSubmissionId?: string | null;
  onClearFocus: () => void;
}) {
  switch (view) {
    case "dashboard":
      return <ProfDashboard />;
    case "courses":
      return <ProfCourses initialCourseId={focusCourseId ?? null} onClearFocus={onClearFocus} />;
    case "inbox":
      return <ProfInbox focusSubmissionId={focusSubmissionId} onClearFocus={onClearFocus} />;
    case "students":
      return <ProfStudents />;
    case "guide":
      return <Guide />;
  }
}

/* =========================
 * Dashboard
 * ========================= */
function ProfDashboard() {
  const { state, currentUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const stats = useMemo(() => {
    const students = state.users.filter((u) => u.role === "student");
    const published = state.courses.filter((c) => c.published);
    const drafts = state.courses.filter((c) => !c.published);
    const subs = state.submissions;
    const pending = subs.filter((s) => s.status === "submitted").length;
    const revision = subs.filter((s) => s.status === "needs_revision").length;
    const validated = subs.filter((s) => s.status === "validated").length;
    const graded = subs.filter((s) => s.grade !== undefined);
    const avg =
      graded.length > 0
        ? (graded.reduce((acc, s) => acc + (s.grade ?? 0), 0) / graded.length).toFixed(2)
        : "—";
    return {
      students: students.length,
      published: published.length,
      drafts: drafts.length,
      subs: subs.length,
      pending,
      revision,
      validated,
      avg,
    };
  }, [state]);

  const recent = useMemo(
    () => [...state.submissions].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 6),
    [state.submissions],
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-slate-900/20 border border-violet-500/30 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 grid place-items-center text-3xl shadow-lg shadow-violet-500/30">
          👨‍🏫
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-violet-300 font-semibold">
            {tr.professorSpace}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {tr.welcome} {currentUser?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1">{tr.classOverview}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="🎓" label={tr.studentsCount} value={stats.students} color="indigo" />
        <StatCard icon="📚" label={tr.coursesCount} value={stats.published} color="violet" />
        <StatCard icon="📝" label={tr.draftCount} value={stats.drafts} color="slate" />
        <StatCard icon="⏳" label={tr.toReview} value={stats.pending} color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-white mb-3">📊 {tr.classOverview}</h3>
          <div className="space-y-3">
            <StatRow label={tr.totalSubmissions} value={stats.subs} color="text-sky-300" />
            <StatRow label={tr.pendingGrades} value={stats.pending} color="text-amber-300" />
            <StatRow label={tr.status_needs_revision} value={stats.revision} color="text-rose-300" />
            <StatRow label={tr.validatedCount} value={stats.validated} color="text-emerald-300" />
            <StatRow label={tr.globalGrade} value={`${stats.avg}/20`} color="text-violet-300" />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white mb-3">📥 {tr.inbox}</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-6 text-center">{tr.noSubmissions}</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => {
                const c = state.courses.find((x) => x.id === s.courseId);
                return (
                  <li key={s.id} className="text-sm border-b border-slate-800 pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{s.studentName}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {isAr ? c?.title_ar : c?.title_fr}
                        </p>
                      </div>
                      <StatusPill status={s.status} lang={state.lang} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: "indigo" | "violet" | "sky" | "amber" | "emerald" | "slate";
}) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
    sky: "from-sky-500/20 to-sky-500/5 border-sky-500/30",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    slate: "from-slate-700/20 to-slate-700/5 border-slate-600/30",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function StatusPill({ status, lang }: { status: any; lang: any }) {
  const b = statusBadge(status, lang);
  return <Badge color={b.color}>{b.label}</Badge>;
}

/* =========================
 * Courses manager
 * ========================= */
function ProfCourses({
  initialCourseId,
  onClearFocus,
}: {
  initialCourseId: string | null;
  onClearFocus: () => void;
}) {
  const {
    state,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    deleteTheory,
    deleteExercise,
  } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const [selectedId, setSelectedId] = useState<string | null>(
    initialCourseId ?? state.courses[0]?.id ?? null,
  );
  const selected = state.courses.find((c) => c.id === selectedId);

  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [addTheoryOpen, setAddTheoryOpen] = useState(false);
  const [editTheoryId, setEditTheoryId] = useState<string | null>(null);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [editExerciseId, setEditExerciseId] = useState<string | null>(null);

  const editTheory = selected?.theory.find((t) => t.id === editTheoryId);
  const editExercise = selected?.exercises.find((e) => e.id === editExerciseId);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="grid md:grid-cols-[280px_1fr] gap-5">
      {/* Sidebar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white text-sm">📚 {tr.manageCourses}</h3>
          <button
            onClick={() => setAddCourseOpen(true)}
            className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-lg leading-none grid place-items-center"
            title={tr.addCourse}
          >
            +
          </button>
        </div>
        {state.courses
          .sort((a, b) => a.order - b.order)
          .map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                onClearFocus();
              }}
              className={`w-full text-${isAr ? "right" : "left"} p-3 rounded-lg text-sm transition border ${
                selectedId === c.id
                  ? "bg-violet-600/20 border-violet-500/40 text-white"
                  : "bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 grid place-items-center text-[10px] font-bold">
                  {c.order}
                </span>
                <span className="font-medium truncate flex-1">
                  {isAr ? c.title_ar : c.title_fr}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge color={c.published ? "emerald" : "slate"}>
                  {c.published ? "● " + tr.published : "○ " + tr.draft}
                </Badge>
                <span className="text-[10px] text-slate-500">
                  {c.theory.length} 📖 · {c.exercises.length} 🎯
                </span>
              </div>
            </button>
          ))}
      </div>

      {/* Selected course detail */}
      <div className="space-y-5">
        {!selected ? (
          <Card>
            <p className="text-slate-400 text-center py-10">{tr.noCourseSelected}</p>
          </Card>
        ) : (
          <>
            <div className="bg-gradient-to-br from-violet-600/15 to-slate-900/20 border border-violet-500/30 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-violet-300 font-semibold">
                    {isAr ? "الدرس" : "Cours"} {selected.order}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                    {isAr ? selected.title_ar : selected.title_fr}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2">
                    {isAr ? selected.summary_ar : selected.summary_fr}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <Badge color={selected.published ? "emerald" : "slate"}>
                    {selected.published ? tr.publishedBadge : tr.draftBadge}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {selected.published ? (
                  <Button
                    variant="outline"
                    onClick={() => unpublishCourse(selected.id)}
                    className="!py-1.5 !text-xs"
                  >
                    🔒 {tr.unpublish}
                  </Button>
                ) : (
                  <Button
                    onClick={() => publishCourse(selected.id)}
                    className="!py-1.5 !text-xs"
                  >
                    {tr.sendToStudents}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setEditCourseOpen(true)}
                  className="!py-1.5 !text-xs"
                >
                  ✎ {tr.edit}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(tr.confirmDelete)) {
                      deleteCourse(selected.id);
                      setSelectedId(null);
                    }
                  }}
                  className="!py-1.5 !text-xs"
                >
                  🗑 {tr.delete}
                </Button>
              </div>
            </div>

            {/* Theory */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  📖 {tr.theory}{" "}
                  <span className="text-sm text-slate-500">({selected.theory.length})</span>
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setAddTheoryOpen(true)}
                  className="!py-1.5 !text-xs"
                >
                  + {tr.addTheory}
                </Button>
              </div>
              {selected.theory.length === 0 ? (
                <p className="text-sm text-slate-500 italic">{tr.noTheory}</p>
              ) : (
                <TheoryView
                  course={selected}
                  lang={state.lang}
                  showActions
                  onEdit={setEditTheoryId}
                  onDelete={(id) =>
                    confirm(tr.confirmDelete) && deleteTheory(selected.id, id)
                  }
                />
              )}
            </section>

            {/* Exercises */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  🎯 {tr.exercises}{" "}
                  <span className="text-sm text-slate-500">
                    ({selected.exercises.length})
                  </span>
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setAddExerciseOpen(true)}
                  className="!py-1.5 !text-xs"
                >
                  + {tr.addExercise}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {selected.exercises.length === 0 && (
                  <p className="text-sm text-slate-500 italic col-span-2">{tr.noExercises}</p>
                )}
                {selected.exercises.map((ex) => (
                  <Card key={ex.id} className="!p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl">{typeIcons[ex.type]}</span>
                        <Badge color={typeColors[ex.type]}>
                          {tr[ex.type as keyof typeof tr] as string}
                        </Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditExerciseId(ex.id)}
                          className="text-indigo-300 hover:text-indigo-100 text-sm"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() =>
                            confirm(tr.confirmDelete) && deleteExercise(selected.id, ex.id)
                          }
                          className="text-rose-400 hover:text-rose-300 text-sm"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {isAr ? ex.title_ar : ex.title_fr}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {isAr ? ex.description_ar : ex.description_fr}
                    </p>
                    <ExerciseStats
                      courseId={selected.id}
                      exerciseId={ex.id}
                      totalStudents={state.users.filter((u) => u.role === "student").length}
                    />
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      <CourseFormModal open={addCourseOpen} onClose={() => setAddCourseOpen(false)} />
      {selected && (
        <>
          <CourseFormModal
            open={editCourseOpen}
            onClose={() => setEditCourseOpen(false)}
            course={selected}
          />
          <TheoryFormModal
            open={addTheoryOpen}
            onClose={() => setAddTheoryOpen(false)}
            courseId={selected.id}
          />
          <TheoryFormModal
            open={!!editTheory}
            onClose={() => setEditTheoryId(null)}
            courseId={selected.id}
            theory={editTheory}
          />
          <ExerciseFormModal
            open={addExerciseOpen}
            onClose={() => setAddExerciseOpen(false)}
            courseId={selected.id}
          />
          <ExerciseFormModal
            open={!!editExercise}
            onClose={() => setEditExerciseId(null)}
            courseId={selected.id}
            exercise={editExercise}
          />
        </>
      )}
    </div>
  );
}

function ExerciseStats({
  courseId,
  exerciseId,
  totalStudents,
}: {
  courseId: string;
  exerciseId: string;
  totalStudents: number;
}) {
  const { state } = useApp();
  const tr = t(state.lang);
  const subs = state.submissions.filter(
    (s) => s.courseId === courseId && s.exerciseId === exerciseId,
  );
  const validated = subs.filter((s) => s.status === "validated").length;
  const pending = subs.filter((s) => s.status === "submitted").length;
  return (
    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap text-[10px]">
      <span className="text-slate-500">{tr.perStudent}:</span>
      <Badge color="emerald">
        ✅ {validated}/{totalStudents}
      </Badge>
      {pending > 0 && <Badge color="amber">⏳ {pending}</Badge>}
    </div>
  );
}

/* =========================
 * Inbox / Submissions
 * ========================= */
function ProfInbox({
  focusSubmissionId,
  onClearFocus,
}: {
  focusSubmissionId?: string | null;
  onClearFocus: () => void;
}) {
  const { state } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const [filter, setFilter] = useState<"all" | "submitted" | "validated" | "needs_revision">(
    "submitted",
  );
  const [active, setActive] = useState<Submission | null>(
    focusSubmissionId
      ? state.submissions.find((s) => s.id === focusSubmissionId) ?? null
      : null,
  );

  const list = useMemo(() => {
    let l = state.submissions;
    if (filter !== "all") l = l.filter((s) => s.status === filter);
    return [...l].sort((a, b) => b.submittedAt - a.submittedAt);
  }, [state.submissions, filter]);

  const filters: { id: typeof filter; label: string; count: number }[] = [
    {
      id: "submitted",
      label: tr.toReview,
      count: state.submissions.filter((s) => s.status === "submitted").length,
    },
    {
      id: "needs_revision",
      label: tr.status_needs_revision,
      count: state.submissions.filter((s) => s.status === "needs_revision").length,
    },
    {
      id: "validated",
      label: tr.validatedCount,
      count: state.submissions.filter((s) => s.status === "validated").length,
    },
    { id: "all", label: isAr ? "الكل" : "Tous", count: state.submissions.length },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">📥 {tr.inbox}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {isAr
            ? "راجع تسليمات الطلاب وقم بتقييمها."
            : "Examinez et notez les travaux soumis par vos étudiants."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              filter === f.id
                ? "bg-violet-600 text-white"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
            }`}
          >
            {f.label}
            <span className="bg-black/30 px-1.5 rounded">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <Card>
            <p className="text-center text-sm text-slate-500 py-8">{tr.noSubmissions}</p>
          </Card>
        )}
        {list.map((s) => {
          const c = state.courses.find((x) => x.id === s.courseId);
          const e = c?.exercises.find((x) => x.id === s.exerciseId);
          return (
            <Card
              key={s.id}
              className="!p-4 cursor-pointer hover:border-violet-500/40 transition"
            >
              <div onClick={() => setActive(s)} className="flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-300 grid place-items-center text-base font-semibold shrink-0">
                  {s.studentName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{s.studentName}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400 truncate">
                      {isAr ? c?.title_ar : c?.title_fr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {isAr ? e?.title_ar : e?.title_fr} · {tr.attempt} {s.attempt}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {s.score !== undefined && <Badge color="sky">Quiz {s.score}%</Badge>}
                  {s.grade !== undefined && <Badge color="emerald">{s.grade}/20</Badge>}
                  <StatusPill status={s.status} lang={state.lang} />
                  {s.thread.length > 0 && (
                    <Badge color="indigo">💬 {s.thread.length}</Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {active && (
        <SubmissionDetail
          submission={state.submissions.find((s) => s.id === active.id) ?? active}
          onClose={() => {
            setActive(null);
            onClearFocus();
          }}
        />
      )}
    </div>
  );
}

/* =========================
 * Students roster
 * ========================= */
function ProfStudents() {
  const { state, deleteUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const students = state.users.filter((u) => u.role === "student");
  const selected = students.find((s) => s.id === selectedId);

  const studentStats = (sid: string) => {
    const subs = state.submissions.filter((s) => s.studentId === sid);
    const validated = subs.filter((s) => s.status === "validated").length;
    const graded = subs.filter((s) => s.grade !== undefined);
    const avg =
      graded.length > 0
        ? (graded.reduce((acc, s) => acc + (s.grade ?? 0), 0) / graded.length).toFixed(1)
        : "—";
    return { total: subs.length, validated, avg };
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4">
      <h2 className="text-2xl font-bold text-white">🎓 {tr.studentRoster}</h2>
      {students.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-slate-500 py-8">{tr.noStudents}</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((s) => {
            const st = studentStats(s.id);
            return (
              <Card key={s.id} className="!p-4 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-lg font-bold text-white shrink-0">
                    {s.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {s.specialty ?? "—"} · {s.level ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-slate-950/60 rounded p-2">
                    <p className="text-lg font-bold text-sky-300">{st.total}</p>
                    <p className="text-[10px] text-slate-500">{tr.totalSubmissions}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded p-2">
                    <p className="text-lg font-bold text-emerald-300">{st.validated}</p>
                    <p className="text-[10px] text-slate-500">{tr.validatedCount}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded p-2">
                    <p className="text-lg font-bold text-violet-300">{st.avg}</p>
                    <p className="text-[10px] text-slate-500">{tr.globalGrade}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedId(s.id)}
                    className="!py-1 !text-[11px] flex-1"
                  >
                    {tr.view}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(tr.confirmDelete)) deleteUser(s.id);
                    }}
                    className="!py-1 !text-[11px] !text-rose-400"
                  >
                    🗑
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <StudentDetailModal student={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function StudentDetailModal({
  student,
  onClose,
}: {
  student: any;
  onClose: () => void;
}) {
  const { state } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const subs = state.submissions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => b.submittedAt - a.submittedAt);

  const [openSub, setOpenSub] = useState<Submission | null>(null);

  return (
    <>
      <Modal open onClose={onClose} title={`🎓 ${student.name}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label>{tr.specialty}</Label>
              <p className="text-slate-200">{student.specialty ?? "—"}</p>
            </div>
            <div>
              <Label>{tr.level}</Label>
              <p className="text-slate-200">{student.level ?? "—"}</p>
            </div>
            <div className="col-span-2">
              <Label>{tr.registered}</Label>
              <p className="text-slate-200">
                {new Date(student.createdAt).toLocaleString(isAr ? "ar" : "fr")}
              </p>
            </div>
          </div>

          <div>
            <Label>📤 {tr.submissions}</Label>
            {subs.length === 0 ? (
              <p className="text-sm text-slate-500 italic">{tr.noSubmissions}</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {subs.map((s) => {
                  const c = state.courses.find((x) => x.id === s.courseId);
                  const e = c?.exercises.find((x) => x.id === s.exerciseId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setOpenSub(s)}
                      className={`w-full text-${isAr ? "right" : "left"} p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition flex items-center justify-between gap-2`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">
                          {isAr ? e?.title_ar : e?.title_fr}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {isAr ? c?.title_ar : c?.title_fr}
                        </p>
                      </div>
                      <StatusPill status={s.status} lang={state.lang} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {openSub && <SubmissionDetail submission={openSub} onClose={() => setOpenSub(null)} />}
    </>
  );
}
