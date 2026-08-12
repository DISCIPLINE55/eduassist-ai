import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, DIFFICULTY_OPTIONS } from "@/types/types";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice only",
  "True/False only",
  "Short Answer only",
  "Mixed: MCQ + True/False",
  "Mixed: MCQ + Short Answer",
  "Mixed: MCQ + True/False + Short Answer",
  "Mixed: MCQ + Essay + Short Answer",
  "All types",
];

export default function QuizGeneratorScreen() {
  return (
    <GeneratorScreen
      type="quiz"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Chemistry, Geography", required: true },
        { key: "topic", label: "Topic", placeholder: "e.g. The Periodic Table, African Rivers", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", required: true, options: GRADE_OPTIONS },
        { key: "questionTypes", label: "Question Types", placeholder: "Select question types", options: QUESTION_TYPE_OPTIONS },
        { key: "numQuestions", label: "Number of Questions", placeholder: "Select count", options: ["5", "10", "15", "20", "25", "30"] },
        { key: "difficulty", label: "Difficulty Level", placeholder: "Select difficulty", options: DIFFICULTY_OPTIONS },
      ]}
    />
  );
}
