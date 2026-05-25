export type Role = "professor" | "student";

export type Lang = "fr" | "ar";

export interface User {
  id: string;
  name: string;
  role: Role;
  specialty?: string;
  level?: string;
  createdAt: number;
}

export interface TheorySection {
  id: string;
  title_fr: string;
  title_ar: string;
  content_fr: string;
  content_ar: string;
}

export type ExerciseType = "quiz" | "practical" | "project" | "research";

export interface QuizQuestion {
  id: string;
  question_fr: string;
  question_ar: string;
  options_fr: string[];
  options_ar: string[];
  correctIndex: number;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  title_fr: string;
  title_ar: string;
  description_fr: string;
  description_ar: string;
  // for quiz
  questions?: QuizQuestion[];
  // for practical/project/research
  instructions_fr?: string;
  instructions_ar?: string;
  starterCode?: string;
  // workflow
  dueAt?: number; // optional deadline timestamp
  maxGrade?: number; // default 20
}

export interface Course {
  id: string;
  order: number;
  title_fr: string;
  title_ar: string;
  summary_fr: string;
  summary_ar: string;
  theory: TheorySection[];
  exercises: Exercise[];
  published: boolean; // prof can keep drafts
  publishedAt?: number;
  authorId?: string; // professor who created it
}

/** A submission lifecycle:
 *  draft  -> student saved but not submitted (rare, optional)
 *  submitted -> waiting for prof review
 *  needs_revision -> prof asked for corrections, student must resubmit
 *  validated -> prof approved
 *  rejected -> prof refused
 */
export type SubmissionStatus =
  | "submitted"
  | "needs_revision"
  | "validated"
  | "rejected";

export interface FeedbackMessage {
  id: string;
  fromId: string;     // user id
  fromName: string;
  fromRole: Role;
  text: string;
  at: number;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  exerciseId: string;
  content: string; // free text / code
  score?: number;  // quiz auto score 0-100
  quizAnswers?: number[]; // for quizzes
  grade?: number;  // prof grade out of maxGrade (default 20)
  feedback?: string; // final summary feedback
  status: SubmissionStatus;
  submittedAt: number;
  gradedAt?: number;
  attempt: number; // 1, 2, 3...
  thread: FeedbackMessage[]; // bidirectional discussion
}

export interface Notification {
  id: string;
  userId: string; // recipient
  type: "new_course" | "new_exercise" | "submission_received" | "feedback" | "validated" | "needs_revision" | "rejected";
  title_fr: string;
  title_ar: string;
  body_fr: string;
  body_ar: string;
  link?: { view: "course" | "submissions"; id?: string };
  read: boolean;
  at: number;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  courses: Course[];
  submissions: Submission[];
  notifications: Notification[];
  lang: Lang;
}
