import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS } from "@/types/types";

export default function ExaminationGeneratorScreen() {
  return (
    <GeneratorScreen
      type="examination"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Mathematics, Literature", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", required: true, options: GRADE_OPTIONS },
        { key: "topics", label: "Topics to Cover", placeholder: "e.g. Algebra, Geometry, Statistics", required: true, multiline: true },
        { key: "duration", label: "Examination Duration", placeholder: "Select duration", options: ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"] },
        { key: "totalMarks", label: "Total Marks", placeholder: "Select total marks", options: ["50", "60", "80", "100", "120", "150", "200"] },
        {
          key: "bloomsDistribution",
          label: "Bloom's Taxonomy Distribution",
          placeholder: "Select distribution",
          options: [
            "Knowledge 30%, Comprehension 40%, Application 30%",
            "Knowledge 20%, Comprehension 30%, Application 30%, Analysis 20%",
            "Knowledge 15%, Comprehension 25%, Application 30%, Analysis 20%, Evaluation 10%",
            "Balanced across all 6 levels",
          ],
        },
      ]}
    />
  );
}
