import { useState } from "react";
import type { Exercise, Lang } from "../types";
import { Button, Card } from "./ui";
import { t } from "../i18n";

export default function QuizPlayer({
  exercise,
  lang,
  onFinish,
}: {
  exercise: Exercise;
  lang: Lang;
  onFinish: (score: number, answers: number[]) => void;
}) {
  const tr = t(lang);
  const questions = exercise.questions ?? [];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (questions.length === 0) return <p className="text-slate-400">No questions.</p>;

  const q = questions[idx];
  const isAr = lang === "ar";

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      const correct = newAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      const score = Math.round((correct / questions.length) * 100);
      setDone(true);
      onFinish(score, newAnswers);
    }
  };

  if (done) {
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const score = Math.round((correct / questions.length) * 100);
    return (
      <Card>
        <div className="text-center space-y-4 py-6">
          <div className="text-6xl">{score >= 70 ? "🎉" : score >= 50 ? "👍" : "📚"}</div>
          <h3 className="text-2xl font-bold text-white">{tr.yourResult}</h3>
          <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {score}%
          </div>
          <p className="text-slate-400">
            {correct} / {questions.length} {isAr ? "إجابة صحيحة" : "bonnes réponses"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400 uppercase tracking-wider">
          {tr.question_n} {idx + 1} {tr.of} {questions.length}
        </span>
        <div className="flex-1 mx-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h4 className="text-lg font-medium text-white mb-5">
        {isAr ? q.question_ar : q.question_fr}
      </h4>

      <div className="space-y-2 mb-5">
        {(isAr ? q.options_ar : q.options_fr).map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-3 rounded-lg border transition ${
              selected === i
                ? "bg-indigo-600/20 border-indigo-500 text-white"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-600 text-slate-300"
            }`}
          >
            <span className="font-mono text-xs text-slate-500 mr-2">
              {String.fromCharCode(65 + i)}.
            </span>
            {opt}
          </button>
        ))}
      </div>

      <Button onClick={handleNext} disabled={selected === null} className="w-full">
        {idx + 1 === questions.length ? tr.finish : tr.next} →
      </Button>
    </Card>
  );
}
