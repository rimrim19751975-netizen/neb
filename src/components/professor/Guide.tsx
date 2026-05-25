import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { t } from "../../i18n";
import { Badge, Button, Card } from "../ui";
import ServerSettings from "../shared/ServerSettings";

type Section = "overview" | "prof" | "student" | "workflow" | "sync" | "tips" | "faq";

export default function Guide() {
  const { state } = useApp();
  const tr = t(state.lang);
  const isAr = state.lang === "ar";
  const [section, setSection] = useState<Section>("overview");

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: "overview", label: tr.guide_overview, icon: "🗺️" },
    { id: "prof", label: tr.guide_prof, icon: "👨‍🏫" },
    { id: "student", label: tr.guide_student, icon: "🎓" },
    { id: "workflow", label: tr.guide_workflow, icon: "🔄" },
    { id: "sync", label: isAr ? "المزامنة" : "Sync mobile", icon: "📡" },
    { id: "tips", label: tr.guide_tips, icon: "💡" },
    { id: "faq", label: tr.guide_faq, icon: "❓" },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-slate-900/20 border border-violet-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-3xl shadow-lg shadow-violet-500/30 shrink-0">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white">{tr.guideTitle}</h2>
            <p className="text-sm text-slate-300 mt-1">{tr.guideSubtitle}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="!py-1.5 !text-xs shrink-0"
          >
            {tr.printGuide}
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 border ${
              section === s.id
                ? "bg-violet-600/20 text-violet-200 border-violet-500/40"
                : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {section === "overview" && <OverviewSection isAr={isAr} />}
        {section === "prof" && <ProfSection isAr={isAr} />}
        {section === "student" && <StudentSection isAr={isAr} />}
        {section === "workflow" && <WorkflowSection isAr={isAr} />}
        {section === "sync" && <SyncSection isAr={isAr} />}
        {section === "tips" && <TipsSection isAr={isAr} />}
        {section === "faq" && <FaqSection isAr={isAr} />}
      </div>
    </div>
  );
}

/* ========================================================
 * SYNC / MOBILE SECTION
 * ======================================================== */
function SyncSection({ isAr }: { isAr: boolean }) {
  const steps = isAr
    ? [
        {
          title: "1️⃣ شغّل الخادم على حاسوبك",
          body: "افتح طرفية في مجلد المشروع ونفّذ:",
          code: "node server/server.mjs",
          note: "سيظهر سطر « Network: http://192.168.x.x:4000 » — هذا هو العنوان الذي ستشاركه.",
        },
        {
          title: "2️⃣ اتصل بالخادم من حساب الأستاذ",
          body: "في الشريط الجانبي اضغط « 📡 المزامنة » والصق العنوان، ثم « اتصال ».",
          note: "ستظهر نقطة خضراء « مزامن مباشر » في الأعلى.",
        },
        {
          title: "3️⃣ شارك العنوان مع الطلاب",
          body: "تأكد أن هواتف الطلاب على نفس شبكة Wi-Fi، ثم أعطهم العنوان (http://192.168.x.x:4000).",
          note: "💡 نصيحة: ولّد رمز QR للعنوان لتسهيل المشاركة.",
        },
        {
          title: "4️⃣ الطالب يفتح التطبيق على هاتفه",
          body: "في صفحة تسجيل الدخول، يضغط « 📡 المزامنة »، يلصق العنوان ويضغط « اتصال ».",
          note: "بعد الاتصال، ستظهر له فورًا جميع الدروس المنشورة.",
        },
        {
          title: "5️⃣ كل شيء يتزامن مباشرة!",
          body: "عند نشر درس، يتلقى الطلاب إشعارًا فوريًا. عند تسليم عمل، تتلقى أنت إشعارًا أيضًا.",
          note: "البيانات تُحفظ في ملف db.json على حاسوبك الذي يشغّل الخادم.",
        },
      ]
    : [
        {
          title: "1️⃣ Démarrez le serveur sur votre ordinateur",
          body: "Ouvrez un terminal dans le dossier du projet et exécutez :",
          code: "node server/server.mjs",
          note: "Une ligne « Network: http://192.168.x.x:4000 » s'affiche — c'est l'URL à partager.",
        },
        {
          title: "2️⃣ Connectez-vous au serveur depuis le compte prof",
          body: "Dans la barre latérale, cliquez « 📡 Synchronisation », collez l'URL puis « Connecter ».",
          note: "Un point vert « Synchronisé en direct » apparaît en haut.",
        },
        {
          title: "3️⃣ Partagez l'URL avec les étudiants",
          body: "Assurez-vous que les téléphones sont sur le même Wi-Fi, puis donnez-leur l'URL (http://192.168.x.x:4000).",
          note: "💡 Astuce : générez un QR code de l'URL pour faciliter le partage.",
        },
        {
          title: "4️⃣ L'étudiant ouvre l'app sur son téléphone",
          body: "Sur l'écran de connexion, il clique « 📡 Synchronisation », colle l'URL puis « Connecter ».",
          note: "Après connexion, tous vos cours publiés apparaissent instantanément.",
        },
        {
          title: "5️⃣ Tout se synchronise en temps réel !",
          body: "Quand vous publiez un cours, les étudiants reçoivent une notif. Quand un étudiant soumet, vous êtes notifié.",
          note: "Les données sont sauvegardées dans db.json sur l'ordinateur qui fait tourner le serveur.",
        },
      ];

  return (
    <div className="space-y-4">
      {/* Live settings panel */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          ⚙️ {isAr ? "إعدادات الخادم" : "Configuration du serveur"}
        </h3>
        <ServerSettings />
      </Card>

      {/* Step-by-step */}
      <div className="space-y-3">
        {steps.map((s, i) => (
          <Card key={i}>
            <h4 className="font-bold text-white mb-2">{s.title}</h4>
            <p className="text-sm text-slate-300 mb-2">{s.body}</p>
            {s.code && (
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto font-mono mb-2">
                <code>{s.code}</code>
              </pre>
            )}
            <p className="text-xs text-slate-400 italic">{s.note}</p>
          </Card>
        ))}
      </div>

      {/* 🌍 ngrok / Internet deployment */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          🌍 {isAr ? "النشر على الإنترنت (ngrok)" : "Déployer sur Internet (ngrok)"}
        </h3>
        <p className="text-sm text-slate-300 mb-3">
          {isAr
            ? "إذا كان طلابك بعيدين (ليسوا على نفس Wi-Fi)، استخدم ngrok لإنشاء عنوان عام HTTPS متاح من أي مكان."
            : "Si vos étudiants sont distants (pas sur le même Wi-Fi), utilisez ngrok pour obtenir une URL publique HTTPS accessible de partout."}
        </p>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
              1
            </span>
            <div className="flex-1">
              <p className="text-slate-300">
                {isAr ? "أنشئ حسابًا مجانيًا على" : "Créez un compte gratuit sur"}{" "}
                <a
                  href="https://dashboard.ngrok.com/signup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:underline"
                >
                  ngrok.com
                </a>{" "}
                {isAr ? "واحصل على authtoken" : "et récupérez votre authtoken"}.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
              2
            </span>
            <div className="flex-1">
              <p className="text-slate-300 mb-1">
                {isAr ? "احفظ الـ token في ملف:" : "Sauvegardez le token dans un fichier :"}
              </p>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300 overflow-x-auto font-mono">
                <code>echo VOTRE_TOKEN &gt; .ngrok-token</code>
              </pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
              3
            </span>
            <div className="flex-1">
              <p className="text-slate-300 mb-1">
                {isAr ? "نفّذ الأمر:" : "Lancez la commande :"}
              </p>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300 overflow-x-auto font-mono">
                <code>node deploy-ngrok.mjs</code>
              </pre>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? "سيظهر رمز QR كبير في الطرفية + رابطين HTTPS عموميين."
                  : "Un grand QR code s'affiche dans le terminal + 2 URLs HTTPS publiques."}
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
              4
            </span>
            <div className="flex-1">
              <p className="text-slate-300">
                {isAr
                  ? "وصّل نفسك بعنوان الـ backend في « 📡 المزامنة »، ثم استخدم « 📤 شارك مع الطلاب » للحصول على QR قابل للمسح."
                  : "Connectez-vous au backend dans « 📡 Synchronisation », puis utilisez « 📤 Partager avec les étudiants » pour obtenir un QR code scannable."}
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center text-xs font-bold shrink-0">
              ✓
            </span>
            <div className="flex-1">
              <p className="text-slate-300">
                {isAr
                  ? "الطلاب يمسحون الرمز بالكاميرا → التطبيق يفتح مع الخادم مكوّن مسبقًا. ما عليهم سوى التسجيل!"
                  : "Les étudiants scannent le QR avec leur appareil photo → l'app s'ouvre avec le serveur déjà configuré. Ils n'ont plus qu'à s'inscrire !"}
              </p>
            </div>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-200">
            <strong>{isAr ? "ملاحظة:" : "Note :"}</strong>{" "}
            {isAr
              ? "الحساب المجاني لـ ngrok يولّد عنوانًا جديدًا في كل مرة. شارك QR الجديد مع الطلاب عند كل تشغيل."
              : "Le compte gratuit ngrok génère une URL différente à chaque démarrage. Partagez le nouveau QR à chaque session."}
          </p>
        </div>
      </Card>

      {/* Architecture diagram */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-3">
          🏗 {isAr ? "كيف تعمل البنية" : "Comment ça marche"}
        </h3>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
          <pre>{`
   ┌─────────────────┐      HTTP + SSE       ┌─────────────────┐
   │  👨‍🏫 Prof (PC)  │ ◄─────────────────► │  🧠 Node.js      │
   │  React app      │   /api/* + /api/events │  Express + lowdb │
   └─────────────────┘                       │  db.json         │
                                              └────────┬─────────┘
                                                       │
                                              HTTP + SSE│
                                                       │
              ┌────────────────┬───────────────────────┤
              ▼                ▼                       ▼
       ┌──────────┐     ┌──────────┐            ┌──────────┐
       │ 📱 Élève 1│     │ 📱 Élève 2│   ...     │ 📱 Élève N│
       └──────────┘     └──────────┘            └──────────┘
`}</pre>
        </div>
        <ul className="text-xs text-slate-400 mt-3 space-y-1">
          <li>• <span className="text-emerald-300">REST API</span> : {isAr ? "كل تعديل (نشر، تسليم، تقييم) يُرسل إلى الخادم" : "chaque mutation (publication, soumission, note) est envoyée au serveur"}</li>
          <li>• <span className="text-violet-300">Server-Sent Events</span> : {isAr ? "كل جهاز متصل يتلقى التحديثات فورًا" : "tous les appareils connectés reçoivent les MAJ instantanément"}</li>
          <li>• <span className="text-amber-300">Offline-first</span> : {isAr ? "إذا انقطع الخادم، التطبيق يستمر بـ localStorage" : "si le serveur tombe, l'app continue avec localStorage"}</li>
          <li>• <span className="text-sky-300">lowdb (JSON)</span> : {isAr ? "كل البيانات تُحفظ في ملف db.json بسيط" : "toutes les données dans un simple fichier db.json"}</li>
        </ul>
      </Card>
    </div>
  );
}

/* ========================================================
 * OVERVIEW
 * ======================================================== */
function OverviewSection({ isAr }: { isAr: boolean }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          🧠 {isAr ? "ما هي هذه المنصة؟" : "Qu'est-ce que cette plateforme ?"}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {isAr
            ? "منصة تعليمية ثنائية اللغة (فرنسية/عربية) لتدريس الذكاء الاصطناعي. تتيح للأستاذ نشر دروس وتمارين، وللطلاب تعلّم وتسليم أعمالهم، مع نظام تقييم وتفاعل ثنائي الاتجاه."
            : "Une plateforme pédagogique bilingue (FR/AR) pour enseigner l'IA. Le professeur publie cours et exercices, les étudiants apprennent et soumettent leurs travaux, avec un système d'évaluation et d'interactions bidirectionnelles."}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <FeatureCard
          icon="👨‍🏫"
          color="violet"
          title={isAr ? "للأستاذ" : "Pour le professeur"}
          features={
            isAr
              ? [
                  "إنشاء/تعديل/حذف الدروس",
                  "إضافة أقسام نظرية بلغتين",
                  "إنشاء تمارين (اختبار/عملي/مشروع/بحث)",
                  "نشر الدروس للطلاب",
                  "مراجعة وتقييم التسليمات",
                  "محادثة مع كل طالب",
                ]
              : [
                  "Créer/modifier/supprimer des cours",
                  "Ajouter des sections théoriques bilingues",
                  "Créer des exercices (quiz/TP/projet/recherche)",
                  "Publier les cours aux étudiants",
                  "Examiner et noter les soumissions",
                  "Dialoguer avec chaque étudiant",
                ]
          }
        />

        <FeatureCard
          icon="🎓"
          color="indigo"
          title={isAr ? "للطالب" : "Pour l'étudiant"}
          features={
            isAr
              ? [
                  "تصفّح الدروس المنشورة",
                  "قراءة المحتوى النظري بلغتين",
                  "حلّ الاختبارات التفاعلية",
                  "تسليم التمارين والمشاريع",
                  "تلقّي الملاحظات والعلامات",
                  "إعادة التسليم بعد التصحيح",
                ]
              : [
                  "Parcourir les cours publiés",
                  "Lire le contenu théorique bilingue",
                  "Faire les quiz interactifs",
                  "Soumettre exercices et projets",
                  "Recevoir notes et commentaires",
                  "Re-soumettre après correction",
                ]
          }
        />
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          📚 {isAr ? "الدروس المتاحة" : "Cours disponibles"}
        </h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            isAr ? "1. مقدمة في الذكاء الاصطناعي" : "1. Introduction à l'IA",
            isAr ? "2. أساسيات تعلّم الآلة" : "2. Machine Learning Fondamental",
            isAr ? "3. التعلم العميق والشبكات العصبية" : "3. Deep Learning & Réseaux de neurones",
            isAr ? "4. معالجة اللغة الطبيعية (NLP)" : "4. Traitement du Langage Naturel (NLP)",
          ].map((c, i) => (
            <div
              key={i}
              className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200"
            >
              {c}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ========================================================
 * PROF SECTION
 * ======================================================== */
function ProfSection({ isAr }: { isAr: boolean }) {
  const sections = isAr
    ? [
        {
          title: "🔐 الدخول كأستاذ",
          steps: [
            "في صفحة تسجيل الدخول، انقر 5 مرات متتالية على أيقونة 🧠",
            "أدخل كلمة المرور: ai-prof-2026",
            "ستدخل تلقائيًا إلى فضاء الأستاذ بثيم بنفسجي 👨‍🏫",
          ],
        },
        {
          title: "📊 لوحة التحكم",
          steps: [
            "اطّلع على عدد الطلاب المسجلين",
            "تابع عدد الدروس المنشورة والمسودات",
            "راجع عدد التسليمات قيد الانتظار",
            "احصل على نظرة سريعة على آخر النشاطات",
          ],
        },
        {
          title: "📚 إدارة الدروس",
          steps: [
            "اختر درسًا من القائمة الجانبية أو أنشئ درسًا جديدًا (+)",
            "حرّر العنوان والملخّص بالفرنسية والعربية",
            "أضف أقسامًا نظرية بزرّ « إضافة قسم نظري »",
            "أضف تمارين متنوعة (اختبار، عملي، مشروع، بحث)",
            "للاختبار: أضف الأسئلة مع 4 خيارات وحدّد الإجابة الصحيحة",
            "للتمرين: أضف الوصف، التعليمات، وكود البداية الاختياري",
            "اضغط « 📤 إرسال للطلاب » لنشر الدرس — سيتلقّى جميع الطلاب إشعارًا تلقائيًا",
          ],
        },
        {
          title: "📥 صندوق الوارد",
          steps: [
            "استعرض كل التسليمات الجديدة من الطلاب",
            "استخدم المرشحات: للتصحيح / مطلوب تصحيح / معتمد / الكل",
            "افتح أي تسليم لرؤية المحتوى والمحادثة",
            "للاختبارات: تُحسب النتيجة تلقائيًا مع تفاصيل كل سؤال",
            "ضع علامة من 20 وأضف تعليقًا",
            "اختر القرار: ✅ اعتماد / ✏️ طلب تصحيح / ❌ رفض",
            "أرسل رسائل خاصة للطالب عبر المحادثة الداخلية",
          ],
        },
        {
          title: "🎓 قائمة الطلاب",
          steps: [
            "اطّلع على ملف كل طالب: التخصص، المستوى، الإحصائيات",
            "افتح تفاصيل أي طالب لرؤية كل تسليماته",
            "احذف الطلاب غير المرغوب فيهم (يحذف معهم تسليماتهم)",
          ],
        },
      ]
    : [
        {
          title: "🔐 Se connecter en tant que professeur",
          steps: [
            "Sur la page de connexion, cliquez 5 fois consécutivement sur l'icône 🧠",
            "Saisissez le mot de passe : ai-prof-2026",
            "Vous accédez automatiquement à l'espace professeur (thème violet) 👨‍🏫",
          ],
        },
        {
          title: "📊 Tableau de bord",
          steps: [
            "Consultez le nombre d'étudiants inscrits",
            "Suivez le nombre de cours publiés et de brouillons",
            "Surveillez les soumissions en attente de correction",
            "Obtenez un aperçu rapide de l'activité récente de la classe",
          ],
        },
        {
          title: "📚 Gestion des cours",
          steps: [
            "Sélectionnez un cours dans le panneau latéral ou créez-en un nouveau (+)",
            "Modifiez le titre et le résumé en français et en arabe",
            "Ajoutez des sections théoriques via « + Ajouter une section théorique »",
            "Créez divers types d'exercices (quiz, pratique, projet, recherche)",
            "Pour un quiz : ajoutez les questions, 4 options, marquez la bonne réponse",
            "Pour un TP : ajoutez description, consignes, et code de démarrage facultatif",
            "Cliquez « 📤 Envoyer aux étudiants » pour publier — tous reçoivent une notification automatique",
          ],
        },
        {
          title: "📥 Boîte de réception",
          steps: [
            "Visualisez toutes les nouvelles soumissions des étudiants",
            "Utilisez les filtres : À corriger / Correction demandée / Validés / Tous",
            "Ouvrez une soumission pour voir le contenu et la conversation",
            "Pour les quiz : le score est calculé automatiquement avec détail par question",
            "Attribuez une note sur 20 et ajoutez un commentaire",
            "Choisissez la décision : ✅ Valider / ✏️ Demander correction / ❌ Rejeter",
            "Envoyez des messages privés à l'étudiant via la conversation intégrée",
          ],
        },
        {
          title: "🎓 Liste des étudiants",
          steps: [
            "Consultez le profil de chaque étudiant : spécialité, niveau, statistiques",
            "Ouvrez le détail pour voir toutes les soumissions d'un étudiant",
            "Supprimez les étudiants au besoin (leurs soumissions sont aussi supprimées)",
          ],
        },
      ];

  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <Card key={i}>
          <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
          <ol className="space-y-2">
            {s.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}

/* ========================================================
 * STUDENT SECTION
 * ======================================================== */
function StudentSection({ isAr }: { isAr: boolean }) {
  const sections = isAr
    ? [
        {
          title: "🎓 إنشاء حساب طالب",
          steps: [
            "في صفحة تسجيل الدخول، اختر « تسجيل طالب »",
            "أدخل اسمك، تخصصك، ومستواك الدراسي",
            "اضغط « ابدأ » للدخول إلى فضاء الطالب",
            "في المرة القادمة، يكفي اختيار اسمك من قائمة الطلاب المسجلين",
          ],
        },
        {
          title: "🏠 الصفحة الرئيسية",
          steps: [
            "تابع تقدّمك العام بالنسبة المئوية",
            "اطّلع على إحصائياتك: للقيام به، قيد التقدم، معتمد، المعدل",
            "راجع آخر تسليماتك مع حالتها",
            "اعرف توزيع التقييم النهائي: 40% نظري + 40% مشروع + 20% شفوي",
          ],
        },
        {
          title: "📚 الدروس المتاحة",
          steps: [
            "تصفّح فقط الدروس المنشورة من قبل الأستاذ",
            "كل بطاقة درس تظهر شريط التقدم الخاص بك",
            "افتح أي درس لقراءة المحتوى النظري والوصول للتمارين",
            "بدّل بين تبويب « النظرية » و « التمارين »",
          ],
        },
        {
          title: "📝 حلّ التمارين",
          steps: [
            "للاختبار: انقر « ابدأ الاختبار » وأجب عن الأسئلة واحدًا تلو الآخر",
            "ستظهر النتيجة فورًا بعد إنهاء الاختبار",
            "للتمرين العملي: اقرأ التعليمات وكود البداية إن وُجد",
            "اكتب إجابتك أو الصق كودك في الحقل المخصص",
            "اضغط « 📤 تسليم » لإرسال عملك للأستاذ",
          ],
        },
        {
          title: "📤 متابعة التسليمات",
          steps: [
            "اذهب إلى « تسليماتي » لرؤية حالة كل عمل",
            "الحالات: 🕓 قيد الانتظار / ✏️ مطلوب تصحيح / ✅ معتمد / ❌ مرفوض",
            "افتح أي تسليم لرؤية الملاحظات والعلامة",
            "تحدّث مع الأستاذ مباشرة عبر المحادثة الداخلية",
            "إذا طُلب التصحيح: عُد للتمرين واضغط « إعادة التسليم »",
          ],
        },
      ]
    : [
        {
          title: "🎓 Créer un compte étudiant",
          steps: [
            "Sur la page de connexion, choisissez « Inscription étudiant »",
            "Saisissez votre nom, spécialité et niveau d'études",
            "Cliquez « Commencer » pour accéder à votre espace",
            "La prochaine fois, sélectionnez simplement votre nom dans la liste",
          ],
        },
        {
          title: "🏠 Tableau de bord",
          steps: [
            "Suivez votre progression globale en pourcentage",
            "Consultez vos stats : À faire, En cours, Validés, Moyenne",
            "Visualisez vos dernières soumissions avec leur statut",
            "Découvrez la répartition de l'évaluation finale : 40% théorique + 40% projet + 20% oral",
          ],
        },
        {
          title: "📚 Cours disponibles",
          steps: [
            "Parcourez uniquement les cours publiés par votre professeur",
            "Chaque carte affiche votre barre de progression personnelle",
            "Ouvrez un cours pour lire la théorie et accéder aux exercices",
            "Basculez entre l'onglet « Théorie » et « Exercices »",
          ],
        },
        {
          title: "📝 Faire les exercices",
          steps: [
            "Pour un quiz : cliquez « Commencer le quiz » et répondez question par question",
            "Le résultat s'affiche immédiatement à la fin",
            "Pour un TP : lisez les consignes et le code de démarrage s'il existe",
            "Écrivez votre réponse ou collez votre code dans la zone prévue",
            "Cliquez « 📤 Soumettre » pour envoyer votre travail au professeur",
          ],
        },
        {
          title: "📤 Suivre vos soumissions",
          steps: [
            "Allez dans « Mes soumissions » pour voir l'état de chaque travail",
            "Statuts : 🕓 En attente / ✏️ Correction demandée / ✅ Validé / ❌ Rejeté",
            "Ouvrez une soumission pour voir le commentaire et la note",
            "Dialoguez directement avec le professeur via la conversation interne",
            "Si une correction est demandée : revenez à l'exercice et cliquez « Re-soumettre »",
          ],
        },
      ];

  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <Card key={i}>
          <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
          <ol className="space-y-2">
            {s.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 grid place-items-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}

/* ========================================================
 * WORKFLOW DIAGRAM
 * ======================================================== */
function WorkflowSection({ isAr }: { isAr: boolean }) {
  const steps = isAr
    ? [
        {
          icon: "📝",
          actor: "أستاذ",
          color: "violet",
          title: "إنشاء الدرس",
          desc: "الأستاذ ينشئ الدرس مع النظرية والتمارين (يبقى كمسودة)",
        },
        {
          icon: "📤",
          actor: "أستاذ",
          color: "violet",
          title: "النشر",
          desc: "الأستاذ ينشر الدرس → الطلاب يتلقّون إشعارًا فوريًا 🔔",
        },
        {
          icon: "📚",
          actor: "طالب",
          color: "indigo",
          title: "الدراسة",
          desc: "الطالب يقرأ النظرية ويستعد لحلّ التمارين",
        },
        {
          icon: "✍️",
          actor: "طالب",
          color: "indigo",
          title: "التسليم",
          desc: "الطالب يحلّ التمرين ويسلّم إجابته → الأستاذ يتلقّى إشعارًا 🔔",
        },
        {
          icon: "🔍",
          actor: "أستاذ",
          color: "violet",
          title: "المراجعة",
          desc: "الأستاذ يفتح التسليم، يقرأ المحتوى، ويضع علامة",
        },
        {
          icon: "⚖️",
          actor: "أستاذ",
          color: "violet",
          title: "القرار",
          desc: "✅ اعتماد · ✏️ طلب تصحيح · ❌ رفض → الطالب يتلقّى إشعارًا 🔔",
        },
        {
          icon: "💬",
          actor: "كلاهما",
          color: "amber",
          title: "المحادثة",
          desc: "محادثة ثنائية الاتجاه مرفقة بكل تسليم",
        },
        {
          icon: "🔁",
          actor: "طالب",
          color: "indigo",
          title: "إعادة التسليم",
          desc: "إذا طُلب التصحيح، الطالب يصحّح ويعيد التسليم (محاولة جديدة)",
        },
        {
          icon: "🎉",
          actor: "—",
          color: "emerald",
          title: "الاعتماد النهائي",
          desc: "بمجرد اعتماد العمل، يُحفظ في سجل الطالب ويُحسب في معدله",
        },
      ]
    : [
        {
          icon: "📝",
          actor: "Prof",
          color: "violet",
          title: "Création du cours",
          desc: "Le prof crée le cours avec théorie et exercices (reste en brouillon)",
        },
        {
          icon: "📤",
          actor: "Prof",
          color: "violet",
          title: "Publication",
          desc: "Le prof publie → les étudiants reçoivent une notification 🔔",
        },
        {
          icon: "📚",
          actor: "Étudiant",
          color: "indigo",
          title: "Étude",
          desc: "L'étudiant lit la théorie et se prépare à faire les exercices",
        },
        {
          icon: "✍️",
          actor: "Étudiant",
          color: "indigo",
          title: "Soumission",
          desc: "L'étudiant fait l'exercice et soumet → le prof reçoit une notification 🔔",
        },
        {
          icon: "🔍",
          actor: "Prof",
          color: "violet",
          title: "Examen",
          desc: "Le prof ouvre la soumission, lit le contenu, attribue une note",
        },
        {
          icon: "⚖️",
          actor: "Prof",
          color: "violet",
          title: "Décision",
          desc: "✅ Valider · ✏️ Demander correction · ❌ Rejeter → l'étudiant est notifié 🔔",
        },
        {
          icon: "💬",
          actor: "Les deux",
          color: "amber",
          title: "Conversation",
          desc: "Un fil de discussion bidirectionnel est attaché à chaque soumission",
        },
        {
          icon: "🔁",
          actor: "Étudiant",
          color: "indigo",
          title: "Re-soumission",
          desc: "Si correction demandée, l'étudiant corrige et re-soumet (nouvelle tentative)",
        },
        {
          icon: "🎉",
          actor: "—",
          color: "emerald",
          title: "Validation finale",
          desc: "Une fois validé, le travail est archivé et compte dans la moyenne",
        },
      ];

  const colorMap: Record<string, string> = {
    violet: "border-violet-500/30 bg-violet-500/10",
    indigo: "border-indigo-500/30 bg-indigo-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
    emerald: "border-emerald-500/30 bg-emerald-500/10",
  };
  const actorColor: Record<string, "violet" | "indigo" | "amber" | "emerald"> = {
    violet: "violet",
    indigo: "indigo",
    amber: "amber",
    emerald: "emerald",
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-white mb-1">
        🔄 {isAr ? "سير العمل الكامل" : "Cycle complet d'un cours"}
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        {isAr
          ? "من إنشاء الدرس إلى اعتماده النهائي"
          : "De la création du cours jusqu'à la validation finale"}
      </p>

      <ol className="relative">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 pb-5 last:pb-0 relative">
            {/* Vertical line */}
            {i < steps.length - 1 && (
              <span className="absolute top-12 start-5 bottom-0 w-px bg-slate-700" />
            )}
            <div
              className={`w-10 h-10 rounded-full border ${colorMap[s.color]} grid place-items-center text-xl shrink-0 relative z-10`}
            >
              {s.icon}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-semibold text-white text-sm">{s.title}</h4>
                <Badge color={actorColor[s.color]}>
                  {s.actor === "Prof" || s.actor === "أستاذ"
                    ? "👨‍🏫 "
                    : s.actor === "Étudiant" || s.actor === "طالب"
                    ? "🎓 "
                    : s.actor === "Les deux" || s.actor === "كلاهما"
                    ? "💬 "
                    : ""}
                  {s.actor}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ========================================================
 * TIPS
 * ======================================================== */
function TipsSection({ isAr }: { isAr: boolean }) {
  const tips = isAr
    ? [
        { icon: "🧠", title: "الدخول السري", body: "5 نقرات على الدماغ 🧠 + كلمة المرور = دخول الأستاذ" },
        { icon: "🌐", title: "تبديل اللغة", body: "بدّل بين الفرنسية والعربية من زرّ الأسفل في الشريط الجانبي" },
        { icon: "🔔", title: "الإشعارات", body: "كل عمل (نشر، تسليم، تقييم، رسالة) يولّد إشعارًا فوريًا" },
        { icon: "💾", title: "الحفظ التلقائي", body: "كل البيانات تُحفظ تلقائيًا في المتصفح (localStorage)" },
        { icon: "📝", title: "المسودات", body: "الدروس غير المنشورة (مسودات) لا تظهر للطلاب" },
        { icon: "🔁", title: "المحاولات", body: "كل إعادة تسليم تزيد رقم المحاولة وتُحفظ المحادثة" },
        { icon: "📱", title: "متجاوب", body: "التطبيق يعمل على الموبايل والتابلت والحاسوب" },
        { icon: "🖨", title: "طباعة الدليل", body: "اضغط « 🖨 طباعة » لحفظ هذا الدليل كـ PDF" },
      ]
    : [
        { icon: "🧠", title: "Accès secret", body: "5 clics sur l'icône 🧠 + mot de passe = accès professeur" },
        { icon: "🌐", title: "Changer de langue", body: "Basculez entre français et arabe via le bouton du panneau latéral" },
        { icon: "🔔", title: "Notifications", body: "Chaque action (publication, soumission, note, message) génère une notif instantanée" },
        { icon: "💾", title: "Sauvegarde auto", body: "Toutes les données sont sauvegardées automatiquement dans le navigateur" },
        { icon: "📝", title: "Brouillons", body: "Les cours non publiés (brouillons) ne sont pas visibles par les étudiants" },
        { icon: "🔁", title: "Tentatives", body: "Chaque re-soumission incrémente le numéro de tentative et conserve la conversation" },
        { icon: "📱", title: "Responsive", body: "L'app fonctionne sur mobile, tablette et ordinateur" },
        { icon: "🖨", title: "Imprimer le guide", body: "Cliquez « 🖨 Imprimer » pour sauvegarder ce guide en PDF" },
      ];

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {tips.map((t, i) => (
        <Card key={i} className="!p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">{t.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">{t.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.body}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ========================================================
 * FAQ
 * ======================================================== */
function FaqSection({ isAr }: { isAr: boolean }) {
  const faqs = isAr
    ? [
        {
          q: "كيف أضيف أستاذًا آخر؟",
          a: "الإصدار الحالي يدعم أستاذًا واحدًا فقط. كلمة المرور تمنح وصولاً كاملاً.",
        },
        {
          q: "هل يمكن للطلاب رؤية بعضهم البعض؟",
          a: "لا. كل طالب يرى فقط دروسه وتسليماته. الأستاذ فقط يرى كل الطلاب.",
        },
        {
          q: "ماذا يحدث إذا حذفت درسًا؟",
          a: "تُحذف كل تسليمات الطلاب المرتبطة به نهائيًا. كن حذرًا!",
        },
        {
          q: "هل البيانات محفوظة على الإنترنت؟",
          a: "لا. كل شيء محفوظ محليًا في متصفحك. مسح بيانات المتصفح يمسح كل شيء.",
        },
        {
          q: "كيف أصدّر بيانات الفصل؟",
          a: "غير متاح حاليًا. يمكنك طباعة كل صفحة بدلًا من ذلك.",
        },
        {
          q: "ماذا يحدث إذا فقدت كلمة مرور الأستاذ؟",
          a: "كلمة المرور ثابتة في الكود: ai-prof-2026. يمكنك تغييرها في src/components/AuthGate.tsx.",
        },
      ]
    : [
        {
          q: "Comment ajouter un autre professeur ?",
          a: "La version actuelle ne gère qu'un seul professeur. Le mot de passe donne un accès complet.",
        },
        {
          q: "Les étudiants peuvent-ils se voir entre eux ?",
          a: "Non. Chaque étudiant ne voit que ses propres cours et soumissions. Seul le prof voit tous les étudiants.",
        },
        {
          q: "Que se passe-t-il si je supprime un cours ?",
          a: "Toutes les soumissions liées sont définitivement supprimées. Soyez prudent !",
        },
        {
          q: "Les données sont-elles sauvegardées en ligne ?",
          a: "Non. Tout est stocké localement dans votre navigateur. Vider le cache supprime tout.",
        },
        {
          q: "Comment exporter les données de la classe ?",
          a: "Non disponible pour l'instant. Vous pouvez imprimer chaque page en alternative.",
        },
        {
          q: "Que faire si je perds le mot de passe professeur ?",
          a: "Il est codé en dur : ai-prof-2026. Modifiable dans src/components/AuthGate.tsx.",
        },
      ];

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <FaqItem key={i} q={f.q} a={f.a} index={i} />
      ))}
    </div>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-center gap-3 text-start hover:bg-slate-800/30 transition"
      >
        <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 grid place-items-center text-xs font-bold shrink-0">
          ?
        </span>
        <span className="flex-1 font-medium text-white text-sm">{q}</span>
        <span className={`text-slate-400 text-lg transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 ps-14">
          <p className="text-sm text-slate-300 leading-relaxed">{a}</p>
        </div>
      )}
    </Card>
  );
}

/* ========================================================
 * Helpers
 * ======================================================== */
function FeatureCard({
  icon,
  color,
  title,
  features,
}: {
  icon: string;
  color: "violet" | "indigo";
  title: string;
  features: string[];
}) {
  const colors = {
    violet: "from-violet-500/15 to-violet-500/5 border-violet-500/30",
    indigo: "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30",
  };
  const dotColor = color === "violet" ? "text-violet-300" : "text-indigo-300";
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-bold text-white">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {features.map((f, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300">
            <span className={`${dotColor} shrink-0`}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
