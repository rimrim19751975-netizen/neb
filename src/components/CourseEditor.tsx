import { useState } from "react";
import type { Course, Exercise, QuizQuestion, TheorySection } from "../types";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import { Button, Input, Label, Modal, Select, Textarea } from "./ui";

export function CourseFormModal({
  open,
  onClose,
  course,
}: {
  open: boolean;
  onClose: () => void;
  course?: Course;
}) {
  const { state, addCourse, updateCourse } = useApp();
  const tr = t(state.lang);
  const [data, setData] = useState({
    title_fr: course?.title_fr ?? "",
    title_ar: course?.title_ar ?? "",
    summary_fr: course?.summary_fr ?? "",
    summary_ar: course?.summary_ar ?? "",
  });

  const handleSave = () => {
    if (!data.title_fr.trim()) return;
    if (course) {
      updateCourse(course.id, data);
    } else {
      addCourse({
        ...data,
        theory: [],
        exercises: [],
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={course ? tr.edit : tr.addCourse}>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{tr.title} (FR)</Label>
            <Input value={data.title_fr} onChange={(e) => setData({ ...data, title_fr: e.target.value })} />
          </div>
          <div>
            <Label>{tr.title} (AR)</Label>
            <Input
              dir="rtl"
              value={data.title_ar}
              onChange={(e) => setData({ ...data, title_ar: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>{tr.summary} (FR)</Label>
          <Textarea
            className="!min-h-[80px] !font-sans"
            value={data.summary_fr}
            onChange={(e) => setData({ ...data, summary_fr: e.target.value })}
          />
        </div>
        <div>
          <Label>{tr.summary} (AR)</Label>
          <Textarea
            dir="rtl"
            className="!min-h-[80px] !font-sans"
            value={data.summary_ar}
            onChange={(e) => setData({ ...data, summary_ar: e.target.value })}
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            {tr.cancel}
          </Button>
          <Button onClick={handleSave}>{tr.save}</Button>
        </div>
      </div>
    </Modal>
  );
}

export function TheoryFormModal({
  open,
  onClose,
  courseId,
  theory,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  theory?: TheorySection;
}) {
  const { state, addTheory, updateTheory } = useApp();
  const tr = t(state.lang);
  const [data, setData] = useState({
    title_fr: theory?.title_fr ?? "",
    title_ar: theory?.title_ar ?? "",
    content_fr: theory?.content_fr ?? "",
    content_ar: theory?.content_ar ?? "",
  });

  const handleSave = () => {
    if (!data.title_fr.trim()) return;
    if (theory) updateTheory(courseId, theory.id, data);
    else addTheory(courseId, data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={theory ? tr.edit : tr.addTheory} size="lg">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{tr.title} (FR)</Label>
            <Input value={data.title_fr} onChange={(e) => setData({ ...data, title_fr: e.target.value })} />
          </div>
          <div>
            <Label>{tr.title} (AR)</Label>
            <Input
              dir="rtl"
              value={data.title_ar}
              onChange={(e) => setData({ ...data, title_ar: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>{tr.content} (FR)</Label>
          <Textarea
            className="!font-sans !min-h-[160px]"
            value={data.content_fr}
            onChange={(e) => setData({ ...data, content_fr: e.target.value })}
          />
        </div>
        <div>
          <Label>{tr.content} (AR)</Label>
          <Textarea
            dir="rtl"
            className="!font-sans !min-h-[160px]"
            value={data.content_ar}
            onChange={(e) => setData({ ...data, content_ar: e.target.value })}
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            {tr.cancel}
          </Button>
          <Button onClick={handleSave}>{tr.save}</Button>
        </div>
      </div>
    </Modal>
  );
}

export function ExerciseFormModal({
  open,
  onClose,
  courseId,
  exercise,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  exercise?: Exercise;
}) {
  const { state, addExercise, updateExercise } = useApp();
  const tr = t(state.lang);
  const [data, setData] = useState<Exercise>(
    exercise ?? {
      id: "",
      type: "practical",
      title_fr: "",
      title_ar: "",
      description_fr: "",
      description_ar: "",
      instructions_fr: "",
      instructions_ar: "",
      starterCode: "",
      questions: [],
    },
  );

  const updateQ = (qid: string, patch: Partial<QuizQuestion>) => {
    setData({
      ...data,
      questions: (data.questions ?? []).map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    });
  };
  const addQ = () => {
    const nq: QuizQuestion = {
      id: Math.random().toString(36).slice(2, 10),
      question_fr: "",
      question_ar: "",
      options_fr: ["", "", "", ""],
      options_ar: ["", "", "", ""],
      correctIndex: 0,
    };
    setData({ ...data, questions: [...(data.questions ?? []), nq] });
  };
  const delQ = (qid: string) => {
    setData({ ...data, questions: (data.questions ?? []).filter((q) => q.id !== qid) });
  };

  const handleSave = () => {
    if (!data.title_fr.trim()) return;
    const { id, ...payload } = data;
    if (exercise) updateExercise(courseId, exercise.id, payload);
    else addExercise(courseId, payload);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={exercise ? tr.edit : tr.addExercise} size="xl">
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>{tr.type}</Label>
            <Select value={data.type} onChange={(e) => setData({ ...data, type: e.target.value as Exercise["type"] })}>
              <option value="quiz">Quiz</option>
              <option value="practical">{tr.practical}</option>
              <option value="project">{tr.project}</option>
              <option value="research">{tr.research}</option>
            </Select>
          </div>
          <div>
            <Label>{tr.title} (FR)</Label>
            <Input value={data.title_fr} onChange={(e) => setData({ ...data, title_fr: e.target.value })} />
          </div>
          <div>
            <Label>{tr.title} (AR)</Label>
            <Input dir="rtl" value={data.title_ar} onChange={(e) => setData({ ...data, title_ar: e.target.value })} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{tr.description} (FR)</Label>
            <Textarea
              className="!font-sans !min-h-[80px]"
              value={data.description_fr}
              onChange={(e) => setData({ ...data, description_fr: e.target.value })}
            />
          </div>
          <div>
            <Label>{tr.description} (AR)</Label>
            <Textarea
              dir="rtl"
              className="!font-sans !min-h-[80px]"
              value={data.description_ar}
              onChange={(e) => setData({ ...data, description_ar: e.target.value })}
            />
          </div>
        </div>

        {data.type !== "quiz" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{tr.instructions} (FR)</Label>
                <Textarea
                  className="!font-sans"
                  value={data.instructions_fr ?? ""}
                  onChange={(e) => setData({ ...data, instructions_fr: e.target.value })}
                />
              </div>
              <div>
                <Label>{tr.instructions} (AR)</Label>
                <Textarea
                  dir="rtl"
                  className="!font-sans"
                  value={data.instructions_ar ?? ""}
                  onChange={(e) => setData({ ...data, instructions_ar: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{tr.starterCode}</Label>
              <Textarea
                value={data.starterCode ?? ""}
                onChange={(e) => setData({ ...data, starterCode: e.target.value })}
                placeholder="# Python code..."
              />
            </div>
          </>
        )}

        {data.type === "quiz" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>{tr.options}</Label>
              <Button variant="outline" onClick={addQ} className="!py-1 !px-2 !text-xs">
                + {tr.addQuestion}
              </Button>
            </div>
            {(data.questions ?? []).map((q, qi) => (
              <div key={q.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Q{qi + 1}</span>
                  <button onClick={() => delQ(q.id)} className="text-rose-400 text-xs hover:underline">
                    {tr.delete}
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Question FR"
                    value={q.question_fr}
                    onChange={(e) => updateQ(q.id, { question_fr: e.target.value })}
                  />
                  <Input
                    dir="rtl"
                    placeholder="السؤال"
                    value={q.question_ar}
                    onChange={(e) => updateQ(q.id, { question_ar: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={q.correctIndex === i}
                          onChange={() => updateQ(q.id, { correctIndex: i })}
                          className="accent-emerald-500"
                        />
                        <span className="text-xs text-slate-400">Option {String.fromCharCode(65 + i)}</span>
                      </div>
                      <Input
                        value={q.options_fr[i] ?? ""}
                        onChange={(e) => {
                          const opts = [...q.options_fr];
                          opts[i] = e.target.value;
                          updateQ(q.id, { options_fr: opts });
                        }}
                        placeholder="FR"
                      />
                      <Input
                        dir="rtl"
                        value={q.options_ar[i] ?? ""}
                        onChange={(e) => {
                          const opts = [...q.options_ar];
                          opts[i] = e.target.value;
                          updateQ(q.id, { options_ar: opts });
                        }}
                        placeholder="AR"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            {tr.cancel}
          </Button>
          <Button onClick={handleSave}>{tr.save}</Button>
        </div>
      </div>
    </Modal>
  );
}
