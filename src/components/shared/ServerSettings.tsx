import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { t } from "../../i18n";
import { Button, Input, Label } from "../ui";
import QRCode from "qrcode";

export default function ServerSettings({ compact = false }: { compact?: boolean }) {
  const {
    state,
    serverUrl,
    serverStatus,
    setServerUrl,
    pingServer,
    resyncFromServer,
    currentUser,
  } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const [url, setUrl] = useState(serverUrl);
  const [pingResult, setPingResult] = useState<null | "ok" | "ko">(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Deep link: current app URL + ?server=<backend url>
  const deepLink = serverUrl
    ? `${window.location.origin}${window.location.pathname}?server=${encodeURIComponent(serverUrl)}`
    : "";

  // Generate QR code whenever the deepLink changes
  useEffect(() => {
    if (!deepLink) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(deepLink, { width: 240, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [deepLink]);

  const copyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const statusBadge = {
    live: { color: "bg-emerald-500", label: tr.serverStatus_live, dot: "bg-emerald-400 animate-pulse" },
    connecting: { color: "bg-amber-500", label: tr.serverStatus_connecting, dot: "bg-amber-400 animate-pulse" },
    offline: { color: "bg-slate-600", label: tr.serverStatus_offline, dot: "bg-slate-400" },
  }[serverStatus];

  const handleConnect = () => {
    setServerUrl(url);
    setPingResult(null);
  };

  const handleDisconnect = () => {
    setUrl("");
    setServerUrl("");
    setPingResult(null);
  };

  const handleTest = async () => {
    if (!url.trim()) return;
    setServerUrl(url);
    const ok = await pingServer();
    setPingResult(ok ? "ok" : "ko");
  };

  const handleResetServer = async () => {
    if (!confirm(tr.resetServerConfirm)) return;
    try {
      await fetch(`${serverUrl}/api/state/reset`, { method: "POST" });
      await resyncFromServer();
    } catch {}
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4">
      {/* Status pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            serverStatus === "live"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : serverStatus === "connecting"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-slate-700/30 border-slate-600/40 text-slate-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
          {statusBadge.label}
        </div>
        {serverUrl && (
          <span className="text-xs text-slate-500 break-all">
            {tr.serverConnectedTo}: <code className="text-indigo-300">{serverUrl}</code>
          </span>
        )}
      </div>

      {/* URL input */}
      <div>
        <Label>{tr.serverUrl}</Label>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={tr.serverUrlPlaceholder}
            className="flex-1"
            type="url"
            inputMode="url"
          />
          {serverUrl ? (
            <Button variant="secondary" onClick={handleDisconnect} className="!py-2 !text-xs shrink-0">
              {tr.serverDisconnect}
            </Button>
          ) : (
            <Button onClick={handleConnect} className="!py-2 !text-xs shrink-0" disabled={!url.trim()}>
              {tr.serverConnect}
            </Button>
          )}
        </div>
        {pingResult === "ok" && (
          <p className="text-xs text-emerald-400 mt-1.5">✓ {isAr ? "الاتصال ناجح" : "Connexion OK"}</p>
        )}
        {pingResult === "ko" && (
          <p className="text-xs text-rose-400 mt-1.5">
            ✗ {isAr ? "تعذر الوصول للخادم" : "Serveur injoignable"}
          </p>
        )}
      </div>

      {/* Help */}
      {!compact && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentUser?.role === "student" ? tr.studentNeedsServer : tr.serverHelp}
          </p>
        </div>
      )}

      {/* Actions */}
      {serverUrl && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleTest} className="!py-1.5 !text-xs">
            🔌 {tr.testConnection}
          </Button>
          <Button variant="outline" onClick={() => resyncFromServer()} className="!py-1.5 !text-xs">
            {tr.resync}
          </Button>
          {currentUser?.role === "professor" && (
            <Button variant="danger" onClick={handleResetServer} className="!py-1.5 !text-xs">
              {tr.resetServer}
            </Button>
          )}
        </div>
      )}

      {!compact && currentUser?.role === "professor" && (
        <p className="text-xs text-violet-300/80 italic">💡 {tr.syncedStudentsHint}</p>
      )}

      {/* 📤 Share-with-students panel (prof only, requires URL) */}
      {!compact && currentUser?.role === "professor" && serverUrl && qrDataUrl && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            📤 {isAr ? "شارك مع الطلاب" : "Partager avec les étudiants"}
          </h4>
          <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/30 rounded-xl p-4">
            <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-center">
              <div className="bg-white p-2 rounded-lg mx-auto sm:mx-0 shrink-0">
                <img src={qrDataUrl} alt="QR code" className="w-40 h-40 block" />
              </div>
              <div className="space-y-2 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "اطلب من الطلاب مسح هذا الرمز ضوئيًا بكاميرا الهاتف — سيفتح التطبيق مع الخادم مكوّن مسبقًا."
                    : "Demandez aux étudiants de scanner ce QR avec leur téléphone — l'app s'ouvre avec le serveur déjà configuré."}
                </p>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 break-all">
                  {deepLink}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={copyDeepLink} variant="outline" className="!py-1.5 !text-xs">
                    {copied
                      ? isAr
                        ? "✓ تم النسخ"
                        : "✓ Copié"
                      : isAr
                      ? "📋 نسخ الرابط"
                      : "📋 Copier le lien"}
                  </Button>
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-600 hover:border-indigo-400 hover:text-indigo-300 text-slate-300 transition inline-flex items-center gap-2"
                  >
                    🔗 {isAr ? "افتح" : "Ouvrir"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact status indicator for header / topbar */
export function ServerStatusBadge() {
  const { serverStatus, serverUrl, state } = useApp();
  const tr = t(state.lang);
  if (!serverUrl) return null;
  const cfg = {
    live: { dot: "bg-emerald-400 animate-pulse", text: "text-emerald-300", border: "border-emerald-500/30 bg-emerald-500/5", label: tr.serverStatus_live },
    connecting: { dot: "bg-amber-400 animate-pulse", text: "text-amber-300", border: "border-amber-500/30 bg-amber-500/5", label: tr.serverStatus_connecting },
    offline: { dot: "bg-rose-400", text: "text-rose-300", border: "border-rose-500/30 bg-rose-500/5", label: tr.serverStatus_offline },
  }[serverStatus];
  return (
    <span
      className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${cfg.border} ${cfg.text}`}
      title={serverUrl}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
