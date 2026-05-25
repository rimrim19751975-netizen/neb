import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { statusBadge, t } from "../../i18n";
import { Badge, Button, Card, Label, Modal, Textarea } from "../ui";
import TheoryView from "../shared/TheoryView";
import SubmissionDetail from "../shared/SubmissionDetail";
import QuizPlayer from "../QuizPlayer";
import type { Course, Exercise, Submission } from "../../types";

export type StudentView = "home" | "courses" | "submissions";

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

export default function StudentSpace({
  view,
  focusCourseId,
  focusSubmissionId,
  onClearFocus,
}: {
  view: StudentView;
  focusCourseId?: string | null;
  focusSubmissionId?: string | null;
  onClearFocus: () => void;
}) {
  switch (view) {
    case "home":
      return <StudentHome />;
    case "courses":
      return <StudentCourses focusCourseId={focusCourseId ?? null} onClearFocus={onClearFocus} />;
    case "submissions":
      return (
        <StudentSubmissions
          focusSubmissionId={focusSubmissionId}
          onClearFocus={onClearFocus}
        />
      );
  }
}

/* =========================
 * Home / Dashboard
 * ========================= */
function StudentHome() {
  const { state, currentUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const publishedCourses = state.courses.filter((c) => c.published);
  const mySubs = state.submissions.filter((s) => s.studentId === currentUser?.id);

  const totalExercises = publishedCourses.reduce((acc, c) => acc + c.exercises.length, 0);
  const done = mySubs.filter((s) => s.status === "validated").length;
  const inProgress = mySubs.filter(
    (s) => s.status === "submitted" || s.status === "needs_revision",
  ).length;
  const todo = totalExercises - mySubs.length;
  const progress = totalExercises ? Math.round((done / totalExercises) * 100) : 0;

  const graded = mySubs.filter((s) => s.grade !== undefined);
  const avg =
    graded.length > 0
      ? (graded.reduce((acc, s) => acc + (s.grade ?? 0), 0) / graded.length).toFixed(2)
      : "—";

  const recent = [...mySubs].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600/20 via-sky-600/10 to-slate-900/20 border border-indigo-500/30 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 grid place-items-center text-3xl shadow-lg shadow-indigo-500/30">
          🎓
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
            {tr.studentSpace}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {tr.welcome} {currentUser?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {currentUser?.specialty} · {currentUser?.level}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">📈 {tr.myProgress}</h3>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">
            {progress}%
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <MiniStat icon="📝" label={tr.todo} value={Math.max(0, todo)} color="slate" />
          <MiniStat icon="🕓" label={tr.inProgress} value={inProgress} color="amber" />
          <MiniStat icon="✅" label={tr.validatedCount} value={done} color="emerald" />
          <MiniStat icon="⭐" label={tr.avgScore} value={`${avg}/20`} color="violet" />
        </div>
      </Card>

      {/* Final eval */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-white mb-3">📋 {tr.finalEval}</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{tr.finalEvalDesc}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-300">40%</p>
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? "نظري" : "Théorique"}
              </p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-violet-300">40%</p>
              <p className="text-xs text-slate-400 mt-1">{tr.project}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-300">20%</p>
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? "عرض شفوي" : "Oral"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white mb-3">🕒 {tr.myActivity}</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-6">
              {tr.noSubmissions}
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => {
                const c = state.courses.find((x) => x.id === s.courseId);
                const e = c?.exercises.find((x) => x.id === s.exerciseId);
                const b = statusBadge(s.status, state.lang);
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 text-sm border-b border-slate-800 pb-2 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">
                        {isAr ? e?.title_ar : e?.title_fr}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {isAr ? c?.title_ar : c?.title_fr}
                      </p>
                    </div>
                    <Badge color={b.color}>{b.label}</Badge>
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

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: any;
  color: "slate" | "amber" | "emerald" | "violet";
}) {
  const colors = {
    slate: "from-slate-700/20 to-slate-700/5 border-slate-600/30 text-slate-200",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-200",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-200",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-200",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3 text-center`}
    >
      <div className="text-xl">{icon}</div>
      <p className="text-base font-bold mt-1">{value}</p>
      <p className="text-[10px] opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

/* =========================
 * Courses (browse)
 * ========================= */
function StudentCourses({
  focusCourseId,
  onClearFocus,
}: {
  focusCourseId: string | null;
  onClearFocus: () => void;
}) {
  const { state } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const published = state.courses
    .filter((c) => c.published)
    .sort((a, b) => a.order - b.order);

  const [openCourseId, setOpenCourseId] = useState<string | null>(focusCourseId);
  const openCourse = published.find((c) => c.id === openCourseId);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">📚 {tr.availableCourses}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {published.length}{" "}
          {isAr ? "دروس متاحة من أستاذك" : "cours disponibles de votre professeur"}
        </p>
      </div>

      {published.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-slate-500 py-10">
            {isAr
              ? "لم يقم أستاذك بنشر أي دروس بعد."
              : "Votre professeur n'a publié aucun cours pour l'instant."}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {published.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onOpen={() => {
                setOpenCourseId(c.id);
                onClearFocus();
              }}
            />
          ))}
        </div>
      )}

      {openCourse && (
        <CourseDetailModal
          course={openCourse}
          onClose={() => {
            setOpenCourseId(null);
            onClearFocus();
          }}
        />
      )}
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  const { state, currentUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const mySubs = state.submissions.filter(
    (s) => s.studentId === currentUser?.id && s.courseId === course.id,
  );
  const total = course.exercises.length;
  const done = mySubs.filter((s) => s.status === "validated").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="hover:border-indigo-500/40 transition cursor-pointer" >
      <div onClick={onOpen}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-lg font-bold text-white shrink-0">
            {course.order}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
              {isAr ? "الدرس" : "Cours"} {course.order}
            </p>
            <h4 className="font-semibold text-white">
              {isAr ? course.title_ar : course.title_fr}
            </h4>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {isAr ? course.summary_ar : course.summary_fr}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>📖 {course.theory.length}</span>
          <span>🎯 {course.exercises.length}</span>
          <span className="ms-auto text-indigo-300 font-medium">
            {done}/{total} ✅
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Button variant="outline" className="w-full !py-1.5 !text-xs mt-3">
          {tr.open} →
        </Button>
      </div>
    </Card>
  );
}

function CourseDetailModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { state, currentUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const [tab, setTab] = useState<"theory" | "exercises">("theory");
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const mySubs = state.submissions.filter(
    (s) => s.studentId === currentUser?.id && s.courseId === course.id,
  );
  const subFor = (exId: string) => mySubs.find((s) => s.exerciseId === exId);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        title={`${isAr ? "الدرس" : "Cours"} ${course.order} · ${
          isAr ? course.title_ar : course.title_fr
        }`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            {isAr ? course.summary_ar : course.summary_fr}
          </p>

          <div className="flex gap-1 p-1 bg-slate-950/60 rounded-lg">
            <button
              onClick={() => setTab("theory")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                tab === "theory"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📖 {tr.theory} ({course.theory.length})
            </button>
            <button
              onClick={() => setTab("exercises")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                tab === "exercises"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎯 {tr.exercises} ({course.exercises.length})
            </button>
          </div>

          {tab === "theory" ? (
            <TheoryView course={course} lang={state.lang} />
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {course.exercises.map((ex) => {
                const sub = subFor(ex.id);
                const badge = sub ? statusBadge(sub.status, state.lang) : null;
                return (
                  <Card key={ex.id} className="!p-4 hover:border-violet-500/40 transition">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl">{typeIcons[ex.type]}</span>
                      <Badge color={typeColors[ex.type]}>
                        {tr[ex.type as keyof typeof tr] as string}
                      </Badge>
                      {badge && <Badge color={badge.color}>{badge.label}</Badge>}
                      {sub?.grade !== undefined && (
                        <Badge color="emerald">{sub.grade}/20</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {isAr ? ex.title_ar : ex.title_fr}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {isAr ? ex.description_ar : ex.description_fr}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="!py-1 !text-[11px] flex-1"
                        onClick={() => setActiveExercise(ex)}
                      >
                        {sub?.status === "validated"
                          ? `👁 ${tr.view}`
                          : ex.type === "quiz"
                          ? tr.startQuiz
                          : sub
                          ? tr.resubmit
                          : tr.submit}
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {course.exercises.length === 0 && (
                <p className="text-sm text-slate-500 italic col-span-2 text-center py-4">
                  {tr.noExercises}
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {activeExercise && (
        <ExerciseDoModal
          exercise={activeExercise}
          courseId={course.id}
          existingSub={subFor(activeExercise.id)}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </>
  );
}

function ExerciseDoModal({
  exercise,
  courseId,
  existingSub,
  onClose,
}: {
  exercise: Exercise;
  courseId: string;
  existingSub?: Submission;
  onClose: () => void;
}) {
  const { state, submitWork } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const [text, setText] = useState(existingSub?.content ?? "");
  const [viewExisting, setViewExisting] = useState(
    existingSub?.status === "validated" || existingSub?.status === "rejected",
  );

  if (viewExisting && existingSub) {
    return <SubmissionDetail submission={existingSub} onClose={onClose} />;
  }

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitWork({
      courseId,
      exerciseId: exercise.id,
      content: text,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isAr ? exercise.title_ar : exercise.title_fr}
    >
      {exercise.type === "quiz" ? (
        <QuizPlayer
          exercise={exercise}
          lang={state.lang}
          onFinish={(score, answers) => {
            submitWork({
              courseId,
              exerciseId: exercise.id,
              content: JSON.stringify({ answers }),
              score,
              quizAnswers: answers,
            });
          }}
        />
      ) : (
        <div className="space-y-4">
          {existingSub?.status === "needs_revision" && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-sm text-rose-200">
              ✏️{" "}
              {isAr
                ? "طلب أستاذك تعديل عملك. راجع المحادثة وأعد التسليم."
                : "Votre professeur a demandé une correction. Consultez la conversation et re-soumettez."}
              {existingSub.feedback && (
                <p className="mt-2 text-xs text-rose-100">{existingSub.feedback}</p>
              )}
              <Button
                variant="ghost"
                onClick={() => setViewExisting(true)}
                className="!py-1 !text-xs mt-2 !text-rose-200"
              >
                💬 {tr.conversation}
              </Button>
            </div>
          )}

          <p className="text-slate-300 text-sm">
            {isAr ? exercise.description_ar : exercise.description_fr}
          </p>

          {(exercise.instructions_fr || exercise.instructions_ar) && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
              <Label>{tr.instructions}</Label>
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {isAr ? exercise.instructions_ar : exercise.instructions_fr}
              </p>
            </div>
          )}

          {exercise.starterCode && (
            <div>
              <Label>{tr.starterCode}</Label>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto font-mono">
                <code>{exercise.starterCode}</code>
              </pre>
            </div>
          )}

          <div>
            <Label>
              {tr.yourAnswer}
              {existingSub && (
                <span className="ms-2 text-slate-500 font-normal">
                  · {tr.attempt} {existingSub.attempt + 1}
                </span>
              )}
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب إجابتك أو الصق كودك هنا..."
                  : "Écrivez votre réponse ou collez votre code…"
              }
              className="!min-h-[200px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>
              {tr.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!text.trim()}>
              📤 {existingSub ? tr.resubmit : tr.submit}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* =========================
 * Submissions list (student)
 * ========================= */
function StudentSubmissions({
  focusSubmissionId,
  onClearFocus,
}: {
  focusSubmissionId?: string | null;
  onClearFocus: () => void;
}) {
  const { state, currentUser } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  const [active, setActive] = useState<Submission | null>(
    focusSubmissionId
      ? state.submissions.find((s) => s.id === focusSubmissionId) ?? null
      : null,
  );

  const subs = useMemo(
    () =>
      state.submissions
        .filter((s) => s.studentId === currentUser?.id)
        .sort((a, b) => b.submittedAt - a.submittedAt),
    [state.submissions, currentUser?.id],
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">📤 {tr.yourSubmissions}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {isAr ? "تابع حالة أعمالك وردود أستاذك." : "Suivez l'état de vos travaux et les retours du professeur."}
        </p>
      </div>

      {subs.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-slate-500 py-10">{tr.noSubmissions}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {subs.map((s) => {
            const c = state.courses.find((x) => x.id === s.courseId);
            const e = c?.exercises.find((x) => x.id === s.exerciseId);
            const b = statusBadge(s.status, state.lang);
            return (
              <Card
                key={s.id}
                className="!p-4 hover:border-indigo-500/40 transition cursor-pointer"
              >
                <div
                  onClick={() => setActive(s)}
                  className="flex items-center gap-3 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge color="indigo">
                        {isAr ? c?.title_ar : c?.title_fr}
                      </Badge>
                      <Badge color="slate">
                        {tr.attempt} {s.attempt}
                      </Badge>
                    </div>
                    <p className="text-white font-medium truncate">
                      {isAr ? e?.title_ar : e?.title_fr}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(s.submittedAt).toLocaleString(isAr ? "ar" : "fr")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge color={b.color}>{b.label}</Badge>
                    {s.grade !== undefined && (
                      <Badge color="emerald">{s.grade}/20</Badge>
                    )}
                    {s.score !== undefined && (
                      <Badge color="sky">Quiz {s.score}%</Badge>
                    )}
                    {s.thread.length > 0 && (
                      <Badge color="violet">💬 {s.thread.length}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
