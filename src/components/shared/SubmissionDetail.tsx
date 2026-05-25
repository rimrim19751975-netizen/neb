import { useState } from "react";
import { useApp } from "../../context/AppContext";
import type { Submission, SubmissionStatus } from "../../types";
import { statusBadge, t } from "../../i18n";
import { Badge, Button, Input, Label, Modal } from "../ui";

export default function SubmissionDetail({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  const { state, currentUser, reviewSubmission, addThreadMessage } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const isProf = currentUser?.role === "professor";

  const course = state.courses.find((c) => c.id === submission.courseId);
  const exercise = course?.exercises.find((e) => e.id === submission.exerciseId);

  const [grade, setGrade] = useState<string>(submission.grade?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [msg, setMsg] = useState("");

  const badge = statusBadge(submission.status, state.lang);

  const handleDecision = (decision: SubmissionStatus) => {
    if (decision === "validated") {
      const g = parseFloat(grade);
      if (isNaN(g) || g < 0 || g > 20) {
        alert(tr.finalGradeRequired);
        return;
      }
      reviewSubmission(submission.id, decision, g, feedback);
    } else {
      reviewSubmission(
        submission.id,
        decision,
        grade ? parseFloat(grade) : undefined,
        feedback,
      );
    }
    onClose();
  };

  const handleSendMsg = () => {
    if (!msg.trim()) return;
    addThreadMessage(submission.id, msg);
    setMsg("");
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${isAr ? exercise?.title_ar : exercise?.title_fr} · ${submission.studentName}`}
    >
      <div className="space-y-5">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge color={badge.color}>{badge.label}</Badge>
          <Badge color="indigo">
            {isAr ? course?.title_ar : course?.title_fr}
          </Badge>
          <Badge color="slate">
            {tr.attempt} {submission.attempt}
          </Badge>
          {submission.score !== undefined && <Badge color="sky">Quiz {submission.score}%</Badge>}
          {submission.grade !== undefined && (
            <Badge color="emerald">{submission.grade}/20</Badge>
          )}
          <span className="text-slate-500 ms-auto">
            {new Date(submission.submittedAt).toLocaleString(isAr ? "ar" : "fr")}
          </span>
        </div>

        {/* Content */}
        {submission.score !== undefined ? (
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 text-center">
            <p className="text-xs uppercase text-sky-300 mb-1">{tr.score} Quiz</p>
            <p className="text-4xl font-bold text-white">{submission.score}%</p>
            {submission.quizAnswers && exercise?.questions && (
              <div className="mt-4 text-left space-y-1">
                {exercise.questions.map((q, i) => {
                  const ok = submission.quizAnswers?.[i] === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`text-xs p-2 rounded ${
                        ok ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      {ok ? "✓" : "✗"} Q{i + 1}: {isAr ? q.question_ar : q.question_fr}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label>{tr.yourAnswer}</Label>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">
              {submission.content}
            </pre>
          </div>
        )}

        {/* Conversation thread */}
        <div>
          <Label>💬 {tr.conversation}</Label>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg max-h-64 overflow-y-auto p-3 space-y-2">
            {submission.thread.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">
                {isAr ? "لا توجد رسائل بعد." : "Aucun message pour l'instant."}
              </p>
            )}
            {submission.thread.map((m) => {
              const mine = m.fromId === currentUser?.id;
              const profMsg = m.fromRole === "professor";
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      profMsg
                        ? "bg-violet-500/15 border border-violet-500/30 text-violet-100"
                        : "bg-indigo-500/15 border border-indigo-500/30 text-indigo-100"
                    }`}
                  >
                    <p className="text-[10px] opacity-70 mb-0.5">
                      {profMsg ? "👨‍🏫 " : "🎓 "}
                      {m.fromName} · {new Date(m.at).toLocaleString(isAr ? "ar" : "fr")}
                    </p>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={tr.writeMessage}
              onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
            />
            <Button onClick={handleSendMsg} disabled={!msg.trim()} className="shrink-0">
              {tr.send}
            </Button>
          </div>
        </div>

        {/* Professor decision panel */}
        {isProf && (
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-white">⚖️ {tr.finalDecision}</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label>{tr.grade}</Label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>{tr.feedback}</Label>
                <Input
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    isAr ? "ملاحظة موجزة..." : "Commentaire de synthèse…"
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="danger" onClick={() => handleDecision("rejected")}>
                ❌ {tr.reject}
              </Button>
              <Button variant="outline" onClick={() => handleDecision("needs_revision")}>
                ✏️ {tr.askRevision}
              </Button>
              <Button onClick={() => handleDecision("validated")}>✅ {tr.validate}</Button>
            </div>
            <p className="text-xs text-slate-500">
              {submission.status === "submitted" && tr.needsRevisionNote}
            </p>
          </div>
        )}

        {/* Student view : show final feedback if exists */}
        {!isProf && submission.feedback && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <Label>📝 {tr.feedback} ({tr.byProf})</Label>
            <p className="text-sm text-slate-200 whitespace-pre-line">{submission.feedback}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
