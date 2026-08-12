import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS } from "@/types/types";

const ASSIGNMENT_TYPES = [
  "Homework",
  "Research Task",
  "Project",
  "Practical Exercise",
  "Group Activity",
  "Case Study",
  "Essay",
  "Portfolio",
];

export default function AssignmentGeneratorScreen() {
  return (
    <GeneratorScreen
      type="assignment"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. History, Computer Science", required: true },
        { key: "topic", label: "Topic", placeholder: "e.g. World War II, Data Structures", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", required: true, options: GRADE_OPTIONS },
        { key: "assignmentType", label: "Assignment Type", placeholder: "Select type", options: ASSIGNMENT_TYPES },
        { key: "duration", label: "Completion Time", placeholder: "Select duration", options: ["1 day", "3 days", "1 week", "2 weeks", "1 month"] },
        { key: "objectives", label: "Learning Objectives (optional)", placeholder: "What should students achieve?", multiline: true },
      ]}
    />
  );
}
