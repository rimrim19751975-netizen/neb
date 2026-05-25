import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import AuthGate from "./components/AuthGate";
import ProfessorSpace, { type ProfView } from "./components/professor/ProfessorSpace";
import StudentSpace, { type StudentView } from "./components/student/StudentSpace";
import NotificationsPanel from "./components/shared/NotificationsPanel";
import ServerSettings, { ServerStatusBadge } from "./components/shared/ServerSettings";
import { Button, Modal } from "./components/ui";
import { t } from "./i18n";
import type { Lang } from "./types";

function Shell() {
  const { state, currentUser, unreadCount, logout, setLang } = useApp();
  const [profView, setProfView] = useState<ProfView>("dashboard");
  const [studView, setStudView] = useState<StudentView>("home");
  const [focusCourseId, setFocusCourseId] = useState<string | null>(null);
  const [focusSubmissionId, setFocusSubmissionId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);

  if (!currentUser) return <AuthGate />;
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const isProf = currentUser.role === "professor";

  const profNav: { id: ProfView; label: string; icon: string; badge?: number }[] = [
    { id: "dashboard", label: tr.dashboard, icon: "📊" },
    { id: "courses", label: tr.manageCourses, icon: "📚" },
    {
      id: "inbox",
      label: tr.inbox,
      icon: "📥",
      badge: state.submissions.filter((s) => s.status === "submitted").length,
    },
    { id: "students", label: tr.studentRoster, icon: "🎓" },
    { id: "guide", label: tr.guide, icon: "📖" },
  ];

  const studNav: { id: StudentView; label: string; icon: string; badge?: number }[] = [
    { id: "home", label: tr.dashboard, icon: "🏠" },
    { id: "courses", label: tr.availableCourses, icon: "📚" },
    {
      id: "submissions",
      label: tr.yourSubmissions,
      icon: "📤",
      badge: state.submissions.filter(
        (s) => s.studentId === currentUser.id && s.status === "needs_revision",
      ).length,
    },
  ];

  const navItems = isProf ? profNav : studNav;
  const activeView = isProf ? profView : studView;
  const setActiveView = (id: any) => {
    if (isProf) setProfView(id);
    else setStudView(id);
    setSidebarOpen(false);
  };

  // Theme per role
  const theme = isProf
    ? {
        accent: "from-violet-500 to-fuchsia-600",
        shadow: "shadow-violet-500/30",
        activeBg: "bg-violet-600/20 text-violet-200 border-violet-500/40",
        emoji: "👨‍🏫",
        sideBg: "from-violet-950/40",
      }
    : {
        accent: "from-indigo-500 to-sky-600",
        shadow: "shadow-indigo-500/30",
        activeBg: "bg-indigo-600/20 text-indigo-200 border-indigo-500/40",
        emoji: "🎓",
        sideBg: "from-indigo-950/40",
      };

  const handleNavigate = (link: { view: "course" | "submissions"; id?: string }) => {
    if (link.view === "course") {
      if (isProf) {
        setProfView("courses");
        setFocusCourseId(link.id ?? null);
      } else {
        setStudView("courses");
        setFocusCourseId(link.id ?? null);
      }
    } else {
      if (isProf) {
        setProfView("inbox");
        setFocusSubmissionId(link.id ?? null);
      } else {
        setStudView("submissions");
        setFocusSubmissionId(link.id ?? null);
      }
    }
  };

  const clearFocus = () => {
    setFocusCourseId(null);
    setFocusSubmissionId(null);
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={`min-h-screen text-slate-100 flex bg-gradient-to-br ${theme.sideBg} via-slate-950 to-slate-950`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 ${isAr ? "right-0" : "left-0"} z-40 w-72 bg-slate-900/95 backdrop-blur border-${isAr ? "l" : "r"} border-slate-800 flex flex-col transform transition-transform ${
          sidebarOpen
            ? "translate-x-0"
            : isAr
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${theme.accent} grid place-items-center text-2xl shadow-lg ${theme.shadow}`}
            >
              {theme.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white truncate">{tr.appName}</h1>
              <p className="text-[10px] text-indigo-300 truncate font-medium">
                {isProf ? tr.professorSpace : tr.studentSpace}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="p-3 space-y-1">
          {navItems.map((it) => (
            <button
              key={it.id}
              onClick={() => {
                setActiveView(it.id);
                clearFocus();
              }}
              className={`w-full text-${isAr ? "right" : "left"} flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition border ${
                activeView === it.id
                  ? theme.activeBg
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
              }`}
            >
              <span className="text-lg">{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              {it.badge !== undefined && it.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center">
                  {it.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* User */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2 px-2 py-2 bg-slate-950/60 rounded-lg">
            <div
              className={`w-9 h-9 rounded-full grid place-items-center text-base ${
                isProf ? "bg-violet-600/20 text-violet-300" : "bg-indigo-600/20 text-indigo-300"
              }`}
            >
              {theme.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {isProf
                  ? tr.professor
                  : `${tr.student} · ${currentUser.level ?? ""}`}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLang("fr" as Lang)}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition ${
                state.lang === "fr"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setLang("ar" as Lang)}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition ${
                state.lang === "ar"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              🇸🇦 AR
            </button>
          </div>
          <button
            onClick={() => setServerModalOpen(true)}
            className="w-full px-2 py-1.5 rounded-md text-xs font-medium bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition flex items-center justify-center gap-2"
          >
            <span className="text-base">📡</span>
            <span className="flex-1 text-start">{tr.serverSettings}</span>
            <ServerStatusBadge />
          </button>
          <Button variant="secondary" onClick={logout} className="w-full !py-1.5 !text-xs">
            ⎋ {tr.logout}
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/40 backdrop-blur sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-300 text-2xl"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 flex-1">
            <span
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isProf
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/30"
                  : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {theme.emoji} {isProf ? tr.professorSpace : tr.studentSpace}
            </span>
            <ServerStatusBadge />
          </div>
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative w-10 h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-lg grid place-items-center transition"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              onNavigate={handleNavigate}
            />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto">
          {isProf ? (
            <ProfessorSpace
              view={profView}
              focusCourseId={focusCourseId}
              focusSubmissionId={focusSubmissionId}
              onClearFocus={clearFocus}
            />
          ) : (
            <StudentSpace
              view={studView}
              focusCourseId={focusCourseId}
              focusSubmissionId={focusSubmissionId}
              onClearFocus={clearFocus}
            />
          )}
        </div>
      </main>

      {/* Server settings modal */}
      <Modal
        open={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        title={`📡 ${tr.serverSettings}`}
        size="md"
      >
        <ServerSettings />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
