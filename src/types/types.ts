export type DocumentType =
  | "lesson_plan"
  | "scheme_of_learning"
  | "notes"
  | "quiz"
  | "examination"
  | "assignment"
  | "rubric"
  | "report_comment"
  | "presentation";

export type DocumentStatus = "draft" | "complete" | "archived";

export interface Document {
  id: string;
  user_id: string;
  type: DocumentType;
  title: string;
  content: Record<string, unknown>;
  inputs: Record<string, string>;
  status: DocumentStatus;
  is_favorite: boolean;
  tags: string[];
  subject?: string;
  grade?: string;
  topic?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  default_subject?: string;
  default_grade?: string;
  default_curriculum?: string;
  default_language: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsage {
  id: string;
  user_id: string;
  document_type: string;
  tokens_used: number;
  created_at: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  lesson_plan: "Lesson Plan",
  scheme_of_learning: "Scheme of Learning",
  notes: "Teaching Notes",
  quiz: "Quiz",
  examination: "Examination",
  assignment: "Assignment",
  rubric: "Rubric",
  report_comment: "Report Comment",
  presentation: "Presentation",
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  lesson_plan: "BookOpen",
  scheme_of_learning: "CalendarRange",
  notes: "FileText",
  quiz: "CircleHelp",
  examination: "ClipboardList",
  assignment: "ClipboardCheck",
  rubric: "LayoutGrid",
  report_comment: "MessageSquare",
  presentation: "Presentation",
};

export const GRADE_OPTIONS = [
  "Pre-K / Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "TVET Level 1",
  "TVET Level 2",
  "TVET Level 3",
  "Year 1 (University)",
  "Year 2 (University)",
  "Year 3 (University)",
  "Year 4 (University)",
  "Postgraduate",
];

export const DIFFICULTY_OPTIONS = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];

export const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "Spanish",
  "Arabic",
  "Swahili",
  "Portuguese",
  "Chinese",
  "Hindi",
];

export const CURRICULUM_OPTIONS = [
  "Cambridge International",
  "IB (International Baccalaureate)",
  "Common Core (USA)",
  "National Curriculum (UK)",
  "Australian Curriculum",
  "CBC (Kenya)",
  "CAPS (South Africa)",
  "WAEC/NECO (Nigeria)",
  "BECE/WASSCE (Ghana)",
  "Local/National Curriculum",
  "Custom Curriculum",
];

export const METHODOLOGY_OPTIONS = [
  "Direct Instruction",
  "Inquiry-Based Learning",
  "Cooperative Learning",
  "Project-Based Learning",
  "Flipped Classroom",
  "Differentiated Instruction",
  "Socratic Method",
  "Experiential Learning",
  "Blended Learning",
  "Play-Based Learning",
];
