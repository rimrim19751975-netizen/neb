import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import { Button, Card, Input, Label, Modal, Select } from "./ui";
import ServerSettings from "./shared/ServerSettings";

// 🔐 Secret professor password (also stored in state for the first/default prof)
const PROFESSOR_PASSWORD = "ai-prof-2026";
const REQUIRED_CLICKS = 5;
const CLICK_RESET_DELAY = 2500; // ms — if no click within 2.5s, counter resets

export default function AuthGate() {
  const { state, login, createUser, setLang } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";

  // Form state
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [level, setLevel] = useState("Licence 1");

  // Hidden professor access
  const [clickCount, setClickCount] = useState(0);
  const [profModalOpen, setProfModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  // Only students appear in the "existing users" list
  const studentUsers = state.users.filter((u) => u.role === "student");

  // Auto-switch to signup if no students yet
  useEffect(() => {
    if (studentUsers.length === 0 && mode === "signin") setMode("signup");
  }, [studentUsers.length, mode]);

  const handleSignup = () => {
    if (!name.trim()) return;
    createUser({
      name: name.trim(),
      role: "student",
      specialty: specialty.trim() || undefined,
      level,
    });
  };

  // === Hidden 5-click professor unlock ===
  const handleLogoClick = () => {
    setClickCount((c) => {
      const next = c + 1;
      if (next >= REQUIRED_CLICKS) {
        setProfModalOpen(true);
        return 0;
      }
      return next;
    });

    // Reset counter if user pauses
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setClickCount(0), CLICK_RESET_DELAY);
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleProfLogin = () => {
    if (password !== PROFESSOR_PASSWORD) {
      setPwError(true);
      return;
    }
    // Find or create the default professor
    let prof = state.users.find((u) => u.role === "professor");
    if (!prof) {
      prof = createUser({
        name: "Prof. Karim",
        role: "professor",
        specialty: "Intelligence Artificielle",
        level: "PhD",
      });
    } else {
      login(prof.id);
    }
    setPassword("");
    setPwError(false);
    setProfModalOpen(false);
  };

  const clicksLeft = REQUIRED_CLICKS - clickCount;
  const showHint = clickCount >= 2 && clickCount < REQUIRED_CLICKS;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* decorative blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero side */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3">
            {/* 🧠 Hidden door: click 5 times */}
            <button
              onClick={handleLogoClick}
              title="🧠"
              className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-2xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-90 select-none ${
                clickCount > 0 ? "ring-2 ring-violet-400/50" : ""
              }`}
            >
              🧠
              {showHint && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-violet-300 whitespace-nowrap font-medium">
                  {clicksLeft} {tr.hintClicks}
                </span>
              )}
            </button>
            <div>
              <h1 className="text-2xl font-bold">{tr.appName}</h1>
              <p className="text-sm text-slate-400">{tr.tagline}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              {isAr
                ? "تعلّم الذكاء الاصطناعي من الصفر إلى المشاريع المتقدمة"
                : "Apprenez l'IA de zéro jusqu'aux projets avancés"}
            </h2>
            <p className="text-slate-300 leading-relaxed">{tr.introMsg}</p>
            <p className="text-indigo-300 font-medium text-lg">"{tr.intro_q}"</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: "📚", label: isAr ? "4 دروس متكاملة" : "4 cours complets" },
              { icon: "💻", label: isAr ? "تمارين عملية" : "Exercices pratiques" },
              { icon: "🧪", label: isAr ? "اختبارات تفاعلية" : "Quiz interactifs" },
              { icon: "🎓", label: isAr ? "تقييم بعلامة" : "Notation / 20" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-xl">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 flex-wrap">
            <Button
              variant={state.lang === "fr" ? "primary" : "outline"}
              onClick={() => setLang("fr")}
              className="!py-1.5 !px-3 !text-xs"
            >
              🇫🇷 Français
            </Button>
            <Button
              variant={state.lang === "ar" ? "primary" : "outline"}
              onClick={() => setLang("ar")}
              className="!py-1.5 !px-3 !text-xs"
            >
              🇸🇦 العربية
            </Button>
            <Button
              variant="outline"
              onClick={() => setServerModalOpen(true)}
              className="!py-1.5 !px-3 !text-xs"
            >
              📡 {tr.serverSettings}
            </Button>
          </div>
        </div>

        {/* Student auth side */}
        <Card className="!p-6 md:!p-8">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              🎓 {tr.studentSpace}
            </div>
            <p className="text-xs text-slate-500">{tr.onlyStudents}</p>
          </div>

          <div className="flex gap-1 p-1 bg-slate-950/60 rounded-lg mb-6">
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tr.studentSignUp}
            </button>
            <button
              onClick={() => setMode("signin")}
              disabled={studentUsers.length === 0}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition relative ${
                mode === "signin"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {tr.studentSignIn}
              {studentUsers.length > 0 && (
                <span className="ms-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                  {studentUsers.length}
                </span>
              )}
            </button>
          </div>

          {mode === "signup" ? (
            <div className="space-y-4">
              <div>
                <Label>{tr.name}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? "اكتب اسمك" : "Votre nom"}
                />
              </div>
              <div>
                <Label>{tr.specialty}</Label>
                <Input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={isAr ? "مثل: علوم الحاسوب" : "Ex: Informatique, Médecine…"}
                />
              </div>
              <div>
                <Label>{tr.level}</Label>
                <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option>Licence 1</option>
                  <option>Licence 2</option>
                  <option>Licence 3</option>
                  <option>Master 1</option>
                  <option>Master 2</option>
                  <option>Doctorat</option>
                </Select>
              </div>
              <Button onClick={handleSignup} className="w-full !py-2.5" disabled={!name.trim()}>
                🎓 {tr.start} →
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {studentUsers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">{tr.noStudentsYet}</p>
              ) : (
                studentUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => login(u.id)}
                    className="w-full text-left p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/50 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full grid place-items-center text-lg bg-indigo-600/20 text-indigo-300">
                      🎓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {tr.student}
                        {u.level ? ` · ${u.level}` : ""}
                        {u.specialty ? ` · ${u.specialty}` : ""}
                      </p>
                    </div>
                    <span className="text-slate-500">→</span>
                  </button>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* 🔐 Hidden professor login modal */}
      <Modal
        open={profModalOpen}
        onClose={() => {
          setProfModalOpen(false);
          setPassword("");
          setPwError(false);
        }}
        title={`🔐 ${tr.professorLogin}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
            <span className="text-3xl">👨‍🏫</span>
            <div>
              <p className="text-sm font-semibold text-violet-200">{tr.professorSpace}</p>
              <p className="text-xs text-violet-300/70 mt-0.5">{tr.professorLoginDesc}</p>
            </div>
          </div>

          <div>
            <Label>{tr.password}</Label>
            <Input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleProfLogin()}
              placeholder="••••••••"
            />
            {pwError && (
              <p className="text-xs text-rose-400 mt-1.5">⚠ {tr.wrongPassword}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-2 italic">
              💡 hint (demo): <code className="text-violet-300">ai-prof-2026</code>
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setProfModalOpen(false);
                setPassword("");
                setPwError(false);
              }}
            >
              {tr.cancel}
            </Button>
            <Button onClick={handleProfLogin} disabled={!password}>
              🔓 {tr.enter}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 📡 Server settings modal (for students to connect to prof's server) */}
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
