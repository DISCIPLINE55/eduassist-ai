import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS } from "@/types/types";

const ASSESSMENT_TYPES = [
  "Essay",
  "Presentation",
  "Research Report",
  "Project",
  "Portfolio",
  "Lab Report",
  "Performance Task",
  "Group Work",
  "Oral Examination",
];

const PERFORMANCE_LEVELS = [
  "4 levels: Excellent / Good / Satisfactory / Needs Improvement",
  "5 levels: Outstanding / Proficient / Developing / Beginning / Not Yet",
  "3 levels: Above Standard / At Standard / Below Standard",
  "Custom (AI will create descriptive levels)",
];

export default function RubricBuilderScreen() {
  return (
    <GeneratorScreen
      type="rubric"
      fields={[
        { key: "assessmentType", label: "Assessment Type", placeholder: "Select assessment type", required: true, options: ASSESSMENT_TYPES },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", options: GRADE_OPTIONS },
        { key: "criteria", label: "Evaluation Criteria", placeholder: "e.g. Content, Organization, Language, Presentation", required: true, multiline: true },
        { key: "levels", label: "Performance Levels", placeholder: "Select levels", options: PERFORMANCE_LEVELS },
      ]}
    />
  );
}
