import { GeneratorScreen } from "@/components/GeneratorScreen";
import { GRADE_OPTIONS, CURRICULUM_OPTIONS, LANGUAGE_OPTIONS } from "@/types/types";

export default function PresentationGeneratorScreen() {
  return (
    <GeneratorScreen
      type="presentation"
      fields={[
        { key: "subject", label: "Subject", placeholder: "e.g. Biology, ICT, History, Mathematics", required: true },
        { key: "topic", label: "Topic / Title", placeholder: "e.g. Introduction to Robotics and AI", required: true },
        { key: "grade", label: "Grade / Class", placeholder: "Select grade level", options: GRADE_OPTIONS, required: true },
        { key: "duration", label: "Presentation Duration", placeholder: "Select duration", options: ["15 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes"] },
        { key: "numSlides", label: "Number of Slides", placeholder: "Select slide count", options: ["5", "8", "10", "12", "15", "20", "25"] },
        { key: "audience", label: "Audience", placeholder: "Select audience type", options: ["Primary school students", "Junior High students", "Senior High students", "University students", "TVET students", "Adult learners", "Teachers / Staff"] },
        { key: "visualStyle", label: "Visual Style", placeholder: "Select presentation style", options: ["Modern & colourful", "Clean & minimal", "Diagram-heavy", "Story-based narrative", "Data & charts focused", "Interactive & activity-based"] },
        { key: "curriculum", label: "Curriculum Standard", placeholder: "Select curriculum", options: CURRICULUM_OPTIONS },
        { key: "keyPoints", label: "Key Concepts to Cover (optional)", placeholder: "List the main ideas, e.g. sensors, actuators, programming basics", multiline: true },
        { key: "language", label: "Language", placeholder: "Select language", options: LANGUAGE_OPTIONS },
      ]}
    />
  );
}
