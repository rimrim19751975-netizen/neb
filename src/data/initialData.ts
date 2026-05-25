import type { Course } from "../types";

export const initialCourses: Course[] = [
  {
    id: "c1",
    order: 1,
    published: true,
    publishedAt: Date.now(),
    authorId: "prof-default",
    title_fr: "Introduction à l'Intelligence Artificielle",
    title_ar: "مقدمة في الذكاء الاصطناعي",
    summary_fr: "Découvrir les fondements, l'histoire et les branches de l'IA, avec des bases mathématiques simplifiées.",
    summary_ar: "اكتشاف الأسس والتاريخ وفروع الذكاء الاصطناعي مع رياضيات أساسية مبسطة.",
    theory: [
      {
        id: "c1t1",
        title_fr: "Définition formelle de l'IA",
        title_ar: "التعريف الرسمي للذكاء الاصطناعي",
        content_fr:
          "L'Intelligence Artificielle (IA) est la discipline scientifique visant à créer des systèmes capables d'effectuer des tâches qui requièrent habituellement l'intelligence humaine : perception, raisonnement, apprentissage, décision et interaction en langage naturel. On distingue l'IA faible (spécialisée sur une tâche) de l'IA générale (encore théorique).",
        content_ar:
          "الذكاء الاصطناعي هو علم بناء أنظمة قادرة على أداء مهام تتطلب عادة ذكاءً بشريًا مثل الإدراك والاستنتاج والتعلم واتخاذ القرار والتفاعل باللغة الطبيعية. نميّز بين الذكاء الاصطناعي الضيق (المخصص لمهمة) والذكاء العام (لا يزال نظريًا).",
      },
      {
        id: "c1t2",
        title_fr: "Histoire : De Turing à ChatGPT",
        title_ar: "التاريخ: من تورينغ إلى ChatGPT",
        content_fr:
          "1950 : Alan Turing publie « Computing Machinery and Intelligence » et propose le test de Turing. 1956 : Conférence de Dartmouth, naissance officielle du terme « IA ». 1980-90 : systèmes experts. 2012 : AlexNet relance le Deep Learning. 2017 : article « Attention is All You Need » et les Transformers. 2022 : ChatGPT démocratise l'IA générative.",
        content_ar:
          "1950: نشر آلان تورينغ ورقته الشهيرة واقترح اختبار تورينغ. 1956: مؤتمر دارتموث وميلاد مصطلح « الذكاء الاصطناعي ». الثمانينيات: الأنظمة الخبيرة. 2012: شبكة AlexNet أعادت إحياء التعلم العميق. 2017: ورقة « الانتباه هو كل ما تحتاجه » والمحولات. 2022: ChatGPT ينشر الذكاء الاصطناعي التوليدي.",
      },
      {
        id: "c1t3",
        title_fr: "Branches de l'IA : ML, Deep Learning, NLP",
        title_ar: "فروع الذكاء الاصطناعي",
        content_fr:
          "• Machine Learning : algorithmes qui apprennent depuis les données.\n• Deep Learning : sous-domaine du ML basé sur des réseaux de neurones profonds.\n• NLP : traitement du langage naturel (texte, parole).\n• Vision par ordinateur : analyse d'images et vidéos.\n• Robotique : agents physiques intelligents.",
        content_ar:
          "• تعلم الآلة: خوارزميات تتعلم من البيانات.\n• التعلم العميق: فرع من تعلم الآلة يعتمد على الشبكات العصبية العميقة.\n• معالجة اللغة الطبيعية: نصوص وكلام.\n• الرؤية الحاسوبية: تحليل الصور والفيديو.\n• الروبوتات: عملاء فيزيائيون أذكياء.",
      },
      {
        id: "c1t4",
        title_fr: "Mathématiques de base : algèbre linéaire simple",
        title_ar: "الرياضيات الأساسية: جبر خطي مبسط",
        content_fr:
          "Un vecteur est une liste de nombres : v = [2, 5, 1]. Une matrice est un tableau 2D. Les opérations clés sont : addition, produit scalaire (dot product) et multiplication matricielle. Exemple : a·b = a1·b1 + a2·b2 + ... Ces opérations sont au cœur des réseaux de neurones.",
        content_ar:
          "المتجه هو قائمة من الأرقام مثل v = [2, 5, 1]. المصفوفة جدول ثنائي الأبعاد. أهم العمليات: الجمع، الضرب القياسي (a·b = a1·b1 + a2·b2 + ...)، وضرب المصفوفات. هذه العمليات هي أساس الشبكات العصبية.",
      },
    ],
    exercises: [
      {
        id: "c1e1",
        type: "quiz",
        title_fr: "Quiz : Histoire de l'IA (10 questions)",
        title_ar: "اختبار: تاريخ الذكاء الاصطناعي (10 أسئلة)",
        description_fr: "Évaluez vos connaissances sur l'histoire et les concepts fondamentaux de l'IA.",
        description_ar: "قيّم معرفتك بتاريخ الذكاء الاصطناعي ومفاهيمه الأساسية.",
        questions: [
          {
            id: "q1",
            question_fr: "Qui a proposé le « test de Turing » en 1950 ?",
            question_ar: "من اقترح « اختبار تورينغ » عام 1950؟",
            options_fr: ["John McCarthy", "Alan Turing", "Geoffrey Hinton", "Marvin Minsky"],
            options_ar: ["جون مكارثي", "آلان تورينغ", "جيفري هينتون", "مارفن مينسكي"],
            correctIndex: 1,
          },
          {
            id: "q2",
            question_fr: "En quelle année le terme « Intelligence Artificielle » est-il officiellement né ?",
            question_ar: "في أي عام وُلد مصطلح « الذكاء الاصطناعي » رسميًا؟",
            options_fr: ["1943", "1950", "1956", "1969"],
            options_ar: ["1943", "1950", "1956", "1969"],
            correctIndex: 2,
          },
          {
            id: "q3",
            question_fr: "Quelle conférence marque la naissance de l'IA ?",
            question_ar: "ما المؤتمر الذي يُعدّ ميلاد الذكاء الاصطناعي؟",
            options_fr: ["MIT 1960", "Dartmouth 1956", "Stanford 1965", "Cambridge 1970"],
            options_ar: ["MIT 1960", "دارتموث 1956", "ستانفورد 1965", "كامبريدج 1970"],
            correctIndex: 1,
          },
          {
            id: "q4",
            question_fr: "Quel réseau a relancé le Deep Learning en 2012 ?",
            question_ar: "ما الشبكة التي أعادت إحياء التعلم العميق عام 2012؟",
            options_fr: ["LeNet", "AlexNet", "ResNet", "VGG"],
            options_ar: ["LeNet", "AlexNet", "ResNet", "VGG"],
            correctIndex: 1,
          },
          {
            id: "q5",
            question_fr: "Quelle architecture a révolutionné le NLP en 2017 ?",
            question_ar: "ما البنية التي أحدثت ثورة في معالجة اللغة عام 2017؟",
            options_fr: ["RNN", "CNN", "Transformer", "GAN"],
            options_ar: ["RNN", "CNN", "Transformer", "GAN"],
            correctIndex: 2,
          },
          {
            id: "q6",
            question_fr: "Le Deep Learning est un sous-domaine de :",
            question_ar: "التعلم العميق هو فرع من:",
            options_fr: ["NLP", "Vision", "Machine Learning", "Robotique"],
            options_ar: ["NLP", "الرؤية", "تعلم الآلة", "الروبوتات"],
            correctIndex: 2,
          },
          {
            id: "q7",
            question_fr: "Qu'est-ce qu'un vecteur ?",
            question_ar: "ما هو المتجه؟",
            options_fr: ["Un seul nombre", "Une liste ordonnée de nombres", "Un tableau 2D", "Une fonction"],
            options_ar: ["عدد واحد", "قائمة مرتبة من الأرقام", "جدول ثنائي الأبعاد", "دالة"],
            correctIndex: 1,
          },
          {
            id: "q8",
            question_fr: "ChatGPT a été rendu public en :",
            question_ar: "تم إطلاق ChatGPT للعموم في:",
            options_fr: ["2020", "2021", "2022", "2023"],
            options_ar: ["2020", "2021", "2022", "2023"],
            correctIndex: 2,
          },
          {
            id: "q9",
            question_fr: "L'IA faible est :",
            question_ar: "الذكاء الاصطناعي الضيق هو:",
            options_fr: [
              "Une IA qui résout toutes les tâches",
              "Une IA spécialisée sur une tâche",
              "Un robot humanoïde",
              "Un ordinateur quantique",
            ],
            options_ar: [
              "ذكاء يحل كل المهام",
              "ذكاء مخصص لمهمة واحدة",
              "روبوت بشري",
              "حاسوب كمومي",
            ],
            correctIndex: 1,
          },
          {
            id: "q10",
            question_fr: "Le produit scalaire de [1,2] et [3,4] vaut :",
            question_ar: "الضرب القياسي لـ [1,2] و [3,4] يساوي:",
            options_fr: ["7", "10", "11", "14"],
            options_ar: ["7", "10", "11", "14"],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "c1e2",
        type: "research",
        title_fr: "Recherche : 3 applications IA dans votre domaine",
        title_ar: "بحث: 3 تطبيقات للذكاء الاصطناعي في تخصصك",
        description_fr: "Identifiez et analysez trois applications concrètes de l'IA dans votre spécialité d'études.",
        description_ar: "حدّد وحلّل ثلاث تطبيقات ملموسة للذكاء الاصطناعي في تخصصك.",
        instructions_fr:
          "1) Choisissez 3 applications IA dans votre domaine (médecine, finance, éducation, etc.).\n2) Pour chacune : décrivez le problème, la solution IA utilisée, et les bénéfices.\n3) Rendez un rapport de 500 mots minimum.",
        instructions_ar:
          "1) اختر 3 تطبيقات للذكاء الاصطناعي في مجالك (طب، مالية، تعليم...).\n2) لكل تطبيق: صف المشكلة، الحل المستخدم، والفوائد.\n3) قدّم تقريرًا من 500 كلمة على الأقل.",
      },
      {
        id: "c1e3",
        type: "project",
        title_fr: "Mini-projet : Présentation sur un pionnier de l'IA",
        title_ar: "مشروع مصغر: عرض عن أحد رواد الذكاء الاصطناعي",
        description_fr: "Préparez une présentation sur un pionnier de l'IA (Turing, McCarthy, Hinton, LeCun, Bengio…).",
        description_ar: "أعدّ عرضًا عن أحد رواد الذكاء الاصطناعي (تورينغ، مكارثي، هينتون، لوكون، بنجيو...).",
        instructions_fr:
          "Format : 8-10 diapositives. Sections obligatoires : biographie, contributions, impact actuel, sources.",
        instructions_ar:
          "الصيغة: 8-10 شرائح. الأقسام الإلزامية: السيرة الذاتية، المساهمات، الأثر الحالي، المصادر.",
      },
    ],
  },
  {
    id: "c2",
    order: 2,
    published: true,
    publishedAt: Date.now(),
    authorId: "prof-default",
    title_fr: "Machine Learning Fondamental",
    title_ar: "أساسيات تعلّم الآلة",
    summary_fr: "Apprentissage supervisé et non supervisé, préparation des données et premiers algorithmes.",
    summary_ar: "التعلم الخاضع للإشراف وغير الخاضع، إعداد البيانات وأولى الخوارزميات.",
    theory: [
      {
        id: "c2t1",
        title_fr: "Apprentissage supervisé vs non supervisé",
        title_ar: "التعلم الخاضع للإشراف مقابل غير الخاضع",
        content_fr:
          "Supervisé : on apprend depuis des données étiquetées (entrée → sortie connue). Exemples : régression, classification.\nNon supervisé : pas d'étiquettes, on découvre la structure des données. Exemples : clustering (k-means), réduction de dimension (PCA).",
        content_ar:
          "الخاضع للإشراف: نتعلّم من بيانات مُصنّفة (مدخل → مخرج معروف). أمثلة: الانحدار والتصنيف.\nغير الخاضع: بلا تصنيفات، نكتشف بنية البيانات. أمثلة: التجميع (k-means)، تقليل الأبعاد (PCA).",
      },
      {
        id: "c2t2",
        title_fr: "Datasets et préparation des données",
        title_ar: "مجموعات البيانات وإعدادها",
        content_fr:
          "Étapes : collecte, nettoyage (valeurs manquantes, doublons), normalisation, encodage des variables catégorielles, division train/validation/test (souvent 70/15/15).",
        content_ar:
          "الخطوات: الجمع، التنظيف (قيم مفقودة، تكرارات)، التطبيع، ترميز المتغيرات الفئوية، تقسيم البيانات إلى تدريب/تحقق/اختبار (غالبًا 70/15/15).",
      },
      {
        id: "c2t3",
        title_fr: "Algorithmes de base : régression linéaire & k-means",
        title_ar: "خوارزميات أساسية: الانحدار الخطي و k-means",
        content_fr:
          "Régression linéaire : y = a·x + b, on apprend a et b en minimisant l'erreur quadratique.\nk-means : on choisit k centres, on assigne chaque point au centre le plus proche, on recalcule les centres, on itère.",
        content_ar:
          "الانحدار الخطي: y = a·x + b، نتعلم a و b بتقليل الخطأ التربيعي.\nk-means: نختار k مراكز، نعيّن كل نقطة لأقرب مركز، نعيد حساب المراكز ونكرر.",
      },
      {
        id: "c2t4",
        title_fr: "Évaluation de modèles",
        title_ar: "تقييم النماذج",
        content_fr:
          "Régression : MSE, RMSE, MAE, R².\nClassification : accuracy, precision, recall, F1-score, matrice de confusion. Important : éviter le surapprentissage (overfitting).",
        content_ar:
          "الانحدار: MSE, RMSE, MAE, R².\nالتصنيف: الدقة، الاستدعاء، F1، مصفوفة الالتباس. مهم: تجنّب الإفراط في التعلّم.",
      },
    ],
    exercises: [
      {
        id: "c2e1",
        type: "practical",
        title_fr: "TP Python : Installation de scikit-learn",
        title_ar: "تطبيق عملي: تثبيت scikit-learn",
        description_fr: "Installez scikit-learn et exécutez vos premières manipulations.",
        description_ar: "ثبّت scikit-learn ونفّذ أولى التجارب.",
        instructions_fr:
          "1) pip install scikit-learn numpy pandas matplotlib\n2) Importez les bibliothèques.\n3) Chargez un dataset et affichez sa forme (shape).",
        instructions_ar:
          "1) pip install scikit-learn numpy pandas matplotlib\n2) استيراد المكتبات.\n3) تحميل مجموعة بيانات وعرض شكلها.",
        starterCode: `import numpy as np
import pandas as pd
from sklearn import datasets

iris = datasets.load_iris()
print("Shape:", iris.data.shape)
print("Classes:", iris.target_names)`,
      },
      {
        id: "c2e2",
        type: "practical",
        title_fr: "Dataset Iris : classification de fleurs",
        title_ar: "مجموعة Iris: تصنيف الأزهار",
        description_fr: "Analyser le célèbre dataset Iris et entraîner un classificateur.",
        description_ar: "تحليل مجموعة Iris الشهيرة وتدريب مصنّف.",
        instructions_fr:
          "Utilisez KNeighborsClassifier, séparez train/test, mesurez l'accuracy et tracez la matrice de confusion.",
        instructions_ar:
          "استخدم KNeighborsClassifier، قسّم البيانات، قِس الدقة وارسم مصفوفة الالتباس.",
        starterCode: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)
print("Accuracy:", model.score(X_test, y_test))`,
      },
      {
        id: "c2e3",
        type: "practical",
        title_fr: "Code : Régression linéaire simple",
        title_ar: "كود: انحدار خطي بسيط",
        description_fr: "Implémentez une régression linéaire prédisant un prix selon une surface.",
        description_ar: "نفّذ انحدارًا خطيًا يتنبأ بالسعر حسب المساحة.",
        instructions_fr: "Créez X (surfaces), y (prix), entraînez LinearRegression et affichez la pente et l'ordonnée.",
        instructions_ar: "أنشئ X (المساحات) و y (الأسعار)، درّب LinearRegression وأظهر الميل والثابت.",
        starterCode: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[30],[50],[70],[90],[110]])
y = np.array([60000, 100000, 140000, 180000, 220000])
model = LinearRegression().fit(X, y)
print("Pente:", model.coef_[0], "Ordonnée:", model.intercept_)`,
      },
      {
        id: "c2e4",
        type: "project",
        title_fr: "Rapport : Documenter vos résultats avec graphiques",
        title_ar: "تقرير: توثيق النتائج بالرسوم البيانية",
        description_fr: "Rédigez un rapport synthétique de vos TP avec graphiques matplotlib.",
        description_ar: "اكتب تقريرًا تركيبيًا لتطبيقاتك مع رسوم matplotlib.",
        instructions_fr: "Sections : objectif, données, méthode, résultats, graphiques, discussion, conclusion.",
        instructions_ar: "الأقسام: الهدف، البيانات، المنهج، النتائج، الرسوم، النقاش، الخلاصة.",
      },
    ],
  },
  {
    id: "c3",
    order: 3,
    published: true,
    publishedAt: Date.now(),
    authorId: "prof-default",
    title_fr: "Deep Learning et Réseaux de Neurones",
    title_ar: "التعلم العميق والشبكات العصبية",
    summary_fr: "Du neurone artificiel aux réseaux profonds : architecture, activation, rétropropagation.",
    summary_ar: "من العصبون الاصطناعي إلى الشبكات العميقة: البنية، التنشيط، الانتشار العكسي.",
    theory: [
      {
        id: "c3t1",
        title_fr: "Architecture d'un neurone artificiel",
        title_ar: "بنية العصبون الاصطناعي",
        content_fr:
          "Un neurone calcule : y = f(Σ wi·xi + b). Les xi sont les entrées, wi les poids, b le biais, f la fonction d'activation. C'est l'unité élémentaire d'un réseau.",
        content_ar:
          "يحسب العصبون: y = f(Σ wi·xi + b). xi المدخلات، wi الأوزان، b الانحياز، f دالة التنشيط. هو الوحدة الأساسية للشبكة.",
      },
      {
        id: "c3t2",
        title_fr: "Réseaux de neurones",
        title_ar: "الشبكات العصبية",
        content_fr:
          "Plusieurs neurones organisés en couches : couche d'entrée, couches cachées, couche de sortie. Plus il y a de couches, plus le réseau est « profond » (Deep Learning).",
        content_ar:
          "عدّة عصبونات منظمة في طبقات: طبقة الإدخال، طبقات مخفية، طبقة الإخراج. كلما زادت الطبقات كانت الشبكة أعمق.",
      },
      {
        id: "c3t3",
        title_fr: "Fonctions d'activation",
        title_ar: "دوال التنشيط",
        content_fr:
          "Sigmoid : σ(x) = 1/(1+e^-x), entre 0 et 1.\nReLU : max(0, x), très utilisée.\nTanh : entre -1 et 1.\nSoftmax : pour les probabilités multi-classes.",
        content_ar:
          "Sigmoid: σ(x) = 1/(1+e^-x) بين 0 و 1.\nReLU: max(0, x) شائعة جدًا.\nTanh: بين -1 و 1.\nSoftmax: للاحتمالات متعددة الفئات.",
      },
      {
        id: "c3t4",
        title_fr: "Rétropropagation (concepts simplifiés)",
        title_ar: "الانتشار العكسي (مفاهيم مبسطة)",
        content_fr:
          "1) Forward : calcul de la prédiction.\n2) Loss : calcul de l'erreur.\n3) Backward : calcul des gradients via la règle de la chaîne.\n4) Update : ajustement des poids (descente de gradient).",
        content_ar:
          "1) الأمامي: حساب التنبؤ.\n2) الخسارة: حساب الخطأ.\n3) العكسي: حساب التدرجات بقاعدة السلسلة.\n4) التحديث: تعديل الأوزان (نزول التدرج).",
      },
    ],
    exercises: [
      {
        id: "c3e1",
        type: "practical",
        title_fr: "Simulation : neurone avec un tableur",
        title_ar: "محاكاة: عصبون في جدول بيانات",
        description_fr: "Construisez un neurone simple dans Excel/Google Sheets pour comprendre le calcul.",
        description_ar: "ابنِ عصبونًا بسيطًا في Excel أو Google Sheets لفهم الحساب.",
        instructions_fr:
          "Colonnes : x1, x2, w1, w2, b, somme = x1*w1+x2*w2+b, sortie = sigmoid(somme). Testez plusieurs valeurs.",
        instructions_ar:
          "الأعمدة: x1, x2, w1, w2, b, المجموع = x1*w1+x2*w2+b, الخرج = sigmoid(المجموع). جرّب قيمًا مختلفة.",
      },
      {
        id: "c3e2",
        type: "practical",
        title_fr: "TensorFlow/Keras : premier réseau (MNIST)",
        title_ar: "TensorFlow/Keras: أول شبكة (MNIST)",
        description_fr: "Construisez votre premier réseau de neurones pour la reconnaissance de chiffres.",
        description_ar: "ابنِ أول شبكة عصبية للتعرّف على الأرقام.",
        instructions_fr: "Modèle séquentiel avec une couche cachée Dense(128, relu) et sortie Dense(10, softmax).",
        instructions_ar: "نموذج تسلسلي بطبقة مخفية Dense(128, relu) ومخرج Dense(10, softmax).",
        starterCode: `import tensorflow as tf
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train/255.0, x_test/255.0

model = tf.keras.Sequential([
  tf.keras.layers.Flatten(input_shape=(28,28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dense(10, activation='softmax')
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(x_train, y_train, epochs=5)
model.evaluate(x_test, y_test)`,
      },
      {
        id: "c3e3",
        type: "project",
        title_fr: "Projet : Reconnaissance de chiffres manuscrits",
        title_ar: "مشروع: التعرف على الأرقام المكتوبة بخط اليد",
        description_fr: "Améliorez votre modèle MNIST et atteignez >97% de précision.",
        description_ar: "حسّن نموذج MNIST وحقّق دقة > 97%.",
        instructions_fr: "Essayez plus de couches, Dropout, et différents optimisateurs. Comparez les résultats.",
        instructions_ar: "جرّب طبقات أكثر، Dropout، ومُحسّنات مختلفة. قارن النتائج.",
      },
      {
        id: "c3e4",
        type: "research",
        title_fr: "Documentation : Rapport scientifique",
        title_ar: "توثيق: تقرير علمي",
        description_fr: "Rédigez un rapport scientifique structuré sur votre projet MNIST.",
        description_ar: "اكتب تقريرًا علميًا منظمًا حول مشروع MNIST.",
        instructions_fr: "Format IMRAD : Introduction, Méthodes, Résultats, Discussion, Conclusion. 1500 mots.",
        instructions_ar: "صيغة IMRAD: مقدمة، مناهج، نتائج، نقاش، خاتمة. 1500 كلمة.",
      },
    ],
  },
  {
    id: "c4",
    order: 4,
    published: true,
    publishedAt: Date.now(),
    authorId: "prof-default",
    title_fr: "Traitement du Langage Naturel (NLP)",
    title_ar: "معالجة اللغة الطبيعية",
    summary_fr: "Du preprocessing aux Transformers : tokenization, embeddings, attention et chatbots.",
    summary_ar: "من المعالجة المسبقة إلى المحولات: الترميز، التضمين، الانتباه والشات بوت.",
    theory: [
      {
        id: "c4t1",
        title_fr: "Tokenization et preprocessing",
        title_ar: "الترميز والمعالجة المسبقة",
        content_fr:
          "Tokenization : découper le texte en unités (mots, sous-mots, caractères).\nPreprocessing : minuscules, suppression de la ponctuation, stop-words, stemming/lemmatization. Pour l'arabe : gérer la diacritisation et la segmentation des affixes.",
        content_ar:
          "الترميز: تقسيم النص إلى وحدات (كلمات، أجزاء كلمات، حروف).\nالمعالجة المسبقة: حروف صغيرة، إزالة الترقيم، الكلمات الموقوفة، الجذر/الأصل. للعربية: التعامل مع التشكيل وفصل اللواحق.",
      },
      {
        id: "c4t2",
        title_fr: "Word Embeddings",
        title_ar: "تضمين الكلمات",
        content_fr:
          "Représenter chaque mot par un vecteur dense capturant son sens. Méthodes : Word2Vec, GloVe, FastText. Propriété célèbre : roi - homme + femme ≈ reine.",
        content_ar:
          "تمثيل كل كلمة بمتجه كثيف يلتقط معناها. الطرق: Word2Vec, GloVe, FastText. خاصية شهيرة: ملك - رجل + امرأة ≈ ملكة.",
      },
      {
        id: "c4t3",
        title_fr: "Transformers et attention",
        title_ar: "المحولات وآلية الانتباه",
        content_fr:
          "Le mécanisme d'attention permet au modèle de pondérer l'importance de chaque mot par rapport aux autres. Les Transformers (2017) sont à la base de BERT, GPT, T5, et toute l'IA générative moderne.",
        content_ar:
          "تتيح آلية الانتباه للنموذج ترجيح أهمية كل كلمة مقارنة بالكلمات الأخرى. المحولات (2017) هي أساس BERT و GPT و T5 وكل الذكاء الاصطناعي التوليدي الحديث.",
      },
      {
        id: "c4t4",
        title_fr: "Applications : chatbots, traduction",
        title_ar: "التطبيقات: شات بوت، ترجمة",
        content_fr:
          "Cas d'usage : chatbots support client, traduction automatique, résumé automatique, analyse de sentiment, génération de code, assistants académiques.",
        content_ar:
          "حالات الاستخدام: روبوتات دعم العملاء، الترجمة الآلية، التلخيص، تحليل المشاعر، توليد الكود، المساعدون الأكاديميون.",
      },
    ],
    exercises: [
      {
        id: "c4e1",
        type: "practical",
        title_fr: "Python NLTK : Tokenization FR + AR",
        title_ar: "Python NLTK: ترميز نص بالفرنسية والعربية",
        description_fr: "Tokenisez un texte en français et un texte en arabe.",
        description_ar: "رمّز نصًا بالفرنسية وآخر بالعربية.",
        instructions_fr: "Utilisez nltk.word_tokenize. Comparez les résultats sur les deux langues.",
        instructions_ar: "استخدم nltk.word_tokenize. قارن النتائج بين اللغتين.",
        starterCode: `import nltk
nltk.download('punkt')
from nltk.tokenize import word_tokenize

texte_fr = "L'intelligence artificielle transforme le monde."
texte_ar = "الذكاء الاصطناعي يغيّر العالم."
print(word_tokenize(texte_fr))
print(word_tokenize(texte_ar))`,
      },
      {
        id: "c4e2",
        type: "practical",
        title_fr: "Sentiment Analysis : Analyser des tweets",
        title_ar: "تحليل المشاعر: تحليل التغريدات",
        description_fr: "Classez des tweets en positif/négatif/neutre.",
        description_ar: "صنّف التغريدات إلى إيجابية/سلبية/محايدة.",
        instructions_fr:
          "Utilisez TextBlob ou un modèle HuggingFace pré-entraîné. Évaluez sur 50 tweets de votre choix.",
        instructions_ar:
          "استخدم TextBlob أو نموذجًا مُدرّبًا مسبقًا من HuggingFace. قيّم على 50 تغريدة من اختيارك.",
      },
      {
        id: "c4e3",
        type: "practical",
        title_fr: "API : Chatbot simple avec OpenAI",
        title_ar: "API: شات بوت بسيط مع OpenAI",
        description_fr: "Créez un chatbot console qui interroge l'API OpenAI.",
        description_ar: "أنشئ شات بوت في الطرفية يستعلم من واجهة OpenAI.",
        instructions_fr: "Installez openai, gérez une boucle de conversation et un historique.",
        instructions_ar: "ثبّت openai، أدر حلقة محادثة وسجل التاريخ.",
        starterCode: `from openai import OpenAI
client = OpenAI(api_key="VOTRE_CLE")
messages = [{"role":"system","content":"Tu es un assistant pédagogique."}]
while True:
    user = input("Vous: ")
    if not user: break
    messages.append({"role":"user","content":user})
    r = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    rep = r.choices[0].message.content
    print("Bot:", rep)
    messages.append({"role":"assistant","content":rep})`,
      },
      {
        id: "c4e4",
        type: "project",
        title_fr: "Projet final : Q&A académique bilingue",
        title_ar: "المشروع النهائي: أسئلة وأجوبة أكاديمية ثنائية اللغة",
        description_fr: "Système de questions/réponses académique en français et arabe.",
        description_ar: "نظام أسئلة وأجوبة أكاديمي بالفرنسية والعربية.",
        instructions_fr:
          "Constituez un mini corpus de cours, indexez-le (TF-IDF ou embeddings), créez une interface où l'utilisateur pose une question dans l'une des deux langues et reçoit une réponse pertinente.",
        instructions_ar:
          "أنشئ مدوّنة دروس صغيرة، فهرستها (TF-IDF أو تضمينات)، صمّم واجهة يطرح فيها المستخدم سؤالًا بإحدى اللغتين ويحصل على إجابة ملائمة.",
      },
    ],
  },
];
