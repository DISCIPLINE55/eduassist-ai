/**
 * DocumentRenderer — type-specific, nicely-formatted content viewers for all 9 document types.
 * Falls back gracefully to a generic renderer if the AI returns unexpected structure.
 */
import { Text, View } from "react-native";

// ---- Primitives ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-bold uppercase tracking-widest text-primary mt-1 mb-2">
      {children}
    </Text>
  );
}

function Divider() {
  return <View className="h-px bg-border my-3" />;
}

function Bullet({ text }: { text: string }) {
  return (
    <View className="flex-row gap-2 mb-1">
      <Text className="text-primary text-sm mt-0.5">•</Text>
      <Text className="text-sm text-foreground flex-1 leading-6">{text}</Text>
    </View>
  );
}

function NumberedItem({ index, text }: { index: number; text: string }) {
  return (
    <View className="flex-row gap-2 mb-2">
      <View className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0 mt-0.5">
        <Text className="text-primary-foreground text-xs font-bold">{index}</Text>
      </View>
      <Text className="text-sm text-foreground flex-1 leading-6">{text}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row gap-2 mb-1.5 items-start flex-wrap">
      <Text className="text-xs font-semibold text-muted-foreground flex-shrink-0 mt-0.5" style={{ minWidth: 72, maxWidth: 112 }}>
        {label}
      </Text>
      <Text className="text-sm text-foreground flex-1" style={{ minWidth: 120 }}>{value}</Text>
    </View>
  );
}

function BodyText({ text }: { text: string }) {
  return <Text className="text-sm text-foreground leading-7">{text}</Text>;
}

// ---- Helper to stringify unknown value ----
function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

function asString(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return str(v);
}

// ---- Generic fallback ----
function GenericRenderer({ content }: { content: Record<string, unknown> }) {
  return (
    <View className="gap-3">
      {Object.entries(content).map(([key, value]) => {
        if (value === null || value === undefined || value === "") return null;
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        if (Array.isArray(value)) {
          return (
            <View key={key}>
              <SectionTitle>{label}</SectionTitle>
              {value.map((item, i) => (
                <Bullet key={i} text={str(item)} />
              ))}
            </View>
          );
        }
        if (typeof value === "object") {
          const sub = value as Record<string, unknown>;
          return (
            <View key={key}>
              <SectionTitle>{label}</SectionTitle>
              {Object.entries(sub).map(([sk, sv]) => (
                <InfoRow key={sk} label={sk.replace(/_/g, " ")} value={str(sv)} />
              ))}
            </View>
          );
        }
        return <InfoRow key={key} label={label} value={str(value)} />;
      })}
    </View>
  );
}

// ---- Phase banner: Introduction / Development / Closure ----
function PhaseBanner({ phase, duration }: { phase: string; duration?: string }) {
  return (
    <View className="flex-row items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 mb-2">
      <View className="w-2 h-2 rounded-full bg-primary" />
      <Text className="text-primary text-xs font-bold uppercase tracking-wider flex-1">{phase}</Text>
      {duration ? <Text className="text-muted-foreground text-xs">{duration}</Text> : null}
    </View>
  );
}

// ---- 1. Lesson Plan (handles both new flat format and legacy nested format) ----
function LessonPlanRenderer({ c }: { c: Record<string, unknown> }) {
  // New flat format uses introduction_activities[], introduction_duration, etc.
  // Legacy format uses introduction: {duration, activities} — handle both gracefully
  const introActivities = asArray(
    c.introduction_activities ??
    (typeof c.introduction === "object" && c.introduction !== null
      ? (c.introduction as Record<string, unknown>).activities
      : null)
  );
  const introDuration = asString(
    c.introduction_duration ??
    (typeof c.introduction === "object" && c.introduction !== null
      ? (c.introduction as Record<string, unknown>).duration
      : null) ??
    (typeof c.introduction === "string" ? "" : null)
  );
  const introNote = asString(c.introduction_teacher_note);

  const devActivities = asArray(c.development_activities ?? c.activities ?? c.lesson_activities ?? c.main_activities);
  const devDuration = asString(c.development_duration);
  const devNotes = asString(c.development_teacher_notes);

  const closureActivities = asArray(c.closure_activities ?? c.conclusion_activities);
  const closureDuration = asString(c.closure_duration);

  // Assessment: new flat format uses assessment_formative[] and assessment_summative string
  const assessFormative = asArray(
    c.assessment_formative ??
    (typeof c.assessment === "object" && c.assessment !== null
      ? (c.assessment as Record<string, unknown>).formative
      : null)
  );
  const assessSummative = asString(
    c.assessment_summative ??
    (typeof c.assessment === "object" && c.assessment !== null
      ? (c.assessment as Record<string, unknown>).summative
      : null) ??
    (typeof c.assessment === "string" ? c.assessment : "")
  );

  const reflectionQs = asArray(
    c.reflection_questions ??
    (typeof c.reflection === "object" && c.reflection !== null
      ? (c.reflection as Record<string, unknown>).questions
      : null)
  );

  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}

      {/* Meta grid */}
      <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Duration" value={asString(c.duration)} />
        <InfoRow label="Curriculum" value={asString(c.curriculum)} />
        <InfoRow label="Strand" value={asString(c.strand)} />
        <InfoRow label="Sub-Strand" value={asString(c.sub_strand)} />
      </View>

      {/* Objectives */}
      {(c.learning_objectives || c.objectives) ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.learning_objectives ?? c.objectives).map((o, i) => (
            <Bullet key={i} text={str(o)} />
          ))}
        </>
      ) : null}

      {/* Prior knowledge */}
      {c.prior_knowledge ? (
        <>
          <Divider />
          <SectionTitle>Prior Knowledge</SectionTitle>
          {asArray(c.prior_knowledge).map((p, i) => <Bullet key={i} text={str(p)} />)}
        </>
      ) : null}

      {/* Key vocabulary */}
      {c.key_vocabulary ? (
        <>
          <Divider />
          <SectionTitle>Key Vocabulary</SectionTitle>
          {asArray(c.key_vocabulary).map((v, i) => <Bullet key={i} text={str(v)} />)}
        </>
      ) : null}

      {/* Materials */}
      {(c.materials || c.resources) ? (
        <>
          <Divider />
          <SectionTitle>Materials & Resources</SectionTitle>
          {asArray(c.materials ?? c.resources).map((m, i) => <Bullet key={i} text={str(m)} />)}
        </>
      ) : null}

      {/* Introduction */}
      {(introActivities.length > 0 || (typeof c.introduction === "string" && c.introduction)) ? (
        <>
          <Divider />
          <PhaseBanner phase="Introduction / Hook" duration={introDuration || undefined} />
          {introActivities.length > 0
            ? introActivities.map((a, i) => <NumberedItem key={i} index={i + 1} text={str(a)} />)
            : <BodyText text={str(c.introduction)} />}
          {introNote ? (
            <View className="mt-1 bg-accent/10 rounded-xl px-3 py-2">
              <Text className="text-xs text-muted-foreground italic">{introNote}</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {/* Development */}
      {devActivities.length > 0 ? (
        <>
          <Divider />
          <PhaseBanner phase="Development" duration={devDuration || undefined} />
          {devActivities.map((a, i) =>
            typeof a === "object" && a !== null ? (
              <View key={i} className="mb-2 bg-secondary rounded-xl p-3" style={{ borderCurve: "continuous" }}>
                {Object.entries(a as Record<string, unknown>).map(([k, v]) => (
                  <InfoRow key={k} label={k.replace(/_/g, " ")} value={str(v)} />
                ))}
              </View>
            ) : (
              <NumberedItem key={i} index={i + 1} text={str(a)} />
            )
          )}
          {devNotes ? (
            <View className="mt-1 bg-accent/10 rounded-xl px-3 py-2">
              <Text className="text-xs font-semibold text-muted-foreground mb-0.5">Teacher Notes</Text>
              <Text className="text-xs text-muted-foreground italic leading-5">{devNotes}</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {/* Teacher / Learner activities (legacy format) */}
      {c.teacher_activities ? (
        <>
          <Divider />
          <SectionTitle>Teacher Activities</SectionTitle>
          {asArray(c.teacher_activities).map((a, i) =>
            typeof a === "object" && a !== null ? (
              <View key={i} className="mb-2 bg-secondary rounded-xl p-3">
                {Object.entries(a as Record<string, unknown>).map(([k, v]) => (
                  <InfoRow key={k} label={k.replace(/_/g, " ")} value={str(v)} />
                ))}
              </View>
            ) : <NumberedItem key={i} index={i + 1} text={str(a)} />
          )}
        </>
      ) : null}
      {c.learner_activities ? (
        <>
          <Divider />
          <SectionTitle>Learner Activities</SectionTitle>
          {asArray(c.learner_activities).map((a, i) =>
            typeof a === "object" && a !== null ? (
              <View key={i} className="mb-2 bg-secondary rounded-xl p-3">
                {Object.entries(a as Record<string, unknown>).map(([k, v]) => (
                  <InfoRow key={k} label={k.replace(/_/g, " ")} value={str(v)} />
                ))}
              </View>
            ) : <NumberedItem key={i} index={i + 1} text={str(a)} />
          )}
        </>
      ) : null}

      {/* Closure */}
      {closureActivities.length > 0 ? (
        <>
          <Divider />
          <PhaseBanner phase="Closure / Wrap-Up" duration={closureDuration || undefined} />
          {closureActivities.map((a, i) => <NumberedItem key={i} index={i + 1} text={str(a)} />)}
        </>
      ) : null}

      {/* Differentiation */}
      {(c.differentiation_support || c.differentiation_extension) ? (
        <>
          <Divider />
          <SectionTitle>Differentiation</SectionTitle>
          {c.differentiation_support ? (
            <View className="mb-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl px-3 py-2">
              <Text className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">Support</Text>
              <Text className="text-sm text-foreground leading-5">{str(c.differentiation_support)}</Text>
            </View>
          ) : null}
          {c.differentiation_extension ? (
            <View className="bg-green-50 dark:bg-green-950/20 rounded-xl px-3 py-2">
              <Text className="text-xs font-bold text-green-700 dark:text-green-300 mb-0.5">Extension</Text>
              <Text className="text-sm text-foreground leading-5">{str(c.differentiation_extension)}</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {/* Assessment */}
      {(assessFormative.length > 0 || assessSummative) ? (
        <>
          <Divider />
          <SectionTitle>Assessment</SectionTitle>
          {assessFormative.length > 0 ? (
            <View className="mb-2">
              <Text className="text-xs font-bold text-muted-foreground mb-1">Formative</Text>
              {assessFormative.map((a, i) => <Bullet key={i} text={str(a)} />)}
            </View>
          ) : null}
          {assessSummative ? (
            <View>
              <Text className="text-xs font-bold text-muted-foreground mb-1">Summative</Text>
              <BodyText text={assessSummative} />
            </View>
          ) : null}
        </>
      ) : null}

      {/* Homework */}
      {(c.homework || c.assignment) ? (
        <>
          <Divider />
          <SectionTitle>Homework / Assignment</SectionTitle>
          <BodyText text={str(c.homework ?? c.assignment)} />
        </>
      ) : null}

      {/* Reflection */}
      {reflectionQs.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Teacher Reflection</SectionTitle>
          {reflectionQs.map((q, i) => <Bullet key={i} text={str(q)} />)}
        </>
      ) : null}

      {/* References */}
      {c.references ? (
        <>
          <Divider />
          <SectionTitle>References</SectionTitle>
          {asArray(c.references).map((r, i) => <Bullet key={i} text={str(r)} />)}
        </>
      ) : null}
    </View>
  );
}

// ---- 2. Scheme of Learning ----
function SchemeOfLearningRenderer({ c }: { c: Record<string, unknown> }) {
  const weeks = asArray(c.weeks ?? c.scheme ?? c.units ?? c.topics);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <InfoRow label="Subject" value={asString(c.subject)} />
      <InfoRow label="Grade" value={asString(c.grade)} />
      <InfoRow label="Term" value={asString(c.term)} />
      <InfoRow label="Duration" value={asString(c.term_duration ?? c.duration)} />

      {weeks.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Weekly Breakdown</SectionTitle>
          {weeks.map((w, i) => {
            if (typeof w === "object" && w !== null) {
              const week = w as Record<string, unknown>;
              return (
                <View key={i} className="mb-3 border border-border rounded-xl overflow-hidden">
                  <View className="bg-primary px-4 py-2">
                    <Text className="text-primary-foreground text-xs font-bold">
                      {str(week.week ?? week.week_number ?? `Week ${i + 1}`)}
                    </Text>
                  </View>
                  <View className="p-3 gap-1">
                    <InfoRow label="Topic" value={str(week.topic ?? week.title ?? "")} />
                    <InfoRow label="Objectives" value={str(week.objectives ?? week.learning_objectives ?? "")} />
                    <InfoRow label="Activities" value={str(week.activities ?? "")} />
                    <InfoRow label="Resources" value={str(week.resources ?? week.materials ?? "")} />
                    <InfoRow label="Assessment" value={str(week.assessment ?? "")} />
                  </View>
                </View>
              );
            }
            return <NumberedItem key={i} index={i + 1} text={str(w)} />;
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}
    </View>
  );
}

// ---- 3. Teaching Notes ----
function NotesRenderer({ c }: { c: Record<string, unknown> }) {
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-2">{str(c.title)}</Text> : null}
      <InfoRow label="Subject" value={asString(c.subject)} />
      <InfoRow label="Topic" value={asString(c.topic)} />

      {c.introduction || c.overview ? (
        <>
          <Divider />
          <SectionTitle>Introduction</SectionTitle>
          <BodyText text={str(c.introduction ?? c.overview)} />
        </>
      ) : null}

      {c.key_concepts || c.concepts ? (
        <>
          <Divider />
          <SectionTitle>Key Concepts</SectionTitle>
          {asArray(c.key_concepts ?? c.concepts).map((item, i) => {
            if (typeof item === "object" && item !== null) {
              const concept = item as Record<string, unknown>;
              return (
                <View key={i} className="mb-2 bg-secondary rounded-xl p-3">
                  <Text className="text-sm font-semibold text-foreground mb-1">{str(concept.concept ?? concept.term ?? concept.name ?? `Concept ${i + 1}`)}</Text>
                  {concept.definition || concept.description ? (
                    <Text className="text-sm text-muted-foreground">{str(concept.definition ?? concept.description)}</Text>
                  ) : null}
                  {concept.example ? <InfoRow label="Example" value={str(concept.example)} /> : null}
                </View>
              );
            }
            return <Bullet key={i} text={str(item)} />;
          })}
        </>
      ) : null}

      {c.examples ? (
        <>
          <Divider />
          <SectionTitle>Examples</SectionTitle>
          {asArray(c.examples).map((e, i) => <Bullet key={i} text={str(e)} />)}
        </>
      ) : null}

      {c.summary || c.conclusion ? (
        <>
          <Divider />
          <SectionTitle>Summary</SectionTitle>
          <BodyText text={str(c.summary ?? c.conclusion)} />
        </>
      ) : null}

      {c.further_reading || c.references ? (
        <>
          <Divider />
          <SectionTitle>Further Reading</SectionTitle>
          {asArray(c.further_reading ?? c.references).map((r, i) => <Bullet key={i} text={str(r)} />)}
        </>
      ) : null}
    </View>
  );
}

// ---- 4. Quiz (handles both new flat questions[] and legacy sections[] format) ----
function QuizRenderer({ c }: { c: Record<string, unknown> }) {
  // New format: c.questions[] flat array
  // Legacy format: c.sections[].questions[]
  const flatQuestions = asArray(c.questions ?? c.items ?? c.quiz_questions);
  const sections = asArray(c.sections);

  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Topic" value={asString(c.topic)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Total Marks" value={asString(c.total_marks)} />
        <InfoRow label="Duration" value={asString(c.duration)} />
      </View>

      {c.instructions ? (
        <>
          <Divider />
          <SectionTitle>Instructions</SectionTitle>
          <BodyText text={str(c.instructions)} />
        </>
      ) : null}

      {/* New flat format */}
      {flatQuestions.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Questions ({flatQuestions.length})</SectionTitle>
          {flatQuestions.map((q, i) => {
            if (typeof q !== "object" || q === null) return <NumberedItem key={i} index={i + 1} text={str(q)} />;
            const question = q as Record<string, unknown>;
            const opts = asArray(question.options ?? question.choices);
            const correctAns = str(question.correct_answer ?? question.answer ?? "");
            return (
              <View key={i} className="mb-4 border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
                <View className="bg-primary/10 px-4 py-2 flex-row items-start gap-2">
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0 mt-0.5">
                    <Text className="text-primary-foreground text-xs font-bold">{str(question.number ?? i + 1)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground flex-1 leading-6">
                      {str(question.question ?? question.text ?? "")}
                    </Text>
                    {question.type ? (
                      <Text className="text-xs text-muted-foreground mt-0.5">{str(question.type).replace(/_/g, " ")}</Text>
                    ) : null}
                  </View>
                  {question.marks ? (
                    <View className="bg-primary/20 rounded-full px-2 py-0.5">
                      <Text className="text-primary text-xs font-bold">{str(question.marks)} mk</Text>
                    </View>
                  ) : null}
                </View>
                {opts.length > 0 ? (
                  <View className="px-4 py-3 gap-2">
                    {opts.map((opt, oi) => {
                      const optStr = str(opt);
                      const letter = optStr.startsWith("A.") || optStr.startsWith("B.") || optStr.startsWith("C.") || optStr.startsWith("D.")
                        ? optStr[0] : String.fromCharCode(65 + oi);
                      const isCorrect = correctAns === letter || correctAns === optStr || correctAns === String.fromCharCode(65 + oi);
                      return (
                        <View key={oi} className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-secondary"}`}>
                          <View className={`w-5 h-5 rounded-full items-center justify-center ${isCorrect ? "bg-green-500" : "bg-muted"}`}>
                            <Text className={`text-xs font-bold ${isCorrect ? "text-white" : "text-muted-foreground"}`}>
                              {String.fromCharCode(65 + oi)}
                            </Text>
                          </View>
                          <Text className={`text-sm flex-1 ${isCorrect ? "font-semibold text-green-800 dark:text-green-200" : "text-foreground"}`}>
                            {optStr.replace(/^[A-D]\.\s*/, "")}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : correctAns ? (
                  <View className="px-4 py-2 bg-green-50 dark:bg-green-900/20">
                    <Text className="text-xs font-bold text-green-700 dark:text-green-300">Answer: {correctAns}</Text>
                  </View>
                ) : null}
                {question.explanation || question.marking_notes ? (
                  <View className="px-4 pb-3 border-t border-border pt-2">
                    <Text className="text-xs font-semibold text-muted-foreground mb-1">
                      {question.marking_notes ? "Marking Notes" : "Explanation"}
                    </Text>
                    <Text className="text-xs text-muted-foreground leading-5">
                      {str(question.explanation ?? question.marking_notes)}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : sections.length > 0 ? (
        /* Legacy sections format */
        <>
          <Divider />
          {sections.map((sec, si) => {
            if (typeof sec !== "object" || sec === null) return null;
            const section = sec as Record<string, unknown>;
            const sqs = asArray(section.questions);
            return (
              <View key={si} className="mb-4">
                <SectionTitle>{str(section.title ?? section.type ?? `Section ${si + 1}`)}</SectionTitle>
                {section.instructions ? <BodyText text={str(section.instructions)} /> : null}
                {sqs.map((q, qi) => {
                  if (typeof q !== "object" || q === null) return <NumberedItem key={qi} index={qi + 1} text={str(q)} />;
                  const question = q as Record<string, unknown>;
                  const opts = asArray(question.options ?? question.choices);
                  return (
                    <View key={qi} className="mb-3 border border-border rounded-xl overflow-hidden">
                      <View className="bg-primary/10 px-4 py-2 flex-row gap-2">
                        <Text className="text-sm font-bold text-primary">{str(question.number ?? qi + 1)}.</Text>
                        <Text className="text-sm text-foreground flex-1 leading-6">{str(question.question ?? question.text ?? "")}</Text>
                      </View>
                      {opts.length > 0 ? (
                        <View className="px-4 py-2 gap-1">
                          {opts.map((o, oi) => <Bullet key={oi} text={str(o)} />)}
                        </View>
                      ) : null}
                      {question.answer || question.correct_answer ? (
                        <View className="px-4 pb-2">
                          <Text className="text-xs font-bold text-green-700">Answer: {str(question.answer ?? question.correct_answer)}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      ) : null}

      {c.answer_key ? (
        <>
          <Divider />
          <SectionTitle>Answer Key</SectionTitle>
          <BodyText text={str(c.answer_key)} />
        </>
      ) : null}
      {c.marking_guide ? (
        <>
          <Divider />
          <SectionTitle>Marking Guide</SectionTitle>
          <BodyText text={str(c.marking_guide)} />
        </>
      ) : null}
    </View>
  );
}

// ---- 5. Examination ----
function ExaminationRenderer({ c }: { c: Record<string, unknown> }) {
  const sections = asArray(c.sections ?? c.parts ?? c.examination_sections);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="flex-row flex-wrap gap-x-4">
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Duration" value={asString(c.duration)} />
        <InfoRow label="Total Marks" value={asString(c.total_marks ?? c.marks)} />
      </View>

      {c.instructions ? (
        <>
          <Divider />
          <SectionTitle>Instructions to Candidates</SectionTitle>
          {asArray(c.instructions).map((inst, i) => <Bullet key={i} text={str(inst)} />)}
        </>
      ) : null}

      {sections.length > 0 ? (
        <>
          <Divider />
          {sections.map((section, si) => {
            if (typeof section !== "object" || section === null) return null;
            const sec = section as Record<string, unknown>;
            const questions = asArray(sec.questions ?? sec.items);
            return (
              <View key={si} className="mb-4">
                <View className="bg-primary rounded-xl px-4 py-2.5 mb-3">
                  <Text className="text-primary-foreground font-bold text-sm">
                    {str(sec.section ?? sec.title ?? sec.name ?? `Section ${si + 1}`)}
                    {sec.marks ? `  [${str(sec.marks)} marks]` : ""}
                  </Text>
                  {sec.instructions ? (
                    <Text className="text-primary-foreground/70 text-xs mt-0.5">{str(sec.instructions)}</Text>
                  ) : null}
                </View>
                {questions.map((q, qi) => {
                  if (typeof q === "object" && q !== null) {
                    const qObj = q as Record<string, unknown>;
                    return (
                      <View key={qi} className="mb-3 pl-2 border-l-2 border-primary/30">
                        <View className="flex-row gap-2">
                          <Text className="text-primary font-bold text-sm">{qi + 1}.</Text>
                          <Text className="text-sm text-foreground flex-1 leading-6">
                            {str(qObj.question ?? qObj.text ?? qObj.q ?? "")}
                            {qObj.marks ? `  [${str(qObj.marks)} marks]` : ""}
                          </Text>
                        </View>
                        {asArray(qObj.options ?? qObj.choices).map((opt, oi) => (
                          <Text key={oi} className="text-sm text-muted-foreground ml-6 mt-0.5">
                            {String.fromCharCode(65 + oi)}. {str(opt)}
                          </Text>
                        ))}
                      </View>
                    );
                  }
                  return <NumberedItem key={qi} index={qi + 1} text={str(q)} />;
                })}
              </View>
            );
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}
    </View>
  );
}

// ---- 6. Assignment ----
function AssignmentRenderer({ c }: { c: Record<string, unknown> }) {
  const tasks = asArray(c.tasks ?? c.questions ?? c.items);
  const evalCriteria = asArray(c.evaluation_criteria ?? c.rubric_criteria);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Topic" value={asString(c.topic)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Type" value={asString(c.type ?? c.assignmentType)} />
        <InfoRow label="Due" value={asString(c.due_description ?? c.due_date ?? c.deadline)} />
        <InfoRow label="Total Marks" value={asString(c.total_marks ?? c.marks)} />
      </View>

      {c.objectives || c.learning_objectives ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.objectives ?? c.learning_objectives).map((o, i) => <Bullet key={i} text={str(o)} />)}
        </>
      ) : null}

      {c.background ? (
        <>
          <Divider />
          <SectionTitle>Background</SectionTitle>
          <BodyText text={str(c.background)} />
        </>
      ) : null}

      {c.instructions ? (
        <>
          <Divider />
          <SectionTitle>Instructions</SectionTitle>
          <BodyText text={str(c.instructions)} />
        </>
      ) : null}

      {tasks.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Tasks</SectionTitle>
          {tasks.map((task, i) => {
            if (typeof task === "object" && task !== null) {
              const t = task as Record<string, unknown>;
              return (
                <View key={i} className="mb-3 border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
                  <View className="bg-primary/10 px-4 py-2 flex-row items-center gap-2">
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0">
                      <Text className="text-primary-foreground text-xs font-bold">{str(t.number ?? i + 1)}</Text>
                    </View>
                    <Text className="text-sm font-bold text-foreground flex-1">{str(t.title ?? `Task ${i + 1}`)}</Text>
                    {t.marks ? (
                      <View className="bg-primary/20 rounded-full px-2 py-0.5">
                        <Text className="text-primary text-xs font-bold">{str(t.marks)} marks</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="px-4 py-3 gap-2">
                    {t.description ? <Text className="text-sm text-foreground leading-6">{str(t.description)}</Text> : null}
                    {asArray(t.requirements).length > 0 ? (
                      <>
                        <Text className="text-xs font-bold text-muted-foreground mt-1">Requirements</Text>
                        {asArray(t.requirements).map((r, ri) => <Bullet key={ri} text={str(r)} />)}
                      </>
                    ) : null}
                  </View>
                </View>
              );
            }
            return <NumberedItem key={i} index={i + 1} text={str(task)} />;
          })}
        </>
      ) : null}

      {(c.submission_requirements || c.submission_guidelines) ? (
        <>
          <Divider />
          <SectionTitle>Submission Requirements</SectionTitle>
          {asArray(c.submission_requirements ?? c.submission_guidelines).map((s, i) => <Bullet key={i} text={str(s)} />)}
        </>
      ) : null}

      {evalCriteria.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Evaluation Criteria</SectionTitle>
          {evalCriteria.map((ec, i) => {
            if (typeof ec === "object" && ec !== null) {
              const e = ec as Record<string, unknown>;
              return (
                <View key={i} className="flex-row gap-3 mb-2 items-start">
                  <View className="bg-primary/10 rounded-full px-2.5 py-1 flex-shrink-0">
                    <Text className="text-primary text-xs font-bold">{str(e.marks ?? "")} mk</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{str(e.criterion ?? e.name ?? "")}</Text>
                    {e.description ? <Text className="text-xs text-muted-foreground mt-0.5">{str(e.description)}</Text> : null}
                  </View>
                </View>
              );
            }
            return <Bullet key={i} text={str(ec)} />;
          })}
        </>
      ) : null}

      {(c.useful_resources ?? c.resources) ? (
        <>
          <Divider />
          <SectionTitle>Useful Resources</SectionTitle>
          {asArray(c.useful_resources ?? c.resources).map((r, i) => <Bullet key={i} text={str(r)} />)}
        </>
      ) : null}
    </View>
  );
}

// ---- 7. Rubric ----
function RubricRenderer({ c }: { c: Record<string, unknown> }) {
  const criteria = asArray(c.criteria ?? c.rubric_criteria ?? c.rows);
  const levels = asArray(c.performance_levels ?? c.levels ?? c.columns ?? c.headers);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Assessment Type" value={asString(c.assessment_type ?? c.type)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Total Marks" value={asString(c.total_marks ?? c.marks)} />
      </View>

      {levels.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Performance Levels</SectionTitle>
          <View className="flex-row gap-2 flex-wrap">
            {levels.map((lv, li) => (
              <View key={li} className="bg-primary/10 rounded-full px-3 py-1">
                <Text className="text-primary text-xs font-semibold">{str(lv)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {criteria.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Evaluation Criteria</SectionTitle>
          {criteria.map((crit, ci) => {
            if (typeof crit !== "object" || crit === null) return <Bullet key={ci} text={str(crit)} />;
            const critObj = crit as Record<string, unknown>;
            // descriptors can be array of {level, description} (new) or object (legacy)
            const descriptorArr = asArray(critObj.descriptors);
            const descriptorObj = !Array.isArray(critObj.descriptors) && typeof critObj.descriptors === "object" && critObj.descriptors !== null
              ? critObj.descriptors as Record<string, unknown>
              : null;
            return (
              <View key={ci} className="mb-3 border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
                <View className="bg-primary/10 px-4 py-2 flex-row items-center justify-between">
                  <Text className="text-primary font-bold text-sm flex-1">
                    {str(critObj.criterion ?? critObj.name ?? critObj.title ?? `Criterion ${ci + 1}`)}
                  </Text>
                  {(critObj.weight_marks || critObj.weight || critObj.marks) ? (
                    <View className="bg-primary/20 rounded-full px-2.5 py-0.5">
                      <Text className="text-primary text-xs font-bold">
                        {str(critObj.weight_marks ?? critObj.weight ?? critObj.marks)} marks
                      </Text>
                    </View>
                  ) : null}
                </View>
                {descriptorArr.length > 0 ? (
                  <View className="px-4 py-3 gap-2">
                    {descriptorArr.map((d, di) => {
                      if (typeof d === "object" && d !== null) {
                        const dObj = d as Record<string, unknown>;
                        return (
                          <View key={di} className="flex-row gap-2 items-start">
                            <View className="bg-muted rounded-md px-2 py-0.5 flex-shrink-0">
                              <Text className="text-xs font-semibold text-muted-foreground">{str(dObj.level ?? "")}</Text>
                            </View>
                            <Text className="text-xs text-foreground flex-1 leading-5">{str(dObj.description ?? "")}</Text>
                          </View>
                        );
                      }
                      return <Bullet key={di} text={str(d)} />;
                    })}
                  </View>
                ) : descriptorObj ? (
                  <View className="px-4 py-3 gap-2">
                    {Object.entries(descriptorObj).map(([lvl, desc]) => (
                      <View key={lvl} className="flex-row gap-2 items-start">
                        <View className="bg-muted rounded-md px-2 py-0.5 flex-shrink-0">
                          <Text className="text-xs font-semibold text-muted-foreground">{lvl}</Text>
                        </View>
                        <Text className="text-xs text-foreground flex-1 leading-5">{str(desc)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}

      {c.scoring_guide ? (
        <>
          <Divider />
          <SectionTitle>Scoring Guide</SectionTitle>
          <BodyText text={str(c.scoring_guide)} />
        </>
      ) : null}
      {c.grade_boundaries ? (
        <>
          <Divider />
          <SectionTitle>Grade Boundaries</SectionTitle>
          <BodyText text={str(c.grade_boundaries)} />
        </>
      ) : null}
    </View>
  );
}

// ---- 8. Report Comment ----
function ReportCommentRenderer({ c }: { c: Record<string, unknown> }) {
  // New flat format: full_comment, short_comment, strengths[], areas_for_improvement[]
  // Legacy format: comments object or comments[] array
  const hasFlatFormat = c.full_comment || c.academic_comment || c.strengths;
  const legacyComments = asArray(c.students ?? (Array.isArray(c.comments) ? c.comments : []));

  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}

      {hasFlatFormat ? (
        <>
          <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
            <InfoRow label="Student" value={asString(c.student_name ?? c.student)} />
            <InfoRow label="Subject" value={asString(c.subject)} />
            <InfoRow label="Performance" value={asString(c.performance_grade ?? c.performance ?? c.overall_grade)} />
          </View>

          {c.full_comment ? (
            <>
              <Divider />
              <SectionTitle>Full Report Comment</SectionTitle>
              <View className="bg-primary/5 rounded-2xl p-4 border-l-4 border-primary" style={{ borderCurve: "continuous" }}>
                <Text className="text-sm text-foreground leading-7 italic">{str(c.full_comment)}</Text>
              </View>
            </>
          ) : null}

          {c.short_comment ? (
            <>
              <Divider />
              <SectionTitle>Short Comment</SectionTitle>
              <View className="bg-secondary rounded-xl p-3 border-l-4 border-muted-foreground" style={{ borderCurve: "continuous" }}>
                <Text className="text-sm text-muted-foreground italic">{str(c.short_comment)}</Text>
              </View>
            </>
          ) : null}

          {c.academic_comment ? (
            <>
              <Divider />
              <SectionTitle>Academic Performance</SectionTitle>
              <BodyText text={str(c.academic_comment)} />
            </>
          ) : null}

          {asArray(c.strengths).length > 0 ? (
            <>
              <Divider />
              <SectionTitle>Strengths</SectionTitle>
              {asArray(c.strengths).map((s, i) => <Bullet key={i} text={str(s)} />)}
            </>
          ) : null}

          {asArray(c.areas_for_improvement).length > 0 ? (
            <>
              <Divider />
              <SectionTitle>Areas for Improvement</SectionTitle>
              {asArray(c.areas_for_improvement).map((a, i) => <Bullet key={i} text={str(a)} />)}
            </>
          ) : null}

          {c.behaviour_comment || c.behavior_comment ? (
            <>
              <Divider />
              <SectionTitle>Behaviour & Attitude</SectionTitle>
              <BodyText text={str(c.behaviour_comment ?? c.behavior_comment)} />
            </>
          ) : null}

          {c.attendance_comment ? (
            <>
              <Divider />
              <SectionTitle>Attendance</SectionTitle>
              <BodyText text={str(c.attendance_comment)} />
            </>
          ) : null}

          {c.recommendation ? (
            <>
              <Divider />
              <SectionTitle>Recommendation</SectionTitle>
              <View className="bg-green-50 dark:bg-green-950/20 rounded-xl px-3 py-2">
                <BodyText text={str(c.recommendation)} />
              </View>
            </>
          ) : null}
        </>
      ) : legacyComments.length > 0 ? (
        /* Batch / legacy comments array */
        <>
          <Divider />
          <SectionTitle>Student Comments ({legacyComments.length})</SectionTitle>
          {legacyComments.map((s, si) => {
            if (typeof s !== "object" || s === null) return <Bullet key={si} text={str(s)} />;
            const student = s as Record<string, unknown>;
            return (
              <View key={si} className="mb-3 border border-border rounded-xl overflow-hidden">
                <View className="bg-primary/10 px-4 py-2 flex-row items-center justify-between">
                  <Text className="text-primary font-bold text-sm">
                    {str(student.student_name ?? student.name ?? `Student ${si + 1}`)}
                  </Text>
                  {student.performance ? (
                    <Text className="text-muted-foreground text-xs">{str(student.performance)}</Text>
                  ) : null}
                </View>
                <View className="px-4 py-3">
                  <Text className="text-sm text-foreground leading-6 italic">
                    {str(student.comment ?? student.report_comment ?? student.full_comment ?? "")}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      ) : (
        /* Legacy single comment object */
        (() => {
          const commObj = typeof c.comments === "object" && !Array.isArray(c.comments) && c.comments !== null
            ? c.comments as Record<string, unknown>
            : null;
          if (!commObj) return <GenericRenderer content={c} />;
          return (
            <>
              <View className="bg-secondary rounded-2xl p-3 gap-1">
                <InfoRow label="Student" value={asString(c.student_name ?? c.student)} />
                <InfoRow label="Subject" value={asString(c.subject)} />
                <InfoRow label="Grade" value={asString(c.overall_grade ?? c.performance_grade)} />
              </View>
              <Divider />
              {Object.entries(commObj).map(([k, v]) => (
                <View key={k} className="mb-2">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {k.replace(/_/g, " ")}
                  </Text>
                  <BodyText text={str(v)} />
                </View>
              ))}
            </>
          );
        })()
      )}
    </View>
  );
}

// ---- 9. Presentation (clean document outline view) ----
function PresentationRenderer({ c }: { c: Record<string, unknown> }) {
  const slides = asArray(c.slides ?? c.presentation_slides ?? c.outline);
  const assessmentSlide = typeof c.assessment_slide === "object" && c.assessment_slide !== null
    ? c.assessment_slide as Record<string, unknown>
    : null;
  const resources = asArray(c.additional_resources ?? c.resources);
  const allSlides = assessmentSlide ? [...slides, assessmentSlide] : slides;

  return (
    <View className="gap-2">
      {/* Header */}
      {c.title ? <Text className="text-2xl font-black text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="bg-secondary rounded-2xl p-3 gap-1" style={{ borderCurve: "continuous" }}>
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Duration" value={asString(c.total_duration ?? c.duration)} />
        <InfoRow label="Total Slides" value={asString(c.total_slides ?? allSlides.length)} />
      </View>

      {/* Overview */}
      {c.overview ? (
        <>
          <Divider />
          <SectionTitle>Overview</SectionTitle>
          <BodyText text={str(c.overview)} />
        </>
      ) : null}

      {/* Learning Objectives */}
      {(c.learning_objectives || c.objectives) ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.learning_objectives ?? c.objectives).map((o, i) => (
            <View key={i} className="flex-row gap-2 items-start mb-1">
              <View className="w-5 h-5 rounded-full bg-primary items-center justify-center flex-shrink-0 mt-0.5">
                <Text className="text-primary-foreground text-xs font-bold">{i + 1}</Text>
              </View>
              <Text className="text-sm text-foreground flex-1 leading-5">{str(o)}</Text>
            </View>
          ))}
        </>
      ) : null}

      {/* Slide outline — clean list, no clutter */}
      {allSlides.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Slide Outline ({allSlides.length} slides)</SectionTitle>
          <Text className="text-xs text-muted-foreground mb-2">Tap "Present" above to enter fullscreen presentation mode.</Text>
          {allSlides.map((slide, si) => {
            if (typeof slide !== "object" || slide === null) {
              return <NumberedItem key={si} index={si + 1} text={str(slide)} />;
            }
            const s = slide as Record<string, unknown>;
            const bullets = asArray(s.bullet_points ?? s.content ?? s.bullets ?? s.points ?? s.key_points ?? s.recap_questions);
            const slideTitle = str(s.title ?? s.slide_title ?? s.heading ?? `Slide ${si + 1}`);
            const slideType = str(s.type ?? s.slide_type ?? "Content");

            return (
              <View key={si} className="mb-3 border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
                {/* Slide row header */}
                <View className="flex-row items-center gap-3 px-4 py-3 bg-secondary">
                  <View className="w-7 h-7 rounded-full bg-primary items-center justify-center flex-shrink-0">
                    <Text className="text-primary-foreground text-xs font-black">{str(s.number ?? si + 1)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground leading-5">{slideTitle}</Text>
                    <Text className="text-xs text-muted-foreground">{slideType}</Text>
                  </View>
                </View>
                {/* Content bullets (concise) */}
                {bullets.length > 0 ? (
                  <View className="px-4 py-2 gap-1">
                    {bullets.slice(0, 4).map((b, bi) => (
                      <View key={bi} className="flex-row gap-2 items-start">
                        <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <Text className="text-xs text-foreground flex-1 leading-4">{str(b)}</Text>
                      </View>
                    ))}
                    {bullets.length > 4 ? (
                      <Text className="text-xs text-muted-foreground ml-3.5">+{bullets.length - 4} more points</Text>
                    ) : null}
                  </View>
                ) : null}
                {/* Exit ticket (summary slide) */}
                {s.exit_ticket ? (
                  <View className="px-4 pb-2">
                    <Text className="text-xs text-muted-foreground italic">{str(s.exit_ticket)}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}

      {/* Additional resources */}
      {resources.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Additional Resources</SectionTitle>
          {resources.map((r, i) => {
            if (typeof r !== "object" || r === null) return <Bullet key={i} text={str(r)} />;
            const res = r as Record<string, unknown>;
            const isYT = str(res.type).toLowerCase().includes("youtube");
            return (
              <View key={i} className="mb-2 bg-secondary rounded-xl px-3 py-2" style={{ borderCurve: "continuous" }}>
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text className="text-sm">{isYT ? "📺" : "🔗"}</Text>
                  <Text className="text-xs font-bold text-foreground">{str(res.type ?? "Resource")}</Text>
                </View>
                {res.search_query ? (
                  <Text className="text-xs text-muted-foreground">Search: "{str(res.search_query)}"</Text>
                ) : null}
                {res.url ? <Text className="text-xs text-muted-foreground">{str(res.url)}</Text> : null}
                {res.description ? (
                  <Text className="text-xs text-muted-foreground mt-0.5">{str(res.description)}</Text>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

// ---- Main export ----
export function DocumentRenderer({
  type,
  content,
}: {
  type: string;
  content: Record<string, unknown>;
}) {
  const c = content ?? {};
  switch (type) {
    case "lesson_plan": return <LessonPlanRenderer c={c} />;
    case "scheme_of_learning": return <SchemeOfLearningRenderer c={c} />;
    case "notes": return <NotesRenderer c={c} />;
    case "quiz": return <QuizRenderer c={c} />;
    case "examination": return <ExaminationRenderer c={c} />;
    case "assignment": return <AssignmentRenderer c={c} />;
    case "rubric": return <RubricRenderer c={c} />;
    case "report_comment": return <ReportCommentRenderer c={c} />;
    case "presentation": return <PresentationRenderer c={c} />;
    default: return <GenericRenderer content={c} />;
  }
}

// ---- Plain-text export formatter ----
export function formatDocumentAsText(title: string, type: string, content: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`============================`);
  lines.push(title.toUpperCase());
  lines.push(`============================`);

  function walk(obj: unknown, indent = 0): void {
    if (obj === null || obj === undefined || obj === "") return;
    const pad = "  ".repeat(indent);
    if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
      lines.push(`${pad}${String(obj)}`);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        if (typeof item === "string") {
          lines.push(`${pad}• ${item}`);
        } else if (typeof item === "object" && item !== null) {
          lines.push(`${pad}${i + 1}.`);
          walk(item, indent + 1);
        }
      });
    } else if (typeof obj === "object") {
      Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        const label = k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
          lines.push(`${pad}${label}: ${v}`);
        } else {
          lines.push(`${pad}--- ${label} ---`);
          walk(v, indent + 1);
        }
      });
    }
  }

  walk(content);
  lines.push(`\n---`);
  lines.push(`Generated by EduAssist AI`);
  return lines.join("\n");
}
