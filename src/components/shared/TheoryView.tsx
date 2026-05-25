import type { Course, Lang } from "../../types";
import { Card } from "../ui";

export default function TheoryView({
  course,
  lang,
  onEdit,
  onDelete,
  showActions,
}: {
  course: Course;
  lang: Lang;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}) {
  const isAr = lang === "ar";
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {course.theory.map((th, i) => (
        <Card key={th.id} className="hover:border-indigo-500/40 transition">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 grid place-items-center text-xs font-bold shrink-0">
              {i + 1}
            </span>
            <h4 className="font-semibold text-white flex-1">{isAr ? th.title_ar : th.title_fr}</h4>
            {showActions && (
              <div className="flex gap-1 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(th.id)}
                    className="text-xs text-indigo-300 hover:text-indigo-100"
                    title="Edit"
                  >
                    ✎
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(th.id)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                    title="Delete"
                  >
                    🗑
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {isAr ? th.content_ar : th.content_fr}
          </p>
        </Card>
      ))}
    </div>
  );
}
