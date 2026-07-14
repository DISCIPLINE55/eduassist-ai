import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, LANGUAGE_OPTIONS } from "@/types/types";

export default function PresentationGeneratorScreen() {
  return (
    <GeneratorScreen
      type="presentation"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Biology, History", required: true },
        { key: "topic", label: "Topic / Title", placeholder: "e.g. The Human Digestive System", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", options: GRADE_OPTIONS },
        { key: "duration", label: "Presentation Duration", placeholder: "Select duration", options: ["10 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes"] },
        { key: "numSlides", label: "Number of Slides", placeholder: "Select slide count", options: ["5", "8", "10", "12", "15", "20"] },
        { key: "keyPoints", label: "Key Points to Cover (optional)", placeholder: "List the main concepts you want included", multiline: true },
        { key: "language", label: "Language", placeholder: "Select language", options: LANGUAGE_OPTIONS },
      ]}
    />
  );
}
