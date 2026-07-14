# Requirements Document

## 1. Application Overview

**Application Name**: EduAssist AI

**Description**: EduAssist AI is a cross-platform mobile application (Android first, iOS later) that serves as an AI-powered teaching assistant for educators. It reduces time teachers spend preparing instructional materials by automating lesson planning, assessment creation, classroom resource generation, and other repetitive teaching tasks using AI.

**Technology Stack**: React Native + Expo, Supabase (authentication, database, storage, edge functions)

**Design System**: Material Design 3, minimalist layouts, consistent spacing, rounded components, high accessibility, dark mode + light mode, smooth animations, professional typography

## 2. Users and Usage Scenarios

### 2.1 Target Users
- Preschool Teachers
- Primary School Teachers
- Junior High School Teachers
- Senior High School Teachers
- TVET Instructors
- College Lecturers
- University Lecturers
- Private Tutors
- Online Educators

### 2.2 Core Usage Scenarios
- Teachers need to quickly generate lesson plans aligned with curriculum standards
- Educators require automated assessment creation (quizzes, exams, assignments)
- Teachers want to generate structured teaching notes and presentation materials
- Educators need to create grading rubrics and personalized report card comments
- Teachers require centralized storage and management of all generated teaching resources

## 3. Page Structure and Functional Description

### 3.1 Page Hierarchy

```
EduAssist AI
├── Authentication
│   ├── Register
│   ├── Login
│   ├── Reset Password
│   └── Email Verification
├── Dashboard
├── Lesson Planner
├── Scheme of Learning Generator
├── Notes Generator
├── Quiz Generator
├── Examination Generator
├── Assignment Generator
├── Rubric Builder
├── Report Comment Generator
├── Presentation Generator
├── Resource Library
└── Document Editor (shared across all generators)
```

### 3.2 Authentication Module

#### 3.2.1 Register Page
- User inputs email, password to create account
- Support Google Authentication via Firebase Authentication
- Send email verification after registration
- Store user data in Supabase

#### 3.2.2 Login Page
- User inputs email and password to login
- Support Google Authentication via Firebase Authentication
- Authenticate via Supabase

#### 3.2.3 Reset Password Page
- User inputs email to receive password reset link
- Process password reset request through Supabase

#### 3.2.4 Email Verification
- User receives verification email after registration
- Click verification link to activate account

### 3.3 Dashboard

#### 3.3.1 Core Display Elements
- Recent documents: Display recently generated or edited teaching materials
- AI usage statistics: Show AI generation usage metrics
- Saved lessons: Quick access to saved lesson plans
- Upcoming teaching schedule: Display scheduled teaching activities
- Quick AI shortcuts: Fast access buttons to frequently used AI generators
- Notifications: System notifications and updates

#### 3.3.2 Navigation
- Provide navigation to all core modules
- Access Resource Library
- Access user profile and settings

### 3.4 Lesson Planner

#### 3.4.1 Input Form
User provides following information:
- Subject
- Grade/Class
- Topic
- Learning objectives
- Duration
- Curriculum
- Teaching methodology
- Difficulty level
- Language

#### 3.4.2 AI Generation
- Submit inputs to Supabase edge function
- Edge function processes AI request and returns complete lesson plan

#### 3.4.3 Output Content
Generated lesson plan includes:
- Learning objectives
- Prior knowledge
- Teaching materials
- Teacher activities
- Learner activities
- Assessment
- Reflection
- Homework
- References

#### 3.4.4 Document Management
- Review and edit generated content
- Export as PDF
- Export as DOCX
- Print
- Share
- Duplicate
- Archive
- Auto-save to Supabase backend

### 3.5 Scheme of Learning Generator

#### 3.5.1 Input Form
User provides:
- Subject
- Grade/Class
- Term duration
- Curriculum standards
- Weekly teaching hours

#### 3.5.2 AI Generation
- Generate weekly teaching schedules for entire term
- Process through Supabase edge function

#### 3.5.3 Output Content
- Weekly breakdown of topics and activities
- Editable schedule structure
- Exportable format

#### 3.5.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.6 Notes Generator

#### 3.6.1 Input Form
User provides:
- Subject
- Topic
- Grade/Class
- Depth level
- Language

#### 3.6.2 AI Generation
- Generate structured teaching notes through Supabase edge function

#### 3.6.3 Output Content
Generated notes include:
- Definitions
- Examples
- Illustrations
- Activities
- Summary
- Practice questions

#### 3.6.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.7 Quiz Generator

#### 3.7.1 Input Form
User provides:
- Subject
- Topic
- Grade/Class
- Question types (Multiple choice, Essay, True/False, Matching, Fill-in-the-blank, Short answer)
- Number of questions per type
- Difficulty level

#### 3.7.2 AI Generation
- Generate quiz questions through Supabase edge function
- Auto-generate answer keys and marking guides

#### 3.7.3 Output Content
- Quiz questions organized by type
- Answer keys
- Marking guides

#### 3.7.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.8 Examination Generator

#### 3.8.1 Input Form
User provides:
- Subject
- Grade/Class
- Examination duration
- Total marks
- Topics to cover
- Question type distribution
- Bloom's Taxonomy level distribution

#### 3.8.2 AI Generation
- Generate complete examination paper through Supabase edge function

#### 3.8.3 Output Content
Complete examination includes:
- Instructions
- Sections
- Marks allocation
- Bloom's Taxonomy distribution
- Marking scheme

#### 3.8.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.9 Assignment Generator

#### 3.9.1 Input Form
User provides:
- Subject
- Topic
- Grade/Class
- Assignment type (Homework, Projects, Research tasks, Practical exercises, Group activities)
- Duration
- Learning objectives

#### 3.9.2 AI Generation
- Generate assignment through Supabase edge function

#### 3.9.3 Output Content
- Assignment instructions
- Tasks breakdown
- Submission requirements
- Evaluation criteria

#### 3.9.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.10 Rubric Builder

#### 3.10.1 Input Form
User provides:
- Assessment type
- Evaluation criteria
- Performance levels
- Grade/Class

#### 3.10.2 AI Generation
- Generate grading rubric through Supabase edge function

#### 3.10.3 Output Content
- Customizable criteria matrix
- Performance level descriptions
- Point allocation

#### 3.10.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.11 Report Comment Generator

#### 3.11.1 Input Form
User provides:
- Student name
- Subject
- Academic performance data
- Attendance record
- Behavior observations
- Teacher observations

#### 3.11.2 AI Generation
- Generate personalized report card comments through Supabase edge function

#### 3.11.3 Output Content
- Personalized comments addressing academic performance, attendance, behavior, and teacher observations

#### 3.11.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.12 Presentation Generator

#### 3.12.1 Input Form
User provides:
- Subject
- Topic
- Grade/Class
- Presentation duration
- Number of slides
- Key points to cover

#### 3.12.2 AI Generation
- Generate presentation content through Supabase edge function

#### 3.12.3 Output Content
Generated presentation includes:
- Slide titles
- Bullet points
- Speaker notes
- Suggested visuals

#### 3.12.4 Document Management
- Same as Lesson Planner (3.4.4)

### 3.13 Resource Library

#### 3.13.1 Core Functions
- Store all generated resources in Supabase storage
- Display resources in organized list/grid view

#### 3.13.2 Organization Features
- Search: Find resources by keyword
- Filters: Filter by resource type, subject, grade, date
- Categories: Organize by resource type (lesson plans, quizzes, exams, etc.)
- Favorites: Mark frequently used resources
- Tags: Add custom tags to resources

#### 3.13.3 Resource Actions
- Open and edit resources
- Export resources (PDF, DOCX)
- Share resources
- Delete resources
- Duplicate resources

### 3.14 Document Editor (Shared Component)

#### 3.14.1 Editing Functions
- Full text editing capability for all AI-generated content
- Format text (bold, italic, underline, lists, headings)
- Add/remove sections
- Rearrange content

#### 3.14.2 Auto-save
- Automatically save changes to Supabase backend during editing

## 4. Business Rules and Logic

### 4.1 AI Request Processing
- All AI generation requests must be processed through Supabase edge functions
- Edge functions protect API keys and handle AI service communication
- User inputs are validated before sending to edge functions

### 4.2 Document Auto-save
- All generated and edited documents automatically save to Supabase backend
- Save occurs during editing and upon completion
- Documents stored with metadata (creation date, last modified, resource type, tags)

### 4.3 Authentication Flow
- Users must complete email verification before accessing core features
- Google Authentication via Firebase Authentication provides alternative login method
- Supabase manages user sessions and authentication state

### 4.4 Resource Organization
- Each generated document automatically categorized by resource type
- Users can add custom tags and mark favorites
- Search and filter operations query Supabase database

### 4.5 Export and Share
- Export functions generate PDF or DOCX files from document content
- Share function creates shareable links or sends documents via email
- Print function formats document for printing

### 4.6 Theme Support
- App supports dark mode and light mode
- Theme preference saved to user profile in Supabase
- Theme applies consistently across all screens

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| AI generation fails | Display error message, allow user to retry |
| Network connection lost during generation | Save partial progress, prompt user to retry when connection restored |
| User attempts to access features without email verification | Redirect to email verification prompt |
| Export fails due to file size or format issues | Display error message with specific issue, suggest alternative format |
| User attempts to delete document | Show confirmation dialog before deletion |
| Search returns no results | Display \"No results found\" message with suggestion to adjust search terms |
| User inputs exceed character limits | Display validation error indicating maximum allowed characters |
| Supabase storage quota exceeded | Display storage limit warning, prompt user to delete old resources |
| Google Authentication fails | Display error message, offer alternative login via email/password |
| Auto-save fails | Display warning indicator, retry save automatically |

## 6. Acceptance Criteria

1. User registers account using email and password, completes email verification, and successfully logs in
2. User navigates to Lesson Planner, inputs required information (Subject, Grade/Class, Topic, Learning objectives, Duration, Curriculum, Teaching methodology, Difficulty level, Language), and generates complete lesson plan
3. User reviews generated lesson plan, edits content as needed, and exports as PDF
4. User navigates to Resource Library, searches for saved lesson plan, and successfully retrieves document
5. User opens saved lesson plan from Resource Library, duplicates it, edits duplicate, and saves changes

## 7. Out of Scope for Current Release

- iOS version (Android first, iOS later)
- Offline mode functionality
- Collaborative editing with other teachers
- Integration with Learning Management Systems (LMS)
- Student-facing features or student accounts
- Video or audio content generation
- Automated grading of student submissions
- Calendar integration with external calendar apps
- Multi-language interface (app UI in multiple languages)
- Advanced analytics and reporting dashboards
- Customizable AI model selection
- Bulk document generation
- Version history and document comparison
- Real-time collaboration features
- Integration with third-party educational content providers
- Gamification elements (badges, achievements, leaderboards)
- Social features (teacher community, resource sharing marketplace)
- Advanced permission management for shared resources
- Automated curriculum mapping
- AI-powered teaching recommendations based on student performance data