import type { Lang, SubmissionStatus } from "./types";

export const t = (lang: Lang) => ({
  appName: lang === "fr" ? "AI Academy" : "أكاديمية الذكاء الاصطناعي",
  tagline:
    lang === "fr"
      ? "Plateforme bilingue d'enseignement de l'IA (FR / AR)"
      : "منصة تعليم الذكاء الاصطناعي ثنائية اللغة (فرنسي/عربي)",
  professor: lang === "fr" ? "Professeur" : "أستاذ",
  student: lang === "fr" ? "Étudiant" : "طالب",
  professorSpace: lang === "fr" ? "Espace Professeur" : "فضاء الأستاذ",
  studentSpace: lang === "fr" ? "Espace Étudiant" : "فضاء الطالب",
  login: lang === "fr" ? "Connexion" : "تسجيل الدخول",
  logout: lang === "fr" ? "Déconnexion" : "تسجيل الخروج",
  name: lang === "fr" ? "Nom" : "الاسم",
  role: lang === "fr" ? "Rôle" : "الدور",
  specialty: lang === "fr" ? "Spécialité académique" : "التخصص الأكاديمي",
  level: lang === "fr" ? "Niveau d'études" : "المستوى الدراسي",
  start: lang === "fr" ? "Commencer" : "ابدأ",
  welcome: lang === "fr" ? "Bienvenue" : "مرحبًا",
  intro_q:
    lang === "fr"
      ? "Quelle est ta spécialité académique et ton niveau d'études ?"
      : "ما هو تخصصك الأكاديمي ومستواك الدراسي؟",
  courses: lang === "fr" ? "Cours" : "الدروس",
  myCourses: lang === "fr" ? "Mes cours" : "دروسي",
  availableCourses: lang === "fr" ? "Cours disponibles" : "الدروس المتاحة",
  dashboard: lang === "fr" ? "Tableau de bord" : "لوحة التحكم",
  students: lang === "fr" ? "Étudiants" : "الطلاب",
  submissions: lang === "fr" ? "Soumissions" : "التسليمات",
  inbox: lang === "fr" ? "Boîte de réception" : "صندوق الوارد",
  toReview: lang === "fr" ? "À corriger" : "للتصحيح",
  theory: lang === "fr" ? "Théorie" : "النظرية",
  exercises: lang === "fr" ? "Exercices pratiques" : "تمارين تطبيقية",
  add: lang === "fr" ? "Ajouter" : "إضافة",
  edit: lang === "fr" ? "Modifier" : "تعديل",
  delete: lang === "fr" ? "Supprimer" : "حذف",
  save: lang === "fr" ? "Enregistrer" : "حفظ",
  cancel: lang === "fr" ? "Annuler" : "إلغاء",
  title: lang === "fr" ? "Titre" : "العنوان",
  content: lang === "fr" ? "Contenu" : "المحتوى",
  description: lang === "fr" ? "Description" : "الوصف",
  instructions: lang === "fr" ? "Consignes" : "التعليمات",
  type: lang === "fr" ? "Type" : "النوع",
  quiz: "Quiz",
  practical: lang === "fr" ? "Pratique" : "عملي",
  project: lang === "fr" ? "Projet" : "مشروع",
  research: lang === "fr" ? "Recherche" : "بحث",
  submit: lang === "fr" ? "Soumettre" : "تسليم",
  resubmit: lang === "fr" ? "Re-soumettre" : "إعادة التسليم",
  yourAnswer: lang === "fr" ? "Votre réponse / code" : "إجابتك / الكود",
  starterCode: lang === "fr" ? "Code de démarrage" : "كود البداية",
  score: lang === "fr" ? "Score" : "النتيجة",
  grade: lang === "fr" ? "Note (/20)" : "العلامة (/20)",
  feedback: lang === "fr" ? "Commentaire" : "تعليق",
  giveGrade: lang === "fr" ? "Évaluer" : "تقييم",
  validate: lang === "fr" ? "Valider" : "اعتماد",
  reject: lang === "fr" ? "Rejeter" : "رفض",
  askRevision: lang === "fr" ? "Demander correction" : "طلب التصحيح",
  notGraded: lang === "fr" ? "En attente" : "قيد الانتظار",
  graded: lang === "fr" ? "Noté" : "مقيّم",
  question: lang === "fr" ? "Question" : "سؤال",
  options: lang === "fr" ? "Options" : "الخيارات",
  correct: lang === "fr" ? "Bonne réponse" : "الإجابة الصحيحة",
  next: lang === "fr" ? "Suivant" : "التالي",
  finish: lang === "fr" ? "Terminer" : "إنهاء",
  yourResult: lang === "fr" ? "Votre résultat" : "نتيجتك",
  noSubmissions: lang === "fr" ? "Aucune soumission pour l'instant." : "لا توجد تسليمات بعد.",
  studentsCount: lang === "fr" ? "Étudiants inscrits" : "الطلاب المسجلون",
  coursesCount: lang === "fr" ? "Cours publiés" : "الدروس المنشورة",
  draftCount: lang === "fr" ? "Brouillons" : "مسودات",
  avgScore: lang === "fr" ? "Score moyen" : "المعدل العام",
  addCourse: lang === "fr" ? "Nouveau cours" : "درس جديد",
  addTheory: lang === "fr" ? "Ajouter une section théorique" : "إضافة قسم نظري",
  addExercise: lang === "fr" ? "Ajouter un exercice" : "إضافة تمرين",
  addQuestion: lang === "fr" ? "Ajouter une question" : "إضافة سؤال",
  french: "Français",
  arabic: "العربية",
  summary: lang === "fr" ? "Résumé" : "ملخص",
  loginAs: lang === "fr" ? "Se connecter en tant que" : "تسجيل الدخول كـ",
  existingUsers: lang === "fr" ? "Utilisateurs existants" : "المستخدمون الحاليون",
  createAccount: lang === "fr" ? "Créer un compte" : "إنشاء حساب",
  finalEval: lang === "fr" ? "Évaluation finale" : "التقييم النهائي",
  finalEvalDesc:
    lang === "fr"
      ? "Examen théorique (40%) · Projet pratique (40%) · Présentation orale (20%)"
      : "امتحان نظري (40٪) · مشروع تطبيقي (40٪) · عرض شفوي (20٪)",
  byProf: lang === "fr" ? "par le professeur" : "من قبل الأستاذ",
  yourSubmissions: lang === "fr" ? "Mes soumissions" : "تسليماتي",
  confirmDelete: lang === "fr" ? "Confirmer la suppression ?" : "تأكيد الحذف؟",
  noCourseSelected: lang === "fr" ? "Sélectionnez un cours" : "اختر درسًا",
  progress: lang === "fr" ? "Progression" : "التقدم",
  startQuiz: lang === "fr" ? "Commencer le quiz" : "ابدأ الاختبار",
  question_n: lang === "fr" ? "Question" : "سؤال",
  of: lang === "fr" ? "sur" : "من",
  alreadySubmitted: lang === "fr" ? "Déjà soumis" : "تم التسليم",
  viewSubmission: lang === "fr" ? "Voir la soumission" : "عرض التسليم",
  studentDetail: lang === "fr" ? "Détail étudiant" : "تفاصيل الطالب",
  back: lang === "fr" ? "Retour" : "رجوع",
  totalSubmissions: lang === "fr" ? "Total soumissions" : "إجمالي التسليمات",
  pendingGrades: lang === "fr" ? "À évaluer" : "بانتظار التقييم",
  searchCourses: lang === "fr" ? "Rechercher un cours…" : "ابحث عن درس…",
  manageCourses: lang === "fr" ? "Gestion des cours" : "إدارة الدروس",
  noTheory: lang === "fr" ? "Aucune section théorique. Ajoutez-en !" : "لا توجد أقسام نظرية. أضف قسمًا!",
  noExercises: lang === "fr" ? "Aucun exercice. Ajoutez-en !" : "لا توجد تمارين. أضف تمرينًا!",
  introMsg:
    lang === "fr"
      ? "Bienvenue dans le cours d'IA ! Je suis votre professeur. Avant de commencer, dites-moi :"
      : "أهلًا بك في درس الذكاء الاصطناعي! أنا أستاذك. قبل أن نبدأ، أخبرني:",
  // workflow
  published: lang === "fr" ? "Publié" : "منشور",
  draft: lang === "fr" ? "Brouillon" : "مسودة",
  publish: lang === "fr" ? "Publier" : "نشر",
  unpublish: lang === "fr" ? "Dépublier" : "إلغاء النشر",
  publishDesc:
    lang === "fr"
      ? "Une fois publié, ce cours sera visible par tous les étudiants."
      : "بمجرد نشره، سيكون الدرس مرئيًا لجميع الطلاب.",
  sendToStudents: lang === "fr" ? "📤 Envoyer aux étudiants" : "📤 إرسال للطلاب",
  // statuses
  status_submitted: lang === "fr" ? "🕓 En attente" : "🕓 قيد الانتظار",
  status_needs_revision: lang === "fr" ? "✏️ Correction demandée" : "✏️ مطلوب تصحيح",
  status_validated: lang === "fr" ? "✅ Validé" : "✅ معتمد",
  status_rejected: lang === "fr" ? "❌ Rejeté" : "❌ مرفوض",
  // thread
  conversation: lang === "fr" ? "Conversation" : "محادثة",
  writeMessage: lang === "fr" ? "Écrire un message…" : "اكتب رسالة…",
  send: lang === "fr" ? "Envoyer" : "إرسال",
  attempt: lang === "fr" ? "Tentative" : "محاولة",
  // notifications
  notifications: lang === "fr" ? "Notifications" : "الإشعارات",
  noNotifications: lang === "fr" ? "Aucune notification" : "لا توجد إشعارات",
  markAllRead: lang === "fr" ? "Tout marquer comme lu" : "ضع علامة قراءة على الكل",
  // dashboards / sections
  myActivity: lang === "fr" ? "Mon activité" : "نشاطي",
  myProgress: lang === "fr" ? "Ma progression" : "تقدمي",
  classOverview: lang === "fr" ? "Vue d'ensemble de la classe" : "نظرة عامة على الفصل",
  studentRoster: lang === "fr" ? "Liste des étudiants" : "قائمة الطلاب",
  noStudents: lang === "fr" ? "Aucun étudiant inscrit." : "لا يوجد طلاب مسجلون.",
  registered: lang === "fr" ? "Inscrit le" : "مسجل في",
  done: lang === "fr" ? "Terminé" : "منجز",
  toDo: lang === "fr" ? "À faire" : "للقيام به",
  todo: lang === "fr" ? "À faire" : "للقيام به",
  inProgress: lang === "fr" ? "En cours" : "قيد التقدم",
  validatedCount: lang === "fr" ? "Validés" : "معتمد",
  view: lang === "fr" ? "Voir" : "عرض",
  open: lang === "fr" ? "Ouvrir" : "فتح",
  exerciseStatus: lang === "fr" ? "Statut" : "الحالة",
  professorView: lang === "fr" ? "Vue professeur" : "عرض الأستاذ",
  studentList: lang === "fr" ? "Étudiants" : "الطلاب",
  exerciseProgress: lang === "fr" ? "Progression des exercices" : "تقدم التمارين",
  dueDate: lang === "fr" ? "Date limite" : "الموعد النهائي",
  noDueDate: lang === "fr" ? "Pas de date limite" : "بدون موعد نهائي",
  perStudent: lang === "fr" ? "par étudiant" : "لكل طالب",
  globalGrade: lang === "fr" ? "Moyenne globale" : "المعدل العام",
  finalDecision: lang === "fr" ? "Décision finale" : "القرار النهائي",
  finalGradeRequired: lang === "fr" ? "Donnez une note avant de valider." : "ضع علامة قبل الاعتماد.",
  needsRevisionNote: lang === "fr" ? "L'étudiant pourra re-soumettre." : "سيتمكن الطالب من إعادة التسليم.",
  validatedNote: lang === "fr" ? "Travail validé définitivement." : "تم اعتماد العمل نهائيًا.",
  rejectedNote: lang === "fr" ? "Travail rejeté." : "تم رفض العمل.",
  publishedBadge: lang === "fr" ? "Publié" : "منشور",
  draftBadge: lang === "fr" ? "Brouillon" : "مسودة",
  saveAsDraft: lang === "fr" ? "Enregistrer en brouillon" : "حفظ كمسودة",
  yourGrade: lang === "fr" ? "Votre note" : "علامتك",
  notSubmitted: lang === "fr" ? "Non commencé" : "لم يبدأ",
  // hidden professor access
  professorLogin: lang === "fr" ? "Accès Professeur" : "دخول الأستاذ",
  professorLoginDesc:
    lang === "fr"
      ? "Espace réservé. Saisissez votre mot de passe d'administration."
      : "منطقة محجوزة. أدخل كلمة مرور الإدارة.",
  password: lang === "fr" ? "Mot de passe" : "كلمة المرور",
  enter: lang === "fr" ? "Entrer" : "دخول",
  wrongPassword: lang === "fr" ? "Mot de passe incorrect." : "كلمة المرور غير صحيحة.",
  studentSignUp: lang === "fr" ? "Inscription étudiant" : "تسجيل طالب",
  studentSignIn: lang === "fr" ? "Élèves inscrits" : "الطلاب المسجلون",
  noStudentsYet:
    lang === "fr"
      ? "Aucun élève inscrit. Créez votre compte."
      : "لا يوجد طلاب مسجلون. أنشئ حسابك.",
  onlyStudents:
    lang === "fr"
      ? "Cet espace est réservé aux étudiants."
      : "هذا الفضاء مخصص للطلاب فقط.",
  hintClicks: lang === "fr" ? "clics restants…" : "نقرات متبقية…",
  // Guide
  guide: lang === "fr" ? "Guide pratique" : "الدليل العملي",
  guideTitle:
    lang === "fr"
      ? "📖 Guide d'utilisation de la plateforme"
      : "📖 دليل استخدام المنصة",
  guideSubtitle:
    lang === "fr"
      ? "Comment utiliser l'application côté professeur et côté étudiant"
      : "كيفية استخدام التطبيق من جانب الأستاذ والطالب",
  guide_overview: lang === "fr" ? "Vue d'ensemble" : "نظرة عامة",
  guide_prof: lang === "fr" ? "Côté Professeur" : "جانب الأستاذ",
  guide_student: lang === "fr" ? "Côté Étudiant" : "جانب الطالب",
  guide_workflow: lang === "fr" ? "Workflow complet" : "سير العمل الكامل",
  guide_tips: lang === "fr" ? "Astuces & raccourcis" : "نصائح واختصارات",
  guide_faq: "FAQ",
  step: lang === "fr" ? "Étape" : "خطوة",
  printGuide: lang === "fr" ? "🖨 Imprimer" : "🖨 طباعة",
  // Server / sync
  server: lang === "fr" ? "Serveur" : "الخادم",
  serverSettings: lang === "fr" ? "Synchronisation" : "المزامنة",
  serverUrl: lang === "fr" ? "URL du serveur" : "عنوان الخادم",
  serverUrlPlaceholder: "http://192.168.1.10:4000",
  serverConnect: lang === "fr" ? "Connecter" : "اتصال",
  serverDisconnect: lang === "fr" ? "Déconnecter" : "قطع الاتصال",
  serverStatus_live: lang === "fr" ? "Synchronisé en direct" : "مزامن مباشر",
  serverStatus_connecting: lang === "fr" ? "Connexion…" : "جارٍ الاتصال…",
  serverStatus_offline: lang === "fr" ? "Hors-ligne (local seulement)" : "غير متصل (محلي فقط)",
  serverHelp:
    lang === "fr"
      ? "Démarrez le serveur Node.js avec « node server/server.mjs » puis collez ici l'URL réseau affichée (ex: http://192.168.1.10:4000). Les étudiants entrent la même URL sur leur téléphone."
      : "شغّل خادم Node.js بـ « node server/server.mjs » ثم الصق هنا عنوان الشبكة المعروض (مثل http://192.168.1.10:4000). يدخل الطلاب نفس العنوان على هواتفهم.",
  serverConnectedTo: lang === "fr" ? "Connecté à" : "متصل بـ",
  testConnection: lang === "fr" ? "Tester" : "اختبار",
  resync: lang === "fr" ? "🔄 Resynchroniser" : "🔄 إعادة المزامنة",
  resetServer: lang === "fr" ? "⚠ Réinitialiser le serveur" : "⚠ إعادة تعيين الخادم",
  resetServerConfirm:
    lang === "fr"
      ? "Cela effacera toutes les données du serveur (cours, étudiants, soumissions). Continuer ?"
      : "سيؤدي ذلك إلى محو جميع بيانات الخادم. هل تريد المتابعة؟",
  syncedStudentsHint:
    lang === "fr"
      ? "Quand connecté, vos cours publiés apparaissent en temps réel sur les téléphones des étudiants."
      : "عند الاتصال، تظهر دروسك المنشورة فورًا على هواتف الطلاب.",
  studentNeedsServer:
    lang === "fr"
      ? "💡 Pour recevoir les cours du professeur sur ce téléphone, demandez-lui l'URL du serveur et collez-la ci-dessous."
      : "💡 لتلقّي دروس الأستاذ على هذا الهاتف، اطلب منه عنوان الخادم والصقه أدناه.",
});

export const statusBadge = (s: SubmissionStatus, lang: Lang) => {
  const map = {
    submitted: { color: "amber" as const, label: t(lang).status_submitted },
    needs_revision: { color: "rose" as const, label: t(lang).status_needs_revision },
    validated: { color: "emerald" as const, label: t(lang).status_validated },
    rejected: { color: "slate" as const, label: t(lang).status_rejected },
  };
  return map[s];
};
