import { useApp } from "../../context/AppContext";
import { t } from "../../i18n";
import type { Notification } from "../../types";

export default function NotificationsPanel({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (link: { view: "course" | "submissions"; id?: string }) => void;
}) {
  const { state, currentUser, markAllRead, markRead } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  if (!open) return null;

  const notifs = state.notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => b.at - a.at);

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.link) {
      onNavigate(n.link);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        dir={isAr ? "rtl" : "ltr"}
        className={`absolute top-12 ${isAr ? "left-0" : "right-0"} w-80 max-h-[70vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col`}
      >
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">🔔 {tr.notifications}</h3>
          {notifs.some((n) => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-300 hover:underline"
            >
              {tr.markAllRead}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-10">{tr.noNotifications}</p>
          )}
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-${isAr ? "right" : "left"} px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition ${
                !n.read ? "bg-indigo-500/5" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    {isAr ? n.title_ar : n.title_fr}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {isAr ? n.body_ar : n.body_fr}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {new Date(n.at).toLocaleString(isAr ? "ar" : "fr")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
