import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, DIFFICULTY_OPTIONS, LANGUAGE_OPTIONS } from "@/types/types";

export default function NotesGeneratorScreen() {
  return (
    <GeneratorScreen
      type="notes"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Biology, Economics", required: true },
        { key: "topic", label: "Topic", placeholder: "e.g. Photosynthesis, Supply & Demand", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", options: GRADE_OPTIONS },
        { key: "depth", label: "Depth Level", placeholder: "Select depth", options: DIFFICULTY_OPTIONS },
        { key: "language", label: "Language", placeholder: "Select language", options: LANGUAGE_OPTIONS },
      ]}
    />
  );
}
