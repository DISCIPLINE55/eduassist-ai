import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  lesson_plan: `You are an expert curriculum designer and instructional expert. Generate a comprehensive, well-structured lesson plan in valid JSON. The lesson plan must be detailed, practical, and ready to use in a classroom.`,
  scheme_of_learning: `You are a curriculum planning expert. Generate a comprehensive weekly scheme of learning for an entire term in valid JSON. Include topic breakdowns, learning objectives, and assessment points for each week.`,
  notes: `You are an expert educator and subject matter expert. Generate comprehensive, structured teaching notes in valid JSON. Notes should be clear, accurate, and pedagogically sound.`,
  quiz: `You are an expert assessment designer. Generate a comprehensive quiz with varied question types in valid JSON. Include an answer key and marking guide.`,
  examination: `You are an expert examination setter. Generate a complete, professional examination paper following Bloom's Taxonomy principles in valid JSON. Include marking scheme.`,
  assignment: `You are an expert educator. Generate a clear, engaging assignment in valid JSON with detailed instructions, tasks, and evaluation criteria.`,
  rubric: `You are an expert assessment specialist. Generate a detailed grading rubric with clear criteria and performance level descriptors in valid JSON.`,
  report_comment: `You are an experienced educator specializing in student assessment and reporting. Generate professional, personalized report card comments in valid JSON.`,
  presentation: `You are an expert instructional designer and presentation specialist. Generate engaging presentation slide content in valid JSON with titles, bullet points, and speaker notes.`,
};

const CONTENT_TEMPLATES: Record<string, (inputs: Record<string, string>) => string> = {
  lesson_plan: (i) => `Generate a detailed lesson plan for:
Subject: ${i.subject}
Grade/Class: ${i.grade}
Topic: ${i.topic}
Duration: ${i.duration || "60 minutes"}
Learning Objectives: ${i.objectives || "To be determined by AI"}
Curriculum: ${i.curriculum || "General"}
Teaching Methodology: ${i.methodology || "Mixed Methods"}
Difficulty Level: ${i.difficulty || "Intermediate"}
Language: ${i.language || "English"}

Return JSON with this exact structure:
{
  "title": "Lesson Plan: [Topic]",
  "subject": "${i.subject}",
  "grade": "${i.grade}",
  "topic": "${i.topic}",
  "duration": "${i.duration || "60 minutes"}",
  "objectives": ["obj1", "obj2", "obj3"],
  "prior_knowledge": ["knowledge1", "knowledge2"],
  "materials": ["material1", "material2"],
  "introduction": {"duration": "10 min", "activities": ["activity1"]},
  "teacher_activities": [{"step": 1, "duration": "15 min", "activity": "...", "notes": "..."}],
  "learner_activities": [{"step": 1, "duration": "15 min", "activity": "...", "notes": "..."}],
  "assessment": {"formative": ["assessment1"], "summative": "..."},
  "homework": "...",
  "reflection": {"questions": ["q1", "q2"]},
  "references": ["ref1", "ref2"]
}`,

  scheme_of_learning: (i) => `Generate a term scheme of learning for:
Subject: ${i.subject}
Grade/Class: ${i.grade}
Term: ${i.term || "Term 1"}
Duration: ${i.termDuration || "12 weeks"}
Curriculum: ${i.curriculum || "General"}
Weekly Hours: ${i.weeklyHours || "5 hours"}

Return JSON with this structure:
{
  "title": "Scheme of Learning: ${i.subject} - ${i.grade}",
  "subject": "${i.subject}",
  "grade": "${i.grade}",
  "term": "${i.term || "Term 1"}",
  "total_weeks": 12,
  "weeks": [
    {
      "week": 1,
      "topic": "...",
      "subtopics": ["sub1", "sub2"],
      "objectives": ["obj1"],
      "activities": ["activity1"],
      "resources": ["resource1"],
      "assessment": "..."
    }
  ]
}`,

  notes: (i) => `Generate comprehensive teaching notes for:
Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade || "General"}
Depth Level: ${i.depth || "Intermediate"}
Language: ${i.language || "English"}

Return JSON with this structure:
{
  "title": "Teaching Notes: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "introduction": "...",
  "sections": [
    {
      "heading": "...",
      "content": "...",
      "definitions": [{"term": "...", "definition": "..."}],
      "examples": ["example1", "example2"],
      "key_points": ["point1", "point2"]
    }
  ],
  "activities": [{"title": "...", "instructions": "...", "duration": "..."}],
  "summary": "...",
  "practice_questions": [{"question": "...", "answer": "..."}],
  "further_reading": ["resource1"]
}`,

  quiz: (i) => `Generate a quiz for:
Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade}
Question Types: ${i.questionTypes || "MCQ, True/False, Short Answer"}
Number of Questions: ${i.numQuestions || "10"}
Difficulty: ${i.difficulty || "Intermediate"}

Return JSON with this structure:
{
  "title": "Quiz: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "total_marks": 20,
  "duration": "30 minutes",
  "instructions": "...",
  "sections": [
    {
      "type": "multiple_choice",
      "title": "Section A: Multiple Choice",
      "marks_per_question": 1,
      "questions": [
        {
          "number": 1,
          "question": "...",
          "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
          "answer": "A",
          "explanation": "..."
        }
      ]
    },
    {
      "type": "true_false",
      "title": "Section B: True or False",
      "marks_per_question": 1,
      "questions": [{"number": 1, "question": "...", "answer": "True"}]
    },
    {
      "type": "short_answer",
      "title": "Section C: Short Answer",
      "marks_per_question": 2,
      "questions": [{"number": 1, "question": "...", "answer": "...", "marks": 2}]
    }
  ],
  "answer_key": {"1": "A", "2": "True"},
  "marking_guide": "..."
}`,

  examination: (i) => `Generate a complete examination paper for:
Subject: ${i.subject}
Grade/Class: ${i.grade}
Duration: ${i.duration || "2 hours"}
Total Marks: ${i.totalMarks || "100"}
Topics: ${i.topics || i.topic}
Bloom's Distribution: ${i.bloomsDistribution || "Knowledge 20%, Comprehension 30%, Application 30%, Analysis 20%"}

Return JSON with this structure:
{
  "title": "${i.subject} Examination",
  "grade": "${i.grade}",
  "duration": "${i.duration || "2 hours"}",
  "total_marks": ${i.totalMarks || 100},
  "instructions": ["instruction1", "instruction2"],
  "sections": [
    {
      "section": "A",
      "title": "...",
      "instructions": "...",
      "marks": 30,
      "questions": [
        {
          "number": 1,
          "question": "...",
          "marks": 2,
          "blooms_level": "Knowledge",
          "answer": "..."
        }
      ]
    }
  ],
  "marking_scheme": {
    "general_instructions": "...",
    "section_marks": {"A": 30, "B": 40, "C": 30},
    "answers": [{"question": "1", "answer": "...", "marks_allocation": "..."}]
  }
}`,

  assignment: (i) => `Generate an assignment for:
Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade}
Type: ${i.assignmentType || "Research"}
Duration: ${i.duration || "1 week"}
Objectives: ${i.objectives || "To explore the topic in depth"}

Return JSON with this structure:
{
  "title": "Assignment: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "type": "${i.assignmentType || "Research"}",
  "due_date_description": "${i.duration || "1 week"} from issue date",
  "objectives": ["obj1", "obj2"],
  "instructions": "...",
  "tasks": [
    {"number": 1, "title": "...", "description": "...", "marks": 10, "requirements": ["req1"]}
  ],
  "submission_requirements": ["req1", "req2"],
  "evaluation_criteria": [
    {"criterion": "...", "marks": 10, "description": "..."}
  ],
  "resources": ["resource1"],
  "total_marks": 50
}`,

  rubric: (i) => `Generate a grading rubric for:
Assessment Type: ${i.assessmentType || "Essay/Project"}
Criteria: ${i.criteria || "Content, Organization, Language, Presentation"}
Performance Levels: ${i.levels || "Excellent, Good, Satisfactory, Needs Improvement"}
Grade/Class: ${i.grade || "General"}

Return JSON with this structure:
{
  "title": "Grading Rubric: ${i.assessmentType || "Assessment"}",
  "assessment_type": "${i.assessmentType || "Essay/Project"}",
  "total_marks": 20,
  "performance_levels": ["Excellent (4)", "Good (3)", "Satisfactory (2)", "Needs Improvement (1)"],
  "criteria": [
    {
      "name": "...",
      "weight": 25,
      "descriptors": {
        "Excellent (4)": "...",
        "Good (3)": "...",
        "Satisfactory (2)": "...",
        "Needs Improvement (1)": "..."
      }
    }
  ]
}`,

  report_comment: (i) => `Generate a personalized report card comment for:
Student Name: ${i.studentName || "the student"}
Subject: ${i.subject}
Academic Performance: ${i.performance || "Average"}
Attendance: ${i.attendance || "Regular"}
Behavior: ${i.behavior || "Good"}
Teacher Observations: ${i.observations || "Shows interest in learning"}

Return JSON with this structure:
{
  "student_name": "${i.studentName || "Student"}",
  "subject": "${i.subject}",
  "overall_grade": "${i.performance || "Average"}",
  "comments": {
    "academic": "...",
    "attendance": "...",
    "behavior": "...",
    "strengths": "...",
    "areas_for_improvement": "...",
    "teacher_recommendation": "..."
  },
  "full_comment": "...",
  "short_comment": "..."
}`,

  presentation: (i) => `Generate presentation slide content for:
Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade || "General"}
Duration: ${i.duration || "30 minutes"}
Number of Slides: ${i.numSlides || "10"}
Key Points: ${i.keyPoints || "Main concepts and examples"}

Return JSON with this structure:
{
  "title": "${i.topic}",
  "subject": "${i.subject}",
  "total_slides": ${i.numSlides || 10},
  "slides": [
    {
      "number": 1,
      "type": "title",
      "title": "...",
      "subtitle": "...",
      "speaker_notes": "..."
    },
    {
      "number": 2,
      "type": "content",
      "title": "...",
      "bullet_points": ["point1", "point2"],
      "speaker_notes": "...",
      "suggested_visual": "..."
    }
  ]
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, inputs } = await req.json();

    if (!type || !inputs) {
      return new Response(JSON.stringify({ error: "Missing type or inputs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    const systemPrompt = SYSTEM_PROMPTS[type];
    const userPrompt = CONTENT_TEMPLATES[type]?.(inputs);

    if (!systemPrompt || !userPrompt) {
      return new Response(JSON.stringify({ error: "Unsupported content type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!geminiKey) {
      console.error("GEMINI_API_KEY not configured in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "AI generation failed. GEMINI_API_KEY is not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let rawContent: string | undefined;
    let tokensUsed = 0;

    // ── Call Gemini (free tier models, in priority order) ────────────────────
    const GEMINI_MODELS = [
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
    ];

    const geminiBody = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    let lastErr = "";
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: geminiBody,
      });

      if (res.ok) {
        const data = await res.json();
        rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        tokensUsed = data.usageMetadata?.totalTokenCount || 0;
        console.log(`Generated with ${model}, tokens: ${tokensUsed}`);
        break;
      }

      lastErr = await res.text();
      console.warn(`Gemini ${model} failed (${res.status}): ${lastErr.substring(0, 200)}`);
      // only retry on quota/not-found; hard-fail on auth/bad-request
      if (res.status !== 429 && res.status !== 404) {
        return new Response(
          JSON.stringify({ error: "AI generation failed. Please try again shortly.", details: lastErr }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again shortly.", details: lastErr }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Parse JSON from AI response ───────────────────────────────────────
    // Strip markdown fences if model wrapped response anyway
    const cleaned = (rawContent ?? "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let content: Record<string, unknown>;
    try {
      content = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse failed. Raw preview:", (rawContent ?? "").substring(0, 300));
      return new Response(JSON.stringify({ error: "Invalid AI response format — could not parse JSON." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Track usage
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      document_type: type,
      tokens_used: tokensUsed,
    });

    return new Response(JSON.stringify({ content, tokens_used: tokensUsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
