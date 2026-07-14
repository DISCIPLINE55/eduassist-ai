import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, DIFFICULTY_OPTIONS, LANGUAGE_OPTIONS, CURRICULUM_OPTIONS, METHODOLOGY_OPTIONS } from "@/types/types";

export default function LessonPlannerScreen() {
  return (
    <GeneratorScreen
      type="lesson_plan"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Mathematics, Science, History", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", required: true, options: GRADE_OPTIONS },
        { key: "topic", label: "Topic", placeholder: "e.g. Fractions and Decimals", required: true },
        { key: "duration", label: "Lesson Duration", placeholder: "e.g. 60 minutes", options: ["30 minutes", "45 minutes", "60 minutes", "80 minutes", "90 minutes", "120 minutes"] },
        { key: "objectives", label: "Learning Objectives (optional)", placeholder: "e.g. Students will be able to...", multiline: true },
        { key: "curriculum", label: "Curriculum Standard", placeholder: "Select curriculum", options: CURRICULUM_OPTIONS },
        { key: "methodology", label: "Teaching Methodology", placeholder: "Select methodology", options: METHODOLOGY_OPTIONS },
        { key: "difficulty", label: "Difficulty Level", placeholder: "Select difficulty", options: DIFFICULTY_OPTIONS },
        { key: "language", label: "Language", placeholder: "Select language", options: LANGUAGE_OPTIONS },
      ]}
    />
  );
}
