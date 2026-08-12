import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  lesson_plan: `You are a MASTER curriculum designer and Ghana NaCCA/GES expert with 20+ years of classroom experience. Generate the most comprehensive, detailed, classroom-ready lesson plan a teacher has ever seen. Every field must be complete, specific, and immediately usable — no vague placeholders. Use real Ghanaian context, local industries (cocoa, gold mining, tech hubs in Accra), and culturally relevant examples. Return ONLY valid JSON with no markdown, no code fences, no explanation.`,

  scheme_of_learning: `You are a SENIOR curriculum specialist aligned to Ghana GES and NaCCA frameworks. Generate a complete, professional term scheme of learning with rich week-by-week detail. Each week must have fully elaborated objectives, specific teaching activities, and clear assessment strategies. Make every entry usable by a classroom teacher without further editing. Use Ghanaian context throughout. Return ONLY valid JSON.`,

  notes: `You are a WORLD-CLASS educator and subject matter expert aligned to Ghana NaCCA. Generate the most comprehensive, well-researched teaching notes with clear definitions, detailed explanations, worked examples, local Ghanaian parallels, and pedagogically rich content. Notes should be so good that a teacher with no preparation can walk into the classroom and deliver an excellent lesson. Return ONLY valid JSON.`,

  quiz: `You are a PROFESSIONAL assessment designer with expertise in Ghana GES standards. Generate a comprehensive, engaging quiz with perfectly balanced difficulty, varied question types, complete answer keys, and detailed marking notes. Questions must be crystal clear, options must be plausible but unambiguous, and answers must be educationally correct. Return ONLY valid JSON.`,

  examination: `You are a CERTIFIED examination setter trained to Ghana WAEC/BECE/SHS standards with mastery of Bloom's Taxonomy. Generate a complete, balanced, professionally formatted examination paper with clear sections, well-crafted questions at multiple cognitive levels, and a thorough marking scheme. Return ONLY valid JSON.`,

  assignment: `You are an EXPERT educator and instructional designer aligned to Ghana NaCCA. Generate a creative, engaging, well-scaffolded assignment that develops higher-order thinking, connects to real Ghanaian life, and has crystal-clear instructions any student can follow. Include rich rubric-style evaluation criteria. Return ONLY valid JSON.`,

  rubric: `You are a CERTIFIED assessment specialist with expertise in performance-based evaluation. Generate a detailed, standards-aligned rubric with specific, observable descriptors at each performance level. Descriptors must clearly distinguish between levels so teachers and students both understand exactly what is expected. Return ONLY valid JSON.`,

  report_comment: `You are an EXPERIENCED Ghanaian school teacher and pastoral leader with 15+ years of writing professional report comments. Generate personalised, constructive, encouraging, and professionally worded comments that parents will appreciate and students will be motivated by. Comments must be specific, warm, and forward-looking. Return ONLY valid JSON.`,

  presentation: `You are a WORLD-CLASS instructional designer and educational content creator specialising in Ghana NaCCA-aligned classroom presentations. Generate a premium, visually rich presentation with engaging content, specific YouTube video recommendations for every slide, detailed diagram descriptions, real Ghanaian examples, and comprehensive speaker notes. Make every slide so good it becomes the teacher's favourite teaching resource. Return ONLY valid JSON.`,
};

const CONTENT_TEMPLATES: Record<string, (inputs: Record<string, string>) => string> = {
  lesson_plan: (i) => `Generate a detailed, Ghana NaCCA-aligned lesson plan:

Subject: ${i.subject}
Grade/Class: ${i.grade}
Topic: ${i.topic}
Duration: ${i.duration || "60 minutes"}
Learning Objectives: ${i.objectives || "AI to determine based on topic and grade"}
Curriculum: ${i.curriculum || "Ghana NaCCA"}
Teaching Methodology: ${i.methodology || "Constructivist / Activity-based"}
Difficulty Level: ${i.difficulty || "Intermediate"}

Return JSON with this EXACT structure (all string values, never nested objects):
{
  "title": "Lesson Plan: ${i.topic}",
  "subject": "${i.subject}",
  "grade": "${i.grade}",
  "topic": "${i.topic}",
  "duration": "${i.duration || "60 minutes"}",
  "curriculum": "${i.curriculum || "Ghana NaCCA"}",
  "strand": "e.g. Computing Systems / Number Sense / etc.",
  "sub_strand": "specific sub-strand from curriculum",
  "objectives": [
    "By the end of the lesson, students will be able to define...",
    "Students will be able to identify...",
    "Students will be able to explain..."
  ],
  "prior_knowledge": ["Students already know...", "Students can already..."],
  "key_vocabulary": ["term 1: definition", "term 2: definition", "term 3: definition"],
  "materials": ["Interactive whiteboard", "Handouts on ...", "Markers and chart paper"],
  "introduction_duration": "10 minutes",
  "introduction_activities": [
    "Begin by showing a short video/image of ... (3 min)",
    "Ask students: 'Have you ever seen a robot? What did it do?' (2 min)",
    "Conduct a Think-Pair-Share: 'What makes a machine a robot versus a simple tool?' (5 min)"
  ],
  "introduction_teacher_note": "Capture students' ideas on the board to reference throughout the lesson.",
  "development_duration": "35 minutes",
  "development_activities": [
    "Step 1 (10 min): Direct instruction — use slides to introduce the three core components of a robot: sensors, processors, and actuators. Give a real local example for each.",
    "Step 2 (10 min): Group activity — divide students into groups. Each group researches one Ghanaian industry (agriculture, mining, healthcare) and identifies one robotic application.",
    "Step 3 (10 min): Simulation activity — students use Tinkercad or VEXcode VR to build a basic robot circuit.",
    "Step 4 (5 min): Groups present their industry research findings to the class."
  ],
  "development_teacher_notes": "Circulate during group work. Prompt with questions: 'How does the sensor know when to stop?' 'What instruction does the processor follow?'",
  "closure_duration": "10 minutes",
  "closure_activities": [
    "Class discussion: Review the difference between autonomous and remote-controlled robots with examples.",
    "Exit ticket: Each student writes one sentence answering: 'How could robots help solve one problem in Ghana?'"
  ],
  "assessment_formative": [
    "Observation of group research and participation",
    "Real-time feedback during simulation activity",
    "Exit ticket quality and accuracy"
  ],
  "assessment_summative": "A short written assignment: describe a robot design that solves a specific household or community problem in Ghana. Include the three core components and their functions.",
  "differentiation_support": "Provide vocabulary cards with illustrated definitions for students who need extra support.",
  "differentiation_extension": "Advanced students design a second robot for a different industry and compare the two systems.",
  "homework": "Research one industry in Ghana and write a 200-word paragraph on how robotics could increase productivity or safety in that sector. Include at least one specific real-world example.",
  "reflection_questions": [
    "Did students achieve all three learning objectives? Evidence?",
    "Which activity generated the most engagement?",
    "What would I change if I taught this lesson again?"
  ],
  "references": [
    "Ghana NaCCA Computing Curriculum (2019)",
    "GES ICT Curriculum Framework",
    "Tinkercad: www.tinkercad.com",
    "VEXcode VR: vr.vex.com"
  ]
}`,

  scheme_of_learning: (i) => `Generate a detailed Ghana GES/NaCCA term scheme of learning:

Subject: ${i.subject}
Grade/Class: ${i.grade}
Term: ${i.term || "Term 1"}
Number of Weeks: ${i.termDuration || "12"}
Weekly Contact Hours: ${i.weeklyHours || "5 hours"}
Curriculum: ${i.curriculum || "Ghana NaCCA"}

Return JSON with this structure:
{
  "title": "Scheme of Learning: ${i.subject} — ${i.grade} — ${i.term || "Term 1"}",
  "subject": "${i.subject}",
  "grade": "${i.grade}",
  "term": "${i.term || "Term 1"}",
  "total_weeks": ${i.termDuration || 12},
  "weekly_hours": "${i.weeklyHours || "5 hours"}",
  "curriculum": "${i.curriculum || "Ghana NaCCA"}",
  "term_overview": "Brief paragraph describing what students will learn this term and key skills developed.",
  "weeks": [
    {
      "week": 1,
      "topic": "Topic name",
      "sub_strand": "NaCCA sub-strand reference",
      "objectives": ["Students will be able to...", "Students will be able to..."],
      "key_concepts": ["concept 1", "concept 2"],
      "teaching_activities": ["Activity 1 description", "Activity 2 description"],
      "learning_activities": ["Students will...", "Students will..."],
      "resources": ["Textbook Chapter X", "Charts", "ICT tools"],
      "assessment": "How learning will be checked this week",
      "notes": "Any special instructions or cross-curricular links"
    }
  ],
  "assessment_schedule": [
    {"week": 4, "type": "Mid-term quiz", "topics_covered": "Weeks 1-4"},
    {"week": 12, "type": "End-of-term examination", "topics_covered": "All"}
  ]
}`,

  notes: (i) => `Generate comprehensive Ghana NaCCA-aligned teaching notes:

Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade || "General"}
Depth: ${i.depth || "Intermediate"}

Return JSON:
{
  "title": "Teaching Notes: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "grade": "${i.grade || "General"}",
  "curriculum_strand": "Relevant NaCCA strand",
  "overview": "2-3 sentences introducing the topic and its importance in the Ghanaian context.",
  "key_vocabulary": [
    {"term": "...", "definition": "...", "example": "Local Ghana example"}
  ],
  "sections": [
    {
      "heading": "Section heading",
      "content": "Detailed explanation in full sentences suitable for teachers to read to students or adapt.",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "examples": ["Ghana-specific example 1", "Real-world example 2"],
      "common_misconceptions": ["Students often think X but actually Y"]
    }
  ],
  "worked_examples": [
    {"problem": "...", "solution_steps": ["Step 1: ...", "Step 2: ..."], "answer": "..."}
  ],
  "classroom_activities": [
    {"title": "Activity name", "duration": "15 min", "instructions": "Step-by-step instructions", "materials": ["item 1"]}
  ],
  "summary": "2-3 sentences summarising the key learning from this topic.",
  "practice_questions": [
    {"question": "...", "type": "short_answer", "answer": "...", "marks": 2}
  ],
  "references": ["Ghana NaCCA Curriculum 2019", "GES Textbook reference"]
}`,

  quiz: (i) => `Generate a comprehensive Ghana GES-aligned quiz:

Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade}
Number of Questions: ${i.numQuestions || "10"}
Difficulty: ${i.difficulty || "Intermediate"}

Return JSON:
{
  "title": "Quiz: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "grade": "${i.grade}",
  "total_marks": ${Number(i.numQuestions || 10) * 2},
  "duration": "${Math.ceil(Number(i.numQuestions || 10) * 2.5)} minutes",
  "instructions": "Answer ALL questions. Write clearly. Show working where required.",
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice",
      "question": "Full question text here?",
      "options": ["A. option text", "B. option text", "C. option text", "D. option text"],
      "correct_answer": "A",
      "marks": 1,
      "explanation": "Why A is correct"
    },
    {
      "number": 2,
      "type": "true_false",
      "question": "Statement here.",
      "correct_answer": "True",
      "marks": 1,
      "explanation": "Reason"
    },
    {
      "number": 3,
      "type": "short_answer",
      "question": "Question requiring a written answer?",
      "correct_answer": "Model answer here",
      "marks": 2,
      "marking_notes": "Award 1 mark for... Award additional mark for..."
    }
  ],
  "answer_key": "1-A, 2-True, 3-See marking notes",
  "marking_guide": "Total marks: ${Number(i.numQuestions || 10) * 2}. Each MCQ = 1 mark. Short answers see individual notes."
}`,

  examination: (i) => `Generate a complete Ghana BECE/SHS-standard examination paper:

Subject: ${i.subject}
Grade/Class: ${i.grade}
Duration: ${i.duration || "2 hours"}
Total Marks: ${i.totalMarks || "100"}
Topics: ${i.topics || i.topic || "All topics covered in the term"}
Bloom's Distribution: ${i.bloomsDistribution || "Knowledge 20%, Comprehension 30%, Application 30%, Analysis 20%"}

Return JSON:
{
  "title": "${i.subject} End-of-Term Examination",
  "grade": "${i.grade}",
  "duration": "${i.duration || "2 hours"}",
  "total_marks": ${i.totalMarks || 100},
  "general_instructions": [
    "Answer ALL questions in Section A.",
    "Answer THREE questions from Section B.",
    "Show all working clearly.",
    "Write legibly in blue or black ink."
  ],
  "sections": [
    {
      "section": "A",
      "title": "Section A: Objectives (Multiple Choice)",
      "instructions": "Circle the letter of the best answer for each question.",
      "marks": 40,
      "questions": [
        {
          "number": 1,
          "question": "Full question text?",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answer": "B",
          "marks": 2,
          "blooms_level": "Knowledge"
        }
      ]
    },
    {
      "section": "B",
      "title": "Section B: Structured Questions",
      "instructions": "Answer THREE questions. Each question carries equal marks.",
      "marks": 60,
      "questions": [
        {
          "number": 1,
          "question": "Main question stem.",
          "sub_questions": [
            {"label": "a", "question": "Sub-question a?", "marks": 5, "answer": "Model answer"},
            {"label": "b", "question": "Sub-question b?", "marks": 5, "answer": "Model answer"},
            {"label": "c", "question": "Sub-question c?", "marks": 10, "answer": "Model answer"}
          ],
          "total_marks": 20,
          "blooms_levels": "Comprehension, Application"
        }
      ]
    }
  ],
  "marking_scheme_notes": "Award marks for correct methodology even if final answer is wrong. Accept all reasonable alternatives."
}`,

  assignment: (i) => `Generate a Ghana NaCCA-aligned assignment:

Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade}
Type: ${i.assignmentType || "Research & Written Report"}
Duration: ${i.duration || "1 week"}

Return JSON:
{
  "title": "Assignment: ${i.topic}",
  "subject": "${i.subject}",
  "topic": "${i.topic}",
  "grade": "${i.grade}",
  "type": "${i.assignmentType || "Research & Written Report"}",
  "due_description": "${i.duration || "1 week"} from date of issue",
  "total_marks": 50,
  "objectives": ["Students will research...", "Students will demonstrate...", "Students will present..."],
  "background": "2-3 sentences giving context and why this assignment matters in the Ghanaian context.",
  "instructions": "Read all instructions carefully before starting. Complete all tasks in order. Submit on time.",
  "tasks": [
    {
      "number": 1,
      "title": "Task title",
      "description": "Detailed description of what students must do.",
      "marks": 20,
      "requirements": ["Requirement 1", "Requirement 2", "Minimum length/format"]
    }
  ],
  "submission_requirements": [
    "Submitted in an exercise book or on A4 paper",
    "Student name, class, and date on the cover page",
    "Written in blue or black ink"
  ],
  "evaluation_criteria": [
    {"criterion": "Content accuracy", "marks": 20, "description": "Information is factually correct and relevant"},
    {"criterion": "Organisation and structure", "marks": 15, "description": "Work is logically organised with clear headings"},
    {"criterion": "Originality and effort", "marks": 15, "description": "Evidence of genuine research and own thinking"}
  ],
  "useful_resources": ["GES Textbook Chapter X", "ghana.gov.gh", "Library reference section"]
}`,

  rubric: (i) => `Generate a detailed standards-aligned grading rubric:

Assessment Type: ${i.assessmentType || "Project / Essay"}
Criteria: ${i.criteria || "Content, Organisation, Language, Presentation, Creativity"}
Performance Levels: ${i.levels || "Excellent (4), Good (3), Satisfactory (2), Needs Improvement (1)"}
Grade: ${i.grade || "General"}
Total Marks: ${i.totalMarks || "20"}

Return JSON:
{
  "title": "Grading Rubric: ${i.assessmentType || "Assessment"}",
  "assessment_type": "${i.assessmentType || "Project / Essay"}",
  "grade": "${i.grade || "General"}",
  "total_marks": ${i.totalMarks || 20},
  "performance_levels": ["Excellent (4)", "Good (3)", "Satisfactory (2)", "Needs Improvement (1)"],
  "criteria": [
    {
      "criterion": "Criterion name",
      "weight_marks": 5,
      "descriptors": [
        {"level": "Excellent (4)", "description": "Detailed description of excellent performance"},
        {"level": "Good (3)", "description": "Detailed description of good performance"},
        {"level": "Satisfactory (2)", "description": "Detailed description of satisfactory performance"},
        {"level": "Needs Improvement (1)", "description": "Detailed description of what needs improvement"}
      ]
    }
  ],
  "scoring_guide": "Multiply score for each criterion by its weight. Add all scores for total.",
  "grade_boundaries": "18-20 = Distinction, 14-17 = Merit, 10-13 = Pass, Below 10 = Needs Support"
}`,

  report_comment: (i) => `Generate a professional, personalised report card comment:

Student Name: ${i.studentName || "the student"}
Subject: ${i.subject}
Academic Performance: ${i.performance || "Average"}
Attendance: ${i.attendance || "Regular"}
Behaviour: ${i.behavior || "Good"}
Teacher Observations: ${i.observations || "Shows interest in learning"}

Return JSON:
{
  "student_name": "${i.studentName || "The student"}",
  "subject": "${i.subject}",
  "performance_grade": "${i.performance || "Average"}",
  "academic_comment": "2-3 sentences on academic performance, referencing specific skills or topics.",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "areas_for_improvement": ["Area 1 with specific suggestion", "Area 2 with actionable advice"],
  "behaviour_comment": "One sentence on behaviour and attitude in class.",
  "attendance_comment": "One sentence on attendance.",
  "recommendation": "One constructive recommendation for continued improvement.",
  "full_comment": "A complete 4-6 sentence report comment combining all aspects, written in third person, professional tone, positive and encouraging.",
  "short_comment": "A 1-2 sentence version suitable for a brief report column."
}`,

  presentation: (i) => `Generate a PREMIUM, classroom-ready presentation with rich visuals, real YouTube video suggestions, and detailed teaching content:

Subject: ${i.subject}
Topic: ${i.topic}
Grade/Class: ${i.grade || "General"}
Duration: ${i.duration || "30 minutes"}
Number of Slides: ${i.numSlides || "10"}
Audience: ${i.audience || "Secondary school students"}
Visual Style: ${i.visualStyle || "Modern, colourful, diagram-heavy"}
Key Points: ${i.keyPoints || "All major curriculum concepts"}

CRITICAL INSTRUCTIONS:
1. Every slide MUST have a "suggested_visual" with a specific, detailed image description
2. Every slide MUST have a "youtube_search_query" — a real, specific YouTube search string (e.g. "Khan Academy photosynthesis explained for students") that a teacher can search to find a supporting video
3. Where a video is especially important (intro, key concept), set "youtube_featured": true
4. "diagram_description" should describe a specific diagram/chart/infographic for that slide
5. bullet_points must be complete, informative sentences (not single words)
6. speaker_notes must be 3-5 detailed sentences with teaching tips, questions to ask, and Ghana-local examples
7. Include a "real_world_connection" field on every content slide — a real Ghanaian or African example

Return JSON with this EXACT structure:
{
  "title": "${i.topic}",
  "subject": "${i.subject}",
  "grade": "${i.grade || "General"}",
  "total_duration": "${i.duration || "30 minutes"}",
  "total_slides": ${i.numSlides || 10},
  "overview": "2-3 sentences summarising what this presentation covers and why it matters.",
  "learning_objectives": ["By end of lesson students will be able to...", "Students will identify...", "Students will explain..."],
  "slides": [
    {
      "number": 1,
      "type": "Title Slide",
      "title": "Engaging main title for the topic",
      "subtitle": "${i.subject} | ${i.grade || "General"} | Ghana NaCCA",
      "hook_question": "An intriguing question to open discussion, e.g. 'Have you ever wondered why...?'",
      "suggested_visual": "Detailed description: e.g. 'Vibrant photo of a Ghanaian classroom with students using tablets, bright lighting, modern setting'",
      "youtube_search_query": "Specific YouTube search string, e.g. 'introduction to photosynthesis animated explainer'",
      "youtube_featured": true,
      "speaker_notes": "3-5 sentences: Welcome class, display hook question, ask for show of hands, briefly introduce the topic and what they will learn by the end."
    },
    {
      "number": 2,
      "type": "Learning Objectives",
      "title": "What We Will Learn Today",
      "bullet_points": ["Full sentence objective 1", "Full sentence objective 2", "Full sentence objective 3"],
      "suggested_visual": "Clean infographic showing a learning path or roadmap with icons",
      "youtube_search_query": "Relevant overview video search query",
      "youtube_featured": false,
      "speaker_notes": "Read each objective with students. Ask: 'Which of these topics do you already know something about?'"
    },
    {
      "number": 3,
      "type": "Content",
      "title": "Key concept heading",
      "bullet_points": ["Point 1: full explanation with example", "Point 2: full explanation", "Point 3: application or significance"],
      "suggested_visual": "Specific diagram description: e.g. 'Labelled diagram of the water cycle showing evaporation, condensation, precipitation with arrows'",
      "diagram_description": "Step-by-step description of exactly what diagram to draw or display",
      "youtube_search_query": "Specific YouTube search for this concept",
      "youtube_featured": false,
      "real_world_connection": "Specific Ghanaian/African example connecting this concept to real life",
      "activity_prompt": "Quick 2-minute class activity teachers can do right after this slide",
      "speaker_notes": "Detailed 3-5 sentence teaching notes with questions, tips, and local examples."
    }
  ],
  "assessment_slide": {
    "number": ${i.numSlides || 10},
    "type": "Assessment / Summary",
    "title": "What Did We Learn?",
    "recap_questions": ["Question 1?", "Question 2?", "Question 3?"],
    "exit_ticket": "One sentence prompt students write on a card before leaving: e.g. 'Write one thing you learned today and one question you still have.'",
    "suggested_visual": "Summary mind-map or infographic description",
    "youtube_search_query": "YouTube search for a summary/recap video on this topic",
    "speaker_notes": "Guide students through recap questions. Collect exit tickets. Preview next lesson."
  },
  "additional_resources": [
    {"type": "YouTube", "search_query": "Related video 1 search query", "description": "Why this video is useful"},
    {"type": "YouTube", "search_query": "Related video 2 search query", "description": "Why this video is useful"},
    {"type": "Website", "url": "ghana.gov.gh or relevant educational site", "description": "What resource this is"}
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

    // ── Call Gemini (confirmed working models for this API key, in priority order) ─
    const GEMINI_MODELS = [
      "gemini-3.1-flash-lite",   // newest lite, confirmed working + JSON mode ✓
      "gemini-flash-lite-latest", // alias for latest lite, confirmed working ✓
      "gemini-3-flash-preview",   // preview fallback
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
