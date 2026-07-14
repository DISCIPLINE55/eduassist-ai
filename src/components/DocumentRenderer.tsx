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
    <View className="flex-row gap-2 mb-1.5 items-start">
      <Text className="text-xs font-semibold text-muted-foreground w-28 flex-shrink-0 mt-0.5">
        {label}
      </Text>
      <Text className="text-sm text-foreground flex-1">{value}</Text>
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

// ---- 1. Lesson Plan ----
function LessonPlanRenderer({ c }: { c: Record<string, unknown> }) {
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mb-2">
        <InfoRow label="Subject" value={asString(c.subject)} />
        <InfoRow label="Grade" value={asString(c.grade)} />
        <InfoRow label="Duration" value={asString(c.duration)} />
        <InfoRow label="Curriculum" value={asString(c.curriculum)} />
      </View>

      {c.learning_objectives || c.objectives ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.learning_objectives ?? c.objectives).map((o, i) => (
            <Bullet key={i} text={str(o)} />
          ))}
        </>
      ) : null}

      {c.materials || c.resources ? (
        <>
          <Divider />
          <SectionTitle>Materials & Resources</SectionTitle>
          {asArray(c.materials ?? c.resources).map((m, i) => (
            <Bullet key={i} text={str(m)} />
          ))}
        </>
      ) : null}

      {c.introduction || c.hook ? (
        <>
          <Divider />
          <SectionTitle>Introduction / Hook</SectionTitle>
          <BodyText text={str(c.introduction ?? c.hook)} />
        </>
      ) : null}

      {c.activities || c.lesson_activities || c.main_activities ? (
        <>
          <Divider />
          <SectionTitle>Activities</SectionTitle>
          {asArray(c.activities ?? c.lesson_activities ?? c.main_activities).map((a, i) =>
            typeof a === "object" && a !== null ? (
              <View key={i} className="mb-3 bg-secondary rounded-xl p-3">
                {Object.entries(a as Record<string, unknown>).map(([k, v]) => (
                  <InfoRow key={k} label={k.replace(/_/g, " ")} value={str(v)} />
                ))}
              </View>
            ) : (
              <NumberedItem key={i} index={i + 1} text={str(a)} />
            )
          )}
        </>
      ) : null}

      {c.assessment || c.evaluation ? (
        <>
          <Divider />
          <SectionTitle>Assessment</SectionTitle>
          <BodyText text={str(c.assessment ?? c.evaluation)} />
        </>
      ) : null}

      {c.conclusion || c.closure ? (
        <>
          <Divider />
          <SectionTitle>Conclusion</SectionTitle>
          <BodyText text={str(c.conclusion ?? c.closure)} />
        </>
      ) : null}

      {c.homework || c.assignment ? (
        <>
          <Divider />
          <SectionTitle>Homework / Assignment</SectionTitle>
          <BodyText text={str(c.homework ?? c.assignment)} />
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

// ---- 4. Quiz ----
function QuizRenderer({ c }: { c: Record<string, unknown> }) {
  const questions = asArray(c.questions ?? c.items ?? c.quiz_questions);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <InfoRow label="Subject" value={asString(c.subject)} />
      <InfoRow label="Topic" value={asString(c.topic)} />
      <InfoRow label="Grade" value={asString(c.grade)} />

      {c.instructions ? (
        <>
          <Divider />
          <SectionTitle>Instructions</SectionTitle>
          <BodyText text={str(c.instructions)} />
        </>
      ) : null}

      {questions.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Questions ({questions.length})</SectionTitle>
          {questions.map((q, i) => {
            if (typeof q === "object" && q !== null) {
              const question = q as Record<string, unknown>;
              const opts = asArray(question.options ?? question.choices);
              return (
                <View key={i} className="mb-4 border border-border rounded-xl overflow-hidden">
                  <View className="bg-primary/10 px-4 py-2 flex-row items-start gap-2">
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0 mt-0.5">
                      <Text className="text-primary-foreground text-xs font-bold">{i + 1}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground flex-1 leading-6">
                      {str(question.question ?? question.text ?? question.q ?? "")}
                    </Text>
                  </View>
                  {opts.length > 0 ? (
                    <View className="px-4 py-3 gap-2">
                      {opts.map((opt, oi) => {
                        const letter = String.fromCharCode(65 + oi);
                        const isCorrect = str(question.correct_answer ?? question.answer) === str(opt) ||
                          str(question.correct_answer ?? question.answer) === letter;
                        return (
                          <View key={oi} className={`flex-row items-center gap-2 px-3 py-2 rounded-lg ${isCorrect ? "bg-green-50" : "bg-secondary"}`}>
                            <View className={`w-5 h-5 rounded-full items-center justify-center flex-shrink-0 ${isCorrect ? "bg-green-600" : "bg-border"}`}>
                              <Text className={`text-xs font-bold ${isCorrect ? "text-white" : "text-muted-foreground"}`}>{letter}</Text>
                            </View>
                            <Text className={`text-sm flex-1 ${isCorrect ? "font-semibold text-green-800" : "text-foreground"}`}>{str(opt)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                  {(question.correct_answer || question.answer) && opts.length === 0 ? (
                    <View className="px-4 pb-3">
                      <Text className="text-xs font-semibold text-green-700">Answer: {str(question.correct_answer ?? question.answer)}</Text>
                    </View>
                  ) : null}
                  {question.explanation ? (
                    <View className="px-4 pb-3 border-t border-border pt-2">
                      <Text className="text-xs text-muted-foreground italic">{str(question.explanation)}</Text>
                    </View>
                  ) : null}
                </View>
              );
            }
            return <NumberedItem key={i} index={i + 1} text={str(q)} />;
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}
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
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <InfoRow label="Subject" value={asString(c.subject)} />
      <InfoRow label="Topic" value={asString(c.topic)} />
      <InfoRow label="Grade" value={asString(c.grade)} />
      <InfoRow label="Due Date" value={asString(c.due_date ?? c.deadline)} />
      <InfoRow label="Total Marks" value={asString(c.total_marks ?? c.marks)} />

      {c.objectives || c.learning_objectives ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.objectives ?? c.learning_objectives).map((o, i) => <Bullet key={i} text={str(o)} />)}
        </>
      ) : null}

      {c.instructions || c.description ? (
        <>
          <Divider />
          <SectionTitle>Instructions</SectionTitle>
          <BodyText text={str(c.instructions ?? c.description)} />
        </>
      ) : null}

      {c.tasks || c.questions || c.items ? (
        <>
          <Divider />
          <SectionTitle>Tasks</SectionTitle>
          {asArray(c.tasks ?? c.questions ?? c.items).map((task, i) => (
            <NumberedItem key={i} index={i + 1} text={str(task)} />
          ))}
        </>
      ) : null}

      {c.submission_guidelines || c.submission ? (
        <>
          <Divider />
          <SectionTitle>Submission Guidelines</SectionTitle>
          <BodyText text={str(c.submission_guidelines ?? c.submission)} />
        </>
      ) : null}

      {c.rubric || c.marking_criteria ? (
        <>
          <Divider />
          <SectionTitle>Marking Criteria</SectionTitle>
          <BodyText text={str(c.rubric ?? c.marking_criteria)} />
        </>
      ) : null}
    </View>
  );
}

// ---- 7. Rubric ----
function RubricRenderer({ c }: { c: Record<string, unknown> }) {
  const criteria = asArray(c.criteria ?? c.rubric_criteria ?? c.rows);
  const levels = asArray(c.levels ?? c.performance_levels ?? c.columns ?? c.headers);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <InfoRow label="Assessment Type" value={asString(c.assessment_type ?? c.type)} />
      <InfoRow label="Total Marks" value={asString(c.total_marks ?? c.marks)} />

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
            if (typeof crit === "object" && crit !== null) {
              const critObj = crit as Record<string, unknown>;
              const descriptors = asArray(critObj.descriptors ?? critObj.levels ?? critObj.performance);
              return (
                <View key={ci} className="mb-3 border border-border rounded-xl overflow-hidden">
                  <View className="bg-primary/10 px-4 py-2">
                    <Text className="text-primary font-bold text-sm">
                      {str(critObj.criterion ?? critObj.name ?? critObj.title ?? `Criterion ${ci + 1}`)}
                    </Text>
                    {critObj.weight || critObj.marks ? (
                      <Text className="text-muted-foreground text-xs">{str(critObj.weight ?? critObj.marks)} marks</Text>
                    ) : null}
                  </View>
                  {critObj.description ? (
                    <View className="px-4 pt-2">
                      <Text className="text-sm text-muted-foreground">{str(critObj.description)}</Text>
                    </View>
                  ) : null}
                  {descriptors.length > 0 ? (
                    <View className="px-4 py-2 gap-1">
                      {descriptors.map((d, di) => (
                        <Bullet key={di} text={str(d)} />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            }
            return <Bullet key={ci} text={str(crit)} />;
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}
    </View>
  );
}

// ---- 8. Report Comment ----
function ReportCommentRenderer({ c }: { c: Record<string, unknown> }) {
  const comments = asArray(c.comments ?? c.report_comments ?? c.students);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}

      {/* Single comment */}
      {c.comment || c.report_comment ? (
        <>
          <InfoRow label="Student" value={asString(c.student_name ?? c.student)} />
          <InfoRow label="Subject" value={asString(c.subject)} />
          <InfoRow label="Performance" value={asString(c.performance ?? c.grade)} />
          <Divider />
          <SectionTitle>Report Comment</SectionTitle>
          <View className="bg-secondary rounded-xl p-4 border-l-4 border-primary">
            <Text className="text-sm text-foreground leading-7 italic">{str(c.comment ?? c.report_comment)}</Text>
          </View>
          {c.recommendation ? (
            <>
              <SectionTitle>Recommendation</SectionTitle>
              <BodyText text={str(c.recommendation)} />
            </>
          ) : null}
          {c.areas_for_improvement ? (
            <>
              <Divider />
              <SectionTitle>Areas for Improvement</SectionTitle>
              {asArray(c.areas_for_improvement).map((a, i) => <Bullet key={i} text={str(a)} />)}
            </>
          ) : null}
        </>
      ) : comments.length > 0 ? (
        /* Batch comments */
        <>
          <Divider />
          <SectionTitle>Student Comments ({comments.length})</SectionTitle>
          {comments.map((s, si) => {
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
                    {str(student.comment ?? student.report_comment ?? "")}
                  </Text>
                </View>
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

// ---- 9. Presentation ----
function PresentationRenderer({ c }: { c: Record<string, unknown> }) {
  const slides = asArray(c.slides ?? c.presentation_slides ?? c.outline);
  return (
    <View className="gap-2">
      {c.title ? <Text className="text-lg font-bold text-foreground mb-1">{str(c.title)}</Text> : null}
      <InfoRow label="Subject" value={asString(c.subject)} />
      <InfoRow label="Grade" value={asString(c.grade)} />
      <InfoRow label="Duration" value={asString(c.duration)} />

      {c.learning_objectives || c.objectives ? (
        <>
          <Divider />
          <SectionTitle>Learning Objectives</SectionTitle>
          {asArray(c.learning_objectives ?? c.objectives).map((o, i) => <Bullet key={i} text={str(o)} />)}
        </>
      ) : null}

      {slides.length > 0 ? (
        <>
          <Divider />
          <SectionTitle>Slides ({slides.length})</SectionTitle>
          {slides.map((slide, si) => {
            if (typeof slide === "object" && slide !== null) {
              const s = slide as Record<string, unknown>;
              const bullets = asArray(s.content ?? s.bullets ?? s.points ?? s.key_points);
              return (
                <View key={si} className="mb-4 border border-border rounded-2xl overflow-hidden">
                  <View className="bg-primary px-4 py-3 flex-row items-center gap-2">
                    <View className="w-7 h-7 bg-primary-foreground/20 rounded-full items-center justify-center">
                      <Text className="text-primary-foreground text-xs font-bold">{si + 1}</Text>
                    </View>
                    <Text className="text-primary-foreground font-bold text-sm flex-1">
                      {str(s.title ?? s.slide_title ?? s.heading ?? `Slide ${si + 1}`)}
                    </Text>
                  </View>
                  {s.type || s.slide_type ? (
                    <View className="px-4 pt-2">
                      <Text className="text-xs text-muted-foreground">{str(s.type ?? s.slide_type)}</Text>
                    </View>
                  ) : null}
                  {bullets.length > 0 ? (
                    <View className="px-4 py-3 gap-1">
                      {bullets.map((b, bi) => <Bullet key={bi} text={str(b)} />)}
                    </View>
                  ) : s.content && typeof s.content === "string" ? (
                    <View className="px-4 py-3">
                      <BodyText text={str(s.content)} />
                    </View>
                  ) : null}
                  {s.speaker_notes || s.notes ? (
                    <View className="px-4 pb-3 border-t border-border pt-2">
                      <Text className="text-xs font-semibold text-muted-foreground mb-1">Speaker Notes</Text>
                      <Text className="text-xs text-muted-foreground italic leading-5">{str(s.speaker_notes ?? s.notes)}</Text>
                    </View>
                  ) : null}
                </View>
              );
            }
            return <NumberedItem key={si} index={si + 1} text={str(slide)} />;
          })}
        </>
      ) : (
        <GenericRenderer content={c} />
      )}
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
