import { GeneratorScreen } from "@/components/GeneratorScreen";

const PERFORMANCE_OPTIONS = [
  "Excellent (A)",
  "Very Good (B+)",
  "Good (B)",
  "Average (C)",
  "Below Average (D)",
  "Needs Significant Improvement",
];

const ATTENDANCE_OPTIONS = [
  "Excellent attendance (95-100%)",
  "Good attendance (85-94%)",
  "Satisfactory attendance (75-84%)",
  "Poor attendance (below 75%)",
];

const BEHAVIOR_OPTIONS = [
  "Excellent – role model for peers",
  "Good – follows rules consistently",
  "Satisfactory – occasionally needs reminders",
  "Needs improvement – frequently disrupts class",
];

export default function ReportCommentScreen() {
  return (
    <GeneratorScreen
      type="report_comment"
      fields={[
        { key: "studentName", label: "Student Name", placeholder: "e.g. John Smith", required: true },
        { key: "subject", label: "Subject", placeholder: "e.g. Mathematics, English", required: true },
        { key: "performance", label: "Academic Performance", placeholder: "Select performance level", required: true, options: PERFORMANCE_OPTIONS },
        { key: "attendance", label: "Attendance", placeholder: "Select attendance level", options: ATTENDANCE_OPTIONS },
        { key: "behavior", label: "Behavior / Conduct", placeholder: "Select behavior", options: BEHAVIOR_OPTIONS },
        { key: "observations", label: "Teacher Observations", placeholder: "e.g. Shows great enthusiasm in group work, struggles with written tasks", multiline: true },
      ]}
    />
  );
}
