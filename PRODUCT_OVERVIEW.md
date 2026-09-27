# OneToOne LMS - Product Specification and Architectural Overview

## 1. Executive Summary

OneToOne LMS is a specialized, real-time learning management and interactive tutoring platform engineered specifically for one-to-one and small-group live education.

Unlike conventional enterprise learning management systems (LMS) that function primarily as asynchronous document repositories and submission portals, OneToOne LMS provides a live digital workspace. It brings high-definition video conferencing, a collaborative vector whiteboard, an integrated multi-language coding compiler, visual canvas-based assignment workflows, and structured post-session pedagogical reporting into a unified interface.

---

## 2. Platform Architecture and Technology Stack

- Frontend Framework: Next.js (App Router), React, TypeScript.
- Styling System: Tailwind CSS with customized component design tokens.
- Database and Data Layer: Supabase PostgreSQL utilizing JSONB documents with custom transactional SQL stored procedures (`lms_patch`) to ensure atomic element-level merges and optimistic concurrency control without flattening vector canvas structures.
- Live Code Execution Engine: Judge0 API routed through a same-origin `/api/code/run` server-side proxy supporting Python, JavaScript, C, C++, and Java with Base64 encoding.
- Video Communication: Embedded Jitsi Meet IFrame integration with cryptographically hashed host room tokens and lightweight 16-character access codes.
- Storage and Media: Supabase Storage API supporting uploads up to 50 MB with native in-app modal PDF rendering.

---

## 3. Comprehensive Feature Breakdown

### 3.1 Live Classroom Workspace
- Unified Learning Interface: Teachers and students interact in a single workspace with integrated video, dynamic toolbars, and synchronized workspaces.
- Seamless Mode Switching: Instant transitions between the interactive whiteboard canvas and the Computer Science live coding sandbox.
- Access and Permission Controls: Instructors can selectively delegate drawing permissions and code editing turns to individual learners or revoke them in group sessions.
- Real-Time Synchronization: Periodic background polling coupled with atomic row-level database patching preserves strokes, elements, and participant states even across network fluctuations.

### 3.2 Collaborative Digital Whiteboard
- Granular Stroke and Object Synchronization: Individual element tracking ensures that simultaneous strokes from different participants merge without collision.
- Comprehensive Tool Palette:
  - Freehand Pen and Highlighter with adjustable stroke widths and standard color palettes.
  - Geometric Vector Tools (Lines, Arrows, Rectangles, Circles with stroke and fill options).
  - Text Boxes and Resizable Sticky Notes for immediate conceptual annotations.
  - Direct Clipboard Image Pasting: Automatic server-side scaling, center positioning, and interactive selection for dragging and resizing.
- Question Cards: Formatted question blocks anchored directly to whiteboard coordinates, enabling structured problem-solving on the canvas.
- Panning and Zooming: Continuous canvas navigation via trackpad and mouse gestures without altering the fixed layout of the toolbar.
- Category Organization: Segregation of whiteboards into Live Class, Assignments, Homework, Practice, and Personal Work.

### 3.3 Computer Science Live Coding Laboratory
- Multi-Language Compiler Support: Integrated runtime environments for Python, JavaScript, C, C++, and Java with zero local configuration required by the student.
- Secure Execution: Server-side execution proxy with timeout limits, character thresholds, and standard input (stdin) support.
- Turn-Based Turnkey Editing: Clear visual indications of the active editor, allowing instructors to pass editing rights to students for live pair programming.
- Result Retention and Export: Source code, inputs, and execution logs persist with the session record and can be downloaded as source files.

### 3.4 Instant Video Conference Rooms
- Lightweight Join Mechanism: Instructors can generate ad-hoc video rooms protected by 16-character join codes, removing the need for pre-arranged roster links.
- Embedded Jitsi Integration: In-app video and audio streams with full device preview and mute controls.
- Cryptographic Host Token Security: Only the meeting creator holds host credentials to modify the shared board, manage participants, or terminate the conference.

### 3.5 Canvas-Based Assignment and Homework Lifecycle
- Visual Problem Distribution: Instructors assemble assignments containing visual questions, distributed to single students, specific cohorts, or entire classes.
- Dedicated Student Workspaces: Each recipient receives an isolated whiteboard copy populated with the question template to write out solutions.
- Stamp-Based Visual Assessment:
  - Instructors mark submissions using visual indicators: Correct, Incorrect, Star, and Review Needed.
  - Question-by-question scoring and rubric mark breakdowns.
  - Sticky feedback notes placed directly next to specific calculation steps.
- Submission Locking: Submissions automatically enter a read-only state upon student delivery, unlocking only after teacher review and score finalization.

### 3.6 Digital Resource Library and Media Hub
- Multi-Format Support: Storage for files (PDF, DOC, Images up to 50 MB) and structured external links (YouTube, web resources).
- Integrated PDF Viewer: Modal document reader enabling students and instructors to review reference material without leaving the application.
- Audience-Specific Distribution: Granular assignment of study resources to individual students or broadcast to the entire roster.

### 3.7 Post-Session Pedagogical Reporting
- Mandatory Class Close-out Reports: Instructors document every completed session with structured parameters:
  - Topic taught and detailed subtopics covered.
  - Student performance rating on a 1-to-5 scale.
  - Qualitative performance commentary and behavioral notes.
  - Homework assigned and recommended next steps.
- Learning Continuity: Provides students, parents, and administrative staff with a verifiable log of educational progression over time.

### 3.8 Multi-Role Governance and Administration
- Student Portal: Tailored dashboard displaying upcoming classes, active homework assignments, subject mastery metrics, and whiteboard history.
- Teacher Studio: Educator workspace for roster management, student claims, lesson scheduling, assignment construction, and grading queues.
- Admin Management Console (`/manage`, `/admin`): Centralized portal for user creation, teacher-student pairings, curriculum/subject configuration, and platform-wide audit logging.

---

## 4. Key Value Drivers (Why OneToOne LMS is Prominent)

1. Elimination of Tool Fragmentation:
   Standard online tutoring relies on a disparate collection of tools (Zoom for video, Miro for whiteboards, Google Classroom for homework, and Replit for programming). OneToOne LMS unifies these workflows into a single interface, eliminating context switching and link sharing overhead.

2. Visual Step-by-Step Assessment:
   Subjects like Mathematics, Physics, Chemistry, and Engineering cannot be adequately evaluated through text fields or multiple-choice questions. The platform preserves handwritten derivations, diagrammatic proofs, and visual problem solving from assignment issuance through to grading.

3. Low Friction Onboarding:
   Fast profile selection and join-code conferences enable frictionless lesson starts without complex software downloads or multi-step account authentications during pilot stages.

4. Built-In Educational Accountability:
   The platform links lesson scheduling, real-time classroom notes, recorded code, visual submissions, and structured post-session feedback into a continuous audit trail for educational institutions and parents.

---

## 5. Comparative Analysis: OneToOne LMS vs Existing Solutions

| Dimension | Traditional LMS (Canvas, Moodle, Google Classroom) | Video Conferencing (Zoom, MS Teams, Google Meet) | Standalone Whiteboards (Miro, Mural) | OneToOne LMS |
| :--- | :--- | :--- | :--- | :--- |
| Primary Objective | Asynchronous course administration & file storage | Generic video and audio communication | Open-ended business brainstorming & diagrams | Live 1:1 and small-group interactive education |
| Embedded Video Calling | No (requires external links) | Yes (core function) | No (requires third-party plugin) | Yes (integrated Jitsi video engine) |
| Interactive Canvas | No | Basic transient screen drawing | Yes (collaborative canvas) | Yes (synchronized canvas with granular write controls) |
| Homework and Grading | Static document uploads with text comments | None | None | Canvas-based student solutions with visual stamp evaluation |
| Live Coding Sandbox | No | None | None | Integrated multi-language compiler with turn-based editing |
| Instructor Turn Controls | N/A | Host mute / screen share rights only | Equal access or board lock | Granular write delegation and code-editor passing |
| Pedagogical Session Logs | Generic numerical gradebook entries | Call duration logs only | None | Structured reports (topics, 1-5 ratings, next session plans) |
| User Interface Complexity | High (multi-tier menus and separate modules) | Low (focused on video stream) | Moderate (complex infinite layout) | Tailored dual portals (Student Portal & Teacher Studio) |

---

## 6. Target Audience and Key Use Cases

- Private Tutors and Tutoring Centers: Conducting high-touch 1:1 sessions in STEM, languages, and humanities with clear progress tracking for parents.
- Coding Bootcamps and CS Instructors: Delivering live interactive programming lessons with collaborative debugging and turnkey execution.
- K-12 and Higher Education Remedial Programs: Providing personalized academic interventions where teachers annotate student work in real time.
- Test Preparation Academics: Distributing timed visual test papers and grading handwritten practice problems with precise rubrics.
