import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, LANGUAGE_OPTIONS, CURRICULUM_OPTIONS } from "@/types/types";

export default function SchemeOfLearningScreen() {
  return (
    <GeneratorScreen
      type="scheme_of_learning"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. English Language, Physics", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", required: true, options: GRADE_OPTIONS },
        { key: "term", label: "Term", placeholder: "Select term", options: ["Term 1", "Term 2", "Term 3", "Semester 1", "Semester 2", "Full Year"] },
        { key: "termDuration", label: "Term Duration (weeks)", placeholder: "e.g. 12 weeks", options: ["8 weeks", "10 weeks", "12 weeks", "14 weeks", "16 weeks", "18 weeks"] },
        { key: "weeklyHours", label: "Weekly Teaching Hours", placeholder: "e.g. 5 hours", options: ["2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "8 hours", "10 hours"] },
        { key: "curriculum", label: "Curriculum Standard", placeholder: "Select curriculum", options: CURRICULUM_OPTIONS },
        { key: "language", label: "Language", placeholder: "Select language", options: LANGUAGE_OPTIONS },
      ]}
    />
  );
}
