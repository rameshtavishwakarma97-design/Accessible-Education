# Accessible Education Platform — Product Requirements Document (PRD)
**Version:** 1.3
**Date:** February 23, 2026
**Owner:** Product Team
**Status:** Active — Supersedes v1.2
**Change Summary:** Fixes 8 critical gaps identified in design review: (1) Teacher delete content flow; (2) Admin course-assignment and enrollment workflows; (3) Admin layout and missing screens; (4) Dual enrollment model reconciliation; (5) Complete blind user journey with full ARIA/keyboard spec; (6) Assessment save-and-exit; (7) Announcement system; (8) Credential security note.

---

## 1. Executive Summary

### 1.1 Product Vision
An accessible, institute-scale education platform that enables students with disabilities (blind, deaf, hard-of-hearing, mute, ADHD, dyslexia, autism, cognitive, motor, and combinations thereof) to access educational content in formats that work for their specific needs — without being segregated into disability-specific systems — while supporting complex multi-level academic hierarchies (institutes, schools, departments, programs, years, divisions, sections) similar to large universities.

### 1.2 The Problem
- **Fragmented experience for students with multiple disabilities.** They juggle separate tools for Braille, captions, simplified text, etc.
- **High teacher burden.** Teachers manually create and manage multiple accessible versions of the same content.
- **Coverage and compliance gaps.** Institutes struggle to prove WCAG 2.1 AA/AAA compliance and track which content is accessible.
- **Structural complexity.** Large institutes have multiple colleges, programs, years, divisions, and elective structures that most tools ignore or hard-code.
- **Admin disempowerment.** Admins lack clear workflows to assign teachers to courses, enroll students, and manage platform settings — creating dependency on engineering teams.
- **Screen-reader inaccessibility.** Existing platforms declare WCAG compliance but fail blind users at the component level (custom dropdowns, icon-only labels, unmanaged focus).

### 1.3 The Solution
A unified, multi-tenant platform where:
- Students create **one accessibility profile** activating all relevant modules.
- Teachers upload content **once**; an engine converts to all required formats.
- **Admins have full operational control** — assigning teachers, enrolling students, configuring layout and settings — without any engineering support.
- **Every interactive element** is fully operable by keyboard and screen reader, tested against WCAG 2.1 AA/AAA at the component level.
- A configurable **hierarchy engine** models each institute without code changes.
- A **dual-track enrollment model** clearly separates admin-assigned core enrollments from student-selected electives.

### 1.4 Success Criteria
- **Accessibility Coverage:** 100% of published content available in all required formats within 5 minutes of upload (Tier-1).
- **Blind User Self-Service:** A blind student can complete their first full study session (login → profile → content → assessment) without any sighted assistance — verified by screen-reader-only user testing.
- **Teacher Efficiency:** 90% reduction in manual time spent on accessible content creation.
- **Admin Autonomy:** 95%+ of teacher assignments, enrollments, and settings changes completed by admins without engineering support.
- **User Adoption:** 50,000+ students and 100+ institutions within 12 months.
- **Compliance:** WCAG 2.1 AA/AAA certification with audit-ready reports.
- **Student Outcomes:** 20%+ improvement in course completion rates for students with disabilities.
- **Configurability:** 90%+ of new institutes onboarded without engineering changes.
- **Scalability:** 50+ concurrent institutes with distinct hierarchies and catalogs.

---

## 2. Target Users & Personas

### 2.1 Primary User Groups
- **Students with Disabilities (95,000 target):** Blind/Low Vision (32%), Deaf/Hard of Hearing (24%), Mute/Speech Impaired (9%), ADHD/Cognitive (45%), Multiple Disabilities (12% have 2+, 5% have 3+).
- **Teachers & TAs (5,000 target):** Inclusive classroom instructors needing efficient content tools.
- **Institute Administrators (1,000 target):** Registrars, program coordinators, accessibility coordinators, ERP/IT managers.

### 2.2 Personas
**Persona 1 — Maya (Deaf-Blind Student with ADHD)**
Age 17, High School Junior. Uses Braille display + screen reader (NVDA). Needs ALL of: Braille output, audio descriptions, simplified chunked text. Goal: one platform where everything works without help.

**Persona 2 — Prof. Johnson (Inclusive Teacher)**
Age 42, University Professor. 120 students, 18 with documented disabilities. Goal: upload once, trust the system to produce all formats. Needs to delete outdated content safely with impact awareness before confirmation.

**Persona 3 — Dr. Patel (Accessibility Coordinator / Admin)**
Age 55, District Administrator. 15 schools, 950 IEPs. Needs to prove WCAG compliance with data, manage user roles, assign teachers, and enroll students at scale — all without filing IT tickets.

**Persona 4 — Prof. Rao (Program Coordinator)**
Configures elective pools, assigns teachers to offerings per division, manages core course mappings for B.Tech CSE.

**Persona 5 — Ms. Sharma (ERP / Academic Operations Manager)**
Manages master hierarchy, imports bulk data from SIS/ERP, coordinates mid-term enrollment adjustments.

---

## 3. Core Domain Concepts

- **Institute Hierarchy:** Institute → School/College → Department → Program → Year → Division/Section.
- **Term:** Configurable academic terms (semesters/trimesters) tied to academic years.
- **Course:** Catalog entry (e.g., CS301 – Machine Learning) with metadata and prerequisites.
- **Course Offering:** Course taught in a specific term and context, e.g., "CS301 – ML – Spring 2026 – Year 3 – Div A, B". The central object for enrollment, content, assessments, and analytics.
- **Enrollment Track A (Admin-Assigned):** Core/mandatory course enrollment managed by admin or bulk import. Student cannot self-unenroll.
- **Enrollment Track B (Student-Selected):** Elective enrollment driven by student choice within admin-defined elective pools and rules. Admin retains override capability.
- **Content Item:** A file or resource scoped to one or more courseOfferings/sections, with original plus all converted accessible format files.
- **Soft Delete:** Content removal that hides the item from students and marks it as deleted, but retains the record for restoration. Permanent delete is a separate, admin-level action.
- **Accessibility Profile:** Per-student configuration of disabilities and preferences, driving modules, format defaults, and assessment accommodations.

---

## 4. Feature Set

1. Unified Accessibility Profile System
2. Automatic Content Conversion Engine
3. Accessible Content Viewer (with full ARIA/keyboard spec)
4. Multi-Modal Assessment System (with Save & Exit)
5. Accessible Communication Suite (with Announcements)
6. Teacher Content Management (with full Delete + Restore flow)
7. Admin Operational Control — Users, Courses, Assignments, Enrollment
8. Admin Dashboard & Analytics
9. Institute & Academic Hierarchy Management
10. Course Catalog, Offerings & Dual-Track Enrollment
11. Role-Based Access Control (RBAC)
12. Content Scoping & Targeting Engine
13. Blind User Journey Specification (new — cross-cutting)
14. Platform Settings & Configuration (new — previously unspecced)

---

## 5. Feature Details

---

### Feature 1: Unified Accessibility Profile System

**What:** One profile per student declaring disabilities, preferences, and devices. System activates relevant modules and defaults.

**User Stories:**
- As a deaf-blind student, I want to select both "deaf" and "blind" so the system activates captions AND audio navigation simultaneously.
- As a student with ADHD, I want to set my extended time multiplier once so all assessments automatically apply it.
- As a blind student, I want to configure my screen reader type so the platform adapts its ARIA announcements accordingly.

**Requirements:**
- Multi-select disability picker: Blind, Low Vision, Deaf, Hard of Hearing, Mute, Speech Impaired, ADHD, Dyslexia, Autism, Cognitive, Motor, Other.
- System activates modules: Blind/Low Vision → Visual Module; Deaf/HoH → Auditory Module; Mute → Communication Module; ADHD/Cognitive → Cognitive Module; Any disability → Navigation Module.
- Preferences: font size (0.5x–3.0x), TTS speed (0.5x–2.0x), extended time multiplier (1.0x–3.0x), contrast mode, preferred notification channels.
- Assistive device registration: screen reader type (NVDA, JAWS, VoiceOver, TalkBack), Braille display model (from autocomplete list of known models, not freetext), AAC device model.
- Profile syncs across devices; changes apply within 2 seconds.
- **NEW — First-Login Forced Setup:** On first login, if no accessibility profile exists, a full-screen modal intercepts all navigation and guides the student through profile setup before the main app shell is accessible. Modal has `role="dialog"`, `aria-labelledby="profile-setup-title"`, focus is trapped inside, and Escape does NOT close it (setup is required).
- Admin and teachers can see summary disability chips (disability type only, no clinical detail) for students within their scope.

**ARIA Requirements:**
- Disability multi-select: `role="listbox"` with `aria-multiselectable="true"`. Each option: `role="option"`, `aria-selected="true/false"`. Keyboard: Arrow keys to navigate, Space to toggle, no mouse required.
- Braille display dropdown: native `<select>` element or `role="combobox"` with autocomplete list. Arrow keys navigate options.
- All form fields have explicit `<label>` elements (not placeholder text as labels).
- On save: `role="alert"` region announces "Accessibility profile saved. Your modules are now active."

**Acceptance Criteria:**
- ✓ Student can select unlimited disabilities without a mouse.
- ✓ Selecting "Blind" + "ADHD" activates Visual + Cognitive + Navigation modules, confirmed by `aria-live` announcement.
- ✓ First-login modal traps focus and cannot be bypassed by keyboard.
- ✓ Profile persists after logout/login.
- ✓ Screen reader user can complete entire profile setup without sighted assistance (verified by automated axe-core + manual NVDA test).

**Metrics:**
- 90%+ of students with multiple disabilities use 2+ modules simultaneously.
- < 5% profile setup abandonment rate.
- 0 critical ARIA failures on profile setup flow in automated accessibility scans.

---

### Feature 2: Automatic Content Conversion Engine

**What:** On teacher upload, system converts content to all accessible formats and surfaces progress, failures, and review queues.

**User Stories:**
- As a teacher, I want to upload a PDF and have it available in audio, Braille, and simplified formats within 5 minutes.
- As a blind student, I want uploaded videos to have audio descriptions automatically generated.
- As a teacher, I want to review auto-generated Braille before students see it.

**Requirements:**
**Supported Input Formats:** PDF, DOCX, TXT, PPT, MP4, MOV, AVI, YouTube links, MP3, WAV, M4A, JPG, PNG, SVG, URLs.

**Tier 1 — Fully Automated (publish immediately once complete):**
- Text-to-Speech Audio (natural voice, configurable voice gender/accent per institute).
- Auto-Captions for video with speaker identification.
- Transcripts for all audio/video.
- High-Contrast PDF version.
- Basic AI-generated alt-text for images.

**Tier 2 — Automated + Teacher Review Required:**
- Grade 2 Braille with Nemeth Code for math.
- AI sign-language avatar video overlay.
- Simplified/chunked text (ADHD-optimized).
- Complex image descriptions (diagrams, charts, graphs).

**Tier 3 — Manual Upload (optional enhancement):**
- Human sign language interpreter video.
- Custom tactile graphic descriptions.
- Teacher-recorded audio narration.

**Conversion Pipeline:**
1. Teacher uploads file → system stores original in cloud storage.
2. Metadata extraction (word count, duration, language, image count).
3. Tier 1 jobs queued at HIGH priority, Tier 2 at NORMAL priority.
4. Tier 1 processing in parallel → complete within 5 minutes.
5. On Tier 1 completion → content published to students with notification.
6. Tier 2 processing in background → on completion, notify teacher for review.
7. Teacher approves/rejects Tier 2 → approved formats published to students.

**Acceptance Criteria:**
- ✓ Tier 1 completes within 5 minutes for 10-page PDF or 30-min video.
- ✓ Content not published until Tier 1 is complete.
- ✓ Teacher real-time progress bar during conversion (with `aria-live="polite"` for screen readers).
- ✓ Failed conversions notify teacher with specific error and fallback manual upload option.

**Metrics:** 95%+ Tier 1 success rate. < 10% Tier 2 rejection rate. < 2 min average teacher review time.

---

### Feature 3: Accessible Content Viewer

**What:** Unified viewer for students to consume content in their preferred format, with complete keyboard and screen-reader support.

**User Stories:**
- As a low-vision student, I want font size auto-applied from my profile.
- As a deaf student, I want to switch between captions and transcript while watching a video.
- As a student with ADHD, I want content chunked into sections with a progress indicator.
- As a blind student, I want full keyboard control over all viewer controls so I never need a mouse.

**Requirements:**

**Format Selector:**
- Dropdown showing all available formats: Original, Audio, Captions, Transcript, Simplified, High-Contrast, Braille.
- Auto-selects based on accessibility profile on first open; user override persists per content item.
- **ARIA Spec:** If custom dropdown, implement as `role="combobox"` (closed state) expanding a `role="listbox"`. `aria-expanded="true/false"` on trigger. Each option `role="option"`, `aria-selected`. Keyboard: Enter/Space opens, Arrow keys navigate options, Enter selects, Escape closes and returns focus to trigger.
- If native `<select>` is used for format selector, that is also acceptable and preferred for screen reader compatibility.

**Playback Controls — Audio:**
- Play/Pause toggle: `aria-label` toggles between "Play" and "Pause".
- Speed: `role="slider"`, `aria-valuemin="0.5"`, `aria-valuemax="2.0"`, `aria-valuenow`, `aria-valuetext` (e.g., "Speed: 1.5x"). Arrow keys adjust in 0.25x steps.
- Skip forward/back 15s: `aria-label="Skip forward 15 seconds"` / `aria-label="Skip back 15 seconds"`.
- Volume: `role="slider"` with `aria-valuetext="Volume: 70%"`.

**Playback Controls — Video:**
- Same as audio controls, plus Captions toggle: `aria-label` toggles "Enable captions" / "Disable captions", `aria-pressed="true/false"`.
- Sign language toggle: `aria-label="Show sign language overlay"`, `aria-pressed`.
- Quality selector: native `<select>` labelled "Video quality".

**Text Controls:**
- Font size slider: `role="slider"`, `aria-valuetext="Font size: 1.5x"`. Arrow keys adjust in 0.1x steps.
- Contrast toggle: `aria-label="Enable high contrast"`, `aria-pressed`.
- Line spacing toggle: `aria-label="Increase line spacing"`, `aria-pressed`.
- TTS toggle: `aria-label="Read aloud"`, `aria-pressed`.

**Focus Mode Toggle:**
- Hides left nav when enabled. Must set left nav `aria-hidden="true"` AND `display:none` (not just `visibility:hidden`) so it is removed from accessibility tree.
- `aria-label="Enable focus mode — hides navigation"`, `aria-pressed`.

**Braille Integration:**
- Platform outputs a structured HTML reading stream to a dedicated `<div aria-live="polite" aria-atomic="false">` region that screen-reader + Braille display software (NVDA, JAWS) can render on a connected Braille display.
- No proprietary driver or device registration is required. The platform relies on the OS accessibility layer. The device registration in the profile is informational (to customize output format) but not a technical connection requirement.

**Progress Tracking:** Auto-saves every 30 seconds. Resume prompt on return: "Resume from page 7?" announced via `role="alert"`.

**Chunking (Cognitive Module):** "Section 3 of 8" indicator with `aria-live="polite"` updates.

**Skip Navigation:** First focusable element on every page is a visually hidden "Skip to main content" link that becomes visible on focus. `href="#main-content"`. The `<main id="main-content">` landmark is present on all pages.

**Acceptance Criteria:**
- ✓ Format selector fully operable by keyboard only.
- ✓ All sliders operable by arrow keys with correct ARIA value announcements.
- ✓ Focus Mode removes nav from accessibility tree (verified by accessibility tree inspection).
- ✓ Skip navigation link present on all pages and functional.
- ✓ Progress auto-saves every 30 seconds.
- ✓ axe-core automated scan returns 0 critical or serious violations on the viewer page.

**Metrics:** 70%+ students use non-original formats. < 5% format switching errors. 80%+ students resume from saved position.

---

### Feature 4: Multi-Modal Assessment System

**What:** Assessments supporting text, audio, video, and file submissions with auto-applied time extensions, full keyboard support, and a save-and-exit capability.

**User Stories:**
- As a mute student, I want to record a sign language video response.
- As a blind student, I want questions read aloud and to submit via keyboard only.
- As a student with ADHD, I want my quiz time automatically extended without asking.
- As a student with motor disabilities, I want to save my progress and resume an in-progress assessment if I fatigue.

**Requirements:**

**Question Types:** Multiple Choice, True/False, Short Answer, Essay, File Upload, Audio Response, Video Response.

**Accessibility Features:**
- Extended time: auto-applied from profile (`baseLimitMinutes * extendedTimeMultiplier`). Displayed to student BEFORE starting.
- TTS for questions: each question text is inside a `<p>` with an associated TTS play button (`aria-label="Read question 3 aloud"`).
- Multiple submission formats per question (text OR audio OR video).
- All interactions keyboard-operable (no mouse required).

**ARIA Spec — MCQ:**
- `role="radiogroup"` wraps all options with `aria-labelledby` pointing to the question text.
- Each option: `role="radio"`, `aria-checked="true/false"`. Keyboard: Arrow keys navigate within group, Tab moves to next group.

**ARIA Spec — Timer:**
- Timer displays in top bar. `aria-label="Time remaining: 45 minutes"` updated each minute (not each second, to avoid overwhelming screen reader).
- At 15 min, 10 min, and 5 min remaining: `role="alert"` region announces "15 minutes remaining."
- Continuous live timer does NOT use `aria-live` (to avoid constant interruption). Only milestone announcements.

**ARIA Spec — Question Navigator:**
- Right panel shows per-question status. Each question represented as a button: `aria-label="Question 4: answered"` / `aria-label="Question 6: flagged, not yet answered"`.

**NEW — Save & Exit:**
- Students can save progress mid-assessment and exit. Assessment enters "In Progress — Saved" state.
- Time continues running while exited (timer is server-side, not client-side).
- On return, student sees saved responses and remaining time. Auto-resumes.
- Student is shown: "Warning: Timer continues while you are away. Time remaining: 38 minutes."
- If timer expires while student is away, assessment is auto-submitted with all saved answers.

**Submission Confirmation:**
- Submit button opens a confirmation modal: "You are about to submit. Questions answered: 9/10. Question 4 is unanswered. Are you sure?"
- Modal has `role="alertdialog"`, `aria-labelledby="submit-confirm-title"`, focus trapped inside. Two buttons: "Submit" (primary) and "Go back to review" (secondary).
- Escape key closes modal and returns to assessment (does NOT submit).

**Acceptance Criteria:**
- ✓ Students see adjusted time before starting.
- ✓ MCQ operable by arrow keys with correct role/aria-checked.
- ✓ Timer milestones announced by screen reader.
- ✓ Save & Exit persists all answers server-side.
- ✓ Submit confirmation modal has focus trap and Escape-to-cancel.
- ✓ Auto-submission on timeout sends all saved answers.

**Metrics:** 30%+ submissions use non-text formats. < 1% auto-grading errors. 95%+ student satisfaction with fairness of accommodations.

---

### Feature 5: Accessible Communication Suite

**What:** Messaging, announcements, and real-time calls with format conversions for all disabilities.

**User Stories:**
- As a deaf student, I want my sign language video message auto-captioned for my teacher.
- As a blind student, I want screen reader announcement of new messages without page refresh.
- As a teacher, I want to send one announcement delivered to each student in their preferred format.

**Requirements:**

**Messaging:** Text, audio, video, file attachment. Audio → transcript within 30 seconds. Video → captions within 1 minute. Text → TTS on demand.

**NEW — Announcements (distinct from Messages):**
- Announcements are one-to-many, teacher/admin to students. They are NOT two-way threads.
- Teacher nav has a top-level "Announcements" item (separate from "Messages").
- Admin can also send institute-wide or program-level announcements.
- Announcement scoping uses the same targeting engine as content (courseOffering, division, program, institute-wide).
- Announcements delivered via: in-app notification, email (formatted for screen readers with plain text alternative), SMS (if enabled).
- Students see an "Announcements" section on their Dashboard and Course Detail pages.
- Announcements support rich text, file attachments, and scheduled publishing.
- **ARIA:** New announcements in feed trigger `role="status"` update (polite). Urgent announcements (teacher-flagged) trigger `role="alert"` (assertive).

**Notifications:**
- Visual flash alerts for deaf students. Audio chime for blind students (respects system sound settings). Vibration on mobile.
- All in-app notifications also appear in a `<div role="log" aria-live="polite">` region for screen reader users.

**Acceptance Criteria:**
- ✓ Audio messages transcribed within 30 seconds.
- ✓ Announcement system is separate from Messages in nav with its own route.
- ✓ Announcements deliverable scoped to courseOffering, section, or institute-wide.
- ✓ Screen reader announces new messages via `aria-live` without page refresh.

**Metrics:** 50%+ messages use audio or video. 90%+ transcription accuracy. < 2 second caption latency.

---

### Feature 6: Teacher Content Management

**What:** Teacher dashboard for uploading, managing, reviewing conversions, and deleting content — with a safe, impact-aware delete flow.

**User Stories:**
- As a teacher, I want to upload once and publish to multiple sections.
- As a teacher, I want to delete outdated content, but I want to see which students are currently accessing it before I confirm.
- As a teacher, I want to restore accidentally deleted content within 30 days.
- As a teacher, I want to see my Conversion Queue in one place without navigating away from my course.

**Requirements:**

**Upload Flow:** (unchanged from v1.2 — drag-and-drop, batch upload, academic scoping, publish options).

**Content Library:**
- Status indicators: Published, Draft, Converting, Review Required, Soft-Deleted.
- Actions per row: Preview, Edit, Duplicate, Review Conversions, **Delete**.
- Edit: cannot rescope to a courseOffering the teacher is not assigned to (validated on save).
- **Delete Flow (full specification):**
  1. Teacher clicks "Delete" (Danger button variant).
  2. System queries: active viewers in last 24 hours (from analytics), total students who have viewed this item, any assessments that link to this item as a reference.
  3. Pre-delete impact modal appears:
     - Title: "Delete [Content Title]?"
     - Body shows: "This content has been viewed by X students. Y students have it in their progress history. Z assessments reference it."
     - If any assessment references this content: "WARNING: This content is referenced by [Assessment Name]. Deleting it will not delete the assessment, but students will lose access to the reference material."
     - Two actions: "Move to Trash" (soft delete, default) and "Cancel".
     - "Move to Trash" is the ONLY delete action available to teachers. Permanent delete is admin-only.
  4. On confirmation: content `publishStatus` set to `SOFT_DELETED`. Removed from all student views immediately.
  5. Students who had this in their in-progress reading list receive a notification: "[Content Title] from [Course Name] has been removed by your teacher."
  6. Content remains in teacher's "Trash" tab for 30 days before automatic permanent deletion.
  7. Teacher can restore from Trash at any time within 30 days. On restore, content returns to its previous publishStatus (Published or Draft) and students are re-notified.

**Trash Tab:**
- Accessible from Content Library via "Trash" filter or dedicated tab.
- Shows soft-deleted items with: title, deletion date, days remaining before permanent deletion, Restore button, and Permanent Delete button (with second confirmation).

**Conversion Queue:**
- Accessible from teacher dashboard (summary card) AND from `/teacher/conversions` (full page). Actions on either view update the same state in real time.

**Acceptance Criteria:**
- ✓ Delete action shows impact modal before confirmation.
- ✓ Impact modal lists student view count, active progress records, and linked assessments.
- ✓ Soft delete removes content from student view within 5 seconds.
- ✓ Students receive in-app and email notification of content removal.
- ✓ Restore from Trash returns content to previous state.
- ✓ Permanent delete requires second explicit confirmation and is irreversible.
- ✓ Teacher cannot permanently delete content (only move to trash). Permanent delete requires admin role.

**Metrics:** 90%+ Tier 2 approvals. < 3 min average review time. 80%+ teachers use analytics monthly.

---

### Feature 7: Admin Operational Control (NEW — previously unspecced)

**What:** Admin-exclusive workflows for assigning teachers to course offerings, enrolling students to courses, and managing all user accounts. These are the primary daily-operations tools for institute staff.

**Business Value:** Eliminates the current critical gap where no UI exists to wire teachers to courses or students to enrollments — making the platform non-functional without these flows.

#### 7.1 User Management

**Route:** `/admin/users`

**Screen Layout:**
- Filter bar: Role (All, Student, Teacher, TA, Admin), Program, Year, Division, Search by name/email.
- Table: Name | Email | Role | Program/Year/Division | Status (Active/Inactive) | Accessibility Profile (chip summary) | Actions.
- Row actions: Edit, Deactivate, Reset Password, View Accessibility Profile (gated permission).
- Top actions: "Bulk Import CSV", "Add User Manually", "Export List".

**Bulk Import:**
- Upload CSV for students, teachers, or admins.
- System validates before saving: duplicate emails, invalid program/division references, missing required fields.
- Preview screen shows: "200 users will be created. 3 errors found." with inline error details per row.
- On confirm: users created, welcome emails sent with login instructions.

**Add User Manually:**
- Modal: Name, Email, Role, Program/Year/Division (for students), Department (for teachers), Password (auto-generated or set).

**Deactivate User:** Soft deactivation — user cannot log in but all historical data (enrollment, progress, submissions) preserved. Used for graduation, transfer, withdrawal.

**Teacher Workload View:**
- On a teacher's user profile: shows all currently assigned courseOfferings with student count and pending Tier-2 review count. Helps admin identify overloaded teachers who may cause Braille/Simplified delays.

#### 7.2 Teacher-to-Course Assignment

**Route:** `/admin/courses/:offeringId/teachers` (accessible from Admin Courses table → row action "Manage Teachers")

**This is the authoritative workflow for populating `courseOfferings.teachers[]`.**

**Screen Layout:**
- Header: Course code + name + term + program/year/divisions.
- Section: "Assigned Teachers" — table of currently assigned teachers with their section(s) and actions (Remove, Edit sections).
- Section: "Add Teacher" — search field (name or email), results list, section selector, Assign button.

**Flow:**
1. Admin searches for teacher by name or email.
2. Selects teacher from results.
3. Chooses which sections this teacher will handle (e.g., "Div A and Div B" or "All sections").
4. Clicks "Assign". System adds to `courseOfferings.teachers[]` with section mapping.
5. Teacher receives notification: "You have been assigned to [Course Name] – [Term] – [Sections]. You can now upload content and manage assessments for this course."
6. Teacher's RBAC scope is immediately updated (within 1 minute).

**Rules:**
- A courseOffering can have multiple teachers (different sections or co-teaching).
- Removing a teacher does NOT delete their previously uploaded content. Content is orphaned to the courseOffering and remains accessible to students.
- Admin can reassign orphaned content to another teacher.

#### 7.3 Student Enrollment (Dual-Track)

**Route:** `/admin/enrollment`

**Track A — Admin-Assigned (Core Courses):**
- Admin creates enrollments for mandatory courses for entire cohorts.
- "Bulk Enroll" action: select Program + Year + Division + Term + CourseOffering → system enrolls all active students in that cohort.
- Or: select individual students via search and enroll them into a specific courseOffering + section.
- Students enrolled this way have `enrollmentType: ADMIN_ASSIGNED`. They cannot self-unenroll (UI hides unenroll option for these).
- Admin can forcibly remove a student from a Track A enrollment (with reason and audit log entry).

**Track B — Student-Selected (Electives):**
- Admin first configures elective pools (Feature 10 — Elective Groups).
- Students see the elective selection screen and make their choices within allowed pools, deadlines, and capacity limits.
- Admin can override: force-enroll a student into an elective (bypassing capacity limits with a reason), or move a student between elective sections.
- Admin can see all pending, confirmed, and waitlisted elective registrations in a table filterable by program/year/division.

**Enrollment Dashboard:**
- Route: `/admin/enrollment`
- Tabs: "Core Enrollments" | "Elective Enrollments" | "Waitlists" | "Bulk Import"
- Core Enrollments tab: filter by term/program/year/division; table showing courseOffering, enrolled count, total capacity, % filled.
- Elective Enrollments tab: filter by elective group; show each student's selection status (pending, confirmed, waitlisted).
- Waitlists tab: ordered waitlist per courseOffering section; admin can manually promote waitlisted students.
- Bulk Import tab: CSV upload for enrollment data from SIS/ERP with validation.

**Acceptance Criteria:**
- ✓ Admin can assign a teacher to a courseOffering and specific sections in < 2 minutes.
- ✓ Teacher receives notification of assignment within 1 minute.
- ✓ Teacher's content upload scope unlocks immediately after assignment.
- ✓ Admin can bulk-enroll an entire cohort (program + year + division) into a core course in one action.
- ✓ Students cannot self-unenroll from Track A (admin-assigned) enrollments.
- ✓ Admin can force-enroll or remove students from any enrollment track with audit log.
- ✓ Enrollment dashboard shows real-time capacity and waitlist status.

**Metrics:** 95%+ of teacher assignments done by admin without engineering support. < 2% enrollment errors per term.

---

### Feature 8: Admin Dashboard & Analytics

**What:** Institute-wide dashboard for monitoring accessibility compliance, conversion health, and usage analytics.

**Route:** `/admin/dashboard`

**Layout (clarified from v1.2):**
- Top strip: stat cards — Total Students, Students with Disabilities, Total Teachers, Content Items, Content Accessibility Coverage %, Conversion Failure Rate.
- Left panel: Hierarchy tree (interactive — clicking a node filters all panels to that scope).
- Center panel: Accessibility Metrics charts — disability type breakdown, format usage (audio vs Braille vs simplified vs original), module activation rates.
- Right panel: Alerts — content missing formats, failed conversions, students with IEPs not yet mapped to courses.

**Drill-Down:** All charts respond to hierarchy node selection. Admin can drill from institute-wide → school → department → program → year → division.

**Conversions Monitor:** `/admin/conversions` — table of all conversion jobs across the institute, filterable by status (failed, in-progress, completed), format type, program, term. Shows linked content and teacher for remediation.

**Reports:** Compliance report (WCAG status per content item), accessibility gap report (content missing formats), enrollment + disability analytics report. All exportable as PDF/CSV.

**Acceptance Criteria:**
- ✓ Dashboard loads within 3 seconds.
- ✓ Hierarchy tree filters all dashboard panels.
- ✓ Compliance report exportable as PDF with one click.
- ✓ Audit logs show all access to student disability data.

---

### Feature 9: Institute & Academic Hierarchy Management

(Unchanged in behavior from v1.1/v1.2 — all entity CRUD, configurable levels, soft-delete with history.)

**Clarification added:** Admin can click any hierarchy node in the tree and see an inline action panel: Edit name, Add child node, Retire node. Previously this interaction was unspecified.

---

### Feature 10: Course Catalog, Offerings & Dual-Track Enrollment

**Dual-Track Enrollment Model (reconciled):**

The platform supports both enrollment patterns. The key distinction is `enrollmentType`:

| Property | Track A (Core) | Track B (Elective) |
|---|---|---|
| Who initiates | Admin or bulk CSV import | Student (within admin-defined pool) |
| Can student unenroll? | No | Yes, before deadline |
| Can admin override? | Yes (with audit log) | Yes (force-enroll or remove) |
| Prerequisite checking | Enforced | Enforced |
| Capacity limits | Not enforced (admin decides) | Enforced |
| Waitlist support | No | Yes |

Elective selection UI is a dedicated student-facing screen under Courses → Enrollment. Core course assignments appear automatically in "My Courses This Term" with no student action required.

---

### Feature 11: Role-Based Access Control (RBAC)

**Permission Matrix (clarified):**

| Action | Institute Admin | Program Coordinator | Teacher | TA | Student |
|---|---|---|---|---|---|
| Assign teacher to courseOffering | ✓ | ✓ (own program) | ✗ | ✗ | ✗ |
| Enroll students (Track A) | ✓ | ✓ (own program) | ✗ | ✗ | ✗ |
| Enroll self in elective (Track B) | ✗ | ✗ | ✗ | ✗ | ✓ |
| Upload content | ✗ | ✗ | ✓ (assigned offerings only) | ✓ (assigned sections) | ✗ |
| Soft-delete own content | ✗ | ✗ | ✓ | ✗ | ✗ |
| Permanently delete content | ✓ | ✗ | ✗ | ✗ | ✗ |
| Approve Tier 2 conversions | ✗ | ✗ | ✓ | ✓ | ✗ |
| View student disability profiles (summary) | ✓ | ✓ (own program) | ✓ (own students) | ✓ (own sections) | ✗ |
| Configure institute settings | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage hierarchy | ✓ | ✗ | ✗ | ✗ | ✗ |
| View compliance reports | ✓ | ✓ (own program) | ✗ | ✗ | ✗ |

---

### Feature 12: Content Scoping & Targeting Engine

(Unchanged from v1.1 in targeting logic. Scope types: institute-wide, school, department, program, academic year, division/section, courseOffering, individual students.)

---

### Feature 13: Blind User Journey Specification (NEW)

**What:** A complete, step-by-step specification of what a blind student experiences from first browser visit to content consumed — with every ARIA requirement called out. This is a cross-cutting requirement that informs every other feature.

**Governing Rule:** Every screen the blind user touches must pass a screen-reader-only usability test (no mouse, no vision). A blind student who has never used this platform before must be able to complete all primary workflows unassisted.

#### 13.1 Page-Level Requirements (All Pages)

- **Skip Navigation Link:** First focusable element on every page. Visually hidden until focused. `<a href="#main-content" class="skip-link">Skip to main content</a>`. On click, focus moves to `<main id="main-content">`.
- **Page Title:** Every page has a unique `<title>` element: "Dashboard — Accessible Education Platform", "CS301 Content — Accessible Education Platform", etc. Screen readers announce page title on navigation.
- **Landmarks:** Every page has `<header>`, `<nav aria-label="Main navigation">`, `<main>`, `<footer>`. No content floats outside landmarks.
- **Focus Order:** Logical left-to-right, top-to-bottom order. Tab sequence matches visual reading order.
- **Focus Indicator:** 2px `outline` in `accent.primarySoft` color on ALL focusable elements. Never `outline: none` without a replacement indicator.
- **Navigation Icons:** All SVG icons in nav have `aria-hidden="true"` because the adjacent text label is present. If icon-only (no visible text), icon needs `aria-label` or `<title>` inside SVG.
- **Active Nav Item:** `aria-current="page"` on the active nav link.

#### 13.2 Login Page

- `<main>` landmark wraps login card.
- Email field: `<label for="email">Email address</label>` + `<input id="email" type="email" autocomplete="email">`.
- Password field: `<label for="password">Password</label>` + `<input id="password" type="password" autocomplete="current-password">`.
- Submit button: `<button type="submit">Sign in</button>`. Not a `<div>` or `<a>`.
- Error messages: `aria-live="assertive"` region below the form announces errors ("Incorrect email or password") without page reload.
- "Accessibility settings before login" link: links to `/pre-login-accessibility` — a fully specified page (see 13.3).
- Logo `<img>` has `alt="Accessible Education Platform logo"`.

#### 13.3 Pre-Login Accessibility Page (/pre-login-accessibility)

**This page is new and must be built.** It allows a blind user to configure display settings before seeing their profile.

- Route: `/pre-login-accessibility`
- Accessible without authentication.
- Controls: font size selector (native `<select>`), contrast mode toggle (`<input type="checkbox">`), TTS demo (a "Play sample text" button with inline `<audio>` player).
- These settings stored in localStorage and applied on login page and beyond until overridden by full profile.
- `<h1>` reads: "Accessibility Settings — Pre-Login". Page title: "Accessibility Settings — Accessible Education Platform".

#### 13.4 First Login — Profile Setup Modal

- As specified in Feature 1: focus trapped, Escape disabled, `role="dialog"`, `aria-labelledby="profile-setup-title"`.
- On modal open: focus moves to `<h2 id="profile-setup-title">Set Up Your Accessibility Profile</h2>`.
- Progress indicator: "Step 1 of 3: Select your disability types" — announced via `aria-label` on the step indicator.
- Step navigation buttons: "Next" / "Back" / "Save Profile". All `<button>` elements.

#### 13.5 Main Dashboard (Blind User)

- Page title: "Dashboard — Accessible Education Platform".
- Skip link present and functional.
- `<nav aria-label="Main navigation">` with `aria-current="page"` on Dashboard link.
- "My Courses This Term" card: `<section aria-labelledby="my-courses-heading">` with `<h2 id="my-courses-heading">My Courses This Term</h2>`.
- Each course card is a `<article>` or `<li>` with a descriptive `aria-label` (e.g., "CS301 Machine Learning, Spring 2026, Division A, 3 unread content items").
- "Accessibility Profile Summary" card: `<section aria-labelledby="profile-summary-heading">`. "Edit Profile" link has `aria-label="Edit your accessibility profile"`.
- Breadcrumb: `<nav aria-label="Breadcrumb"><ol>...</ol></nav>` with `aria-current="page"` on last item.

#### 13.6 Navigating to Content (Blind User)

- Student presses Tab to navigate to "Courses" in nav. Presses Enter. Page loads.
- Course list: each course card has a "View course" button/link with `aria-label="View CS301 Machine Learning, Spring 2026"`.
- On Course Detail page: Tabs (Overview, Content, Assessments, Messages) implemented as `role="tablist"` + `role="tab"` + `role="tabpanel"`. Active tab: `aria-selected="true"`. Arrow keys switch tabs. Tab key moves into tab panel.
- Content table: `<table>` with `<th scope="col">` headers. Each row action button has `aria-label` referencing the item title (e.g., `aria-label="Open Lecture 5 Introduction to ML"`).
- Format icons in table: `aria-hidden="true"` (decorative). A visually hidden text list in the cell reads "Available formats: Audio, Captions, Braille" for screen readers.

#### 13.7 Content Viewer (Blind User)

- All controls as specified in Feature 3 ARIA spec.
- On viewer load: `role="alert"` announces: "Lecture 5 loaded. Audio format selected based on your profile. Press Space to play."
- If Braille is selected: "Braille format ready. Your Braille display will render the content."
- Format selector: first focusable item after Skip link in viewer context.

#### 13.8 Assessment (Blind User)

- All controls as specified in Feature 4 ARIA spec.
- On assessment load: `role="alert"` announces: "Machine Learning Quiz. 10 questions. Time allowed: 60 minutes (your extended time: 2.0x applied). Press Enter on any question to answer it."
- MCQ: `role="radiogroup"` + `role="radio"` as specified.
- Navigation: blind user can Tab through questions, use arrow keys within MCQ groups, press Enter on question navigator buttons to jump.

#### 13.9 Messaging & Announcements (Blind User)

- New message indicator: `<div role="log" aria-live="polite" aria-label="Messages">` receives new message entries automatically.
- New announcement: `role="status"` (polite) for normal announcements; `role="alert"` (assertive) for urgent ones.
- Message thread: chronological `<ol>` list. Each message is an `<li>` with sender name, timestamp, and content as readable text.

**Acceptance Criteria:**
- ✓ A blind user (using NVDA + Chrome) can complete login, profile setup, find a course, open content, and play audio — without any mouse interaction, in a user testing session.
- ✓ axe-core automated scan returns 0 critical violations on all primary screens.
- ✓ All custom interactive components (custom dropdowns, sliders, tabs, modals) have correct ARIA roles and keyboard behavior.
- ✓ Every page has a unique `<title>`, skip navigation link, and ARIA landmarks.
- ✓ No screen uses color alone to convey information.

---

### Feature 14: Platform Settings & Configuration (NEW — previously unspecced)

**What:** Admin-accessible settings panel for institution configuration, branding, API keys, and integrations.

**Route:** `/admin/settings`

**Tabs:**

**Institution:**
- Institution name, logo upload, primary domain, default language, academic year start month.
- Tenant branding: primary color override (validated for WCAG contrast automatically).

**Academic Structure:**
- Hierarchy level configuration (enable/disable levels, rename labels, set required/optional).
- Term configuration: define academic years and term periods.
- Enrollment policies: enable/disable student self-enrollment for electives, set elective selection deadline.

**API & Integrations:**
- TTS API key (masked, show/hide toggle).
- Captions API key (masked).
- Braille conversion library version.
- LMS integration hooks (URL + auth token fields).
- SSO configuration (SAML/OAuth endpoint fields).

**Notifications:**
- Email SMTP configuration (host, port, from address).
- SMS gateway configuration.
- Default notification preferences by role.

**Security:**
- Session timeout duration.
- Password policy (minimum length, complexity).
- Audit log retention period.

**Cost Tracking:**
- Read-only view of API usage (TTS characters processed, video minutes captioned, Braille pages generated) for the current billing period.
- Breakdown by school/program.

**Acceptance Criteria:**
- ✓ All API keys stored encrypted; displayed masked (e.g., "sk-••••••••7f3a").
- ✓ Branding color change validates WCAG contrast before saving; rejects non-compliant colors with explanation.
- ✓ Hierarchy label changes reflect across all breadcrumbs and dropdowns within 2 minutes.
- ✓ Settings page accessible by keyboard (all inputs and tabs navigable without mouse).

---

## 6. Accessibility Modules (Detailed)

### Module 1 — Visual Accessibility Module
**Activates when:** Blind or Low Vision selected.
- Screen reader optimization: semantic HTML, ARIA labels on all interactive elements, focus management.
- TTS for all content (natural voice, adjustable speed 0.5x–2.0x).
- Braille display output via OS accessibility layer.
- High-contrast mode (dark, light, customizable via settings).
- Font size 0.5x–3.0x.
- Audio descriptions for videos.
- Image alt-text (AI-generated; complex images teacher-reviewed).
- **UI:** Minimum 44×44px tap targets. 3px visible focus outline. Skip links on all pages. ARIA landmarks on all pages.

### Module 2 — Auditory Accessibility Module
**Activates when:** Deaf or Hard of Hearing selected.
- Auto-generated captions for all video (synchronized).
- Transcripts for all audio/video (searchable, downloadable).
- Sign language overlay (AI avatar or human interpreter).
- Visual notification alerts (flash border, toast).
- Speaker identification in captions.
- **UI:** Captions on by default. Visual indicators for all audio events.

### Module 3 — Communication Accessibility Module
**Activates when:** Mute or Speech Impaired selected.
- All interactions text-based; no verbal requirements.
- AAC device integration.
- Sign language video upload for responses.
- **UI:** Microphone inputs hidden/disabled.

### Module 4 — Cognitive Accessibility Module
**Activates when:** ADHD, Dyslexia, or Cognitive selected.
- Simplified UI (reduced clutter).
- Content chunking (2–3 sentences per section with headings).
- Focus mode (hide sidebar, notifications).
- Extended time on assessments.
- Dyslexia font option (OpenDyslexic).
- Progress indicators on all multi-step content.
- **UI:** One task per screen. Large clear buttons. Frequent auto-save confirmations.

### Module 5 — Navigation Accessibility Module
**Activates when:** Any disability selected.
- Full keyboard-only navigation.
- Skip links on all pages.
- Visible focus indicators.
- Breadcrumb navigation.
- Focus trap in modals.
- Escape closes dialogs.
- `aria-live` regions for dynamic content updates.

---

## 7. ARIA Component Reference (new — for development use)

| Component | Role | Key ARIA Attributes | Keyboard Behavior |
|---|---|---|---|
| Custom dropdown | combobox (closed) / listbox (open) | aria-expanded, aria-haspopup | Enter opens, Arrow keys navigate, Enter selects, Escape closes |
| Multi-select picker | listbox | aria-multiselectable="true" | Arrow keys navigate, Space toggles selection |
| Tab group | tablist + tab + tabpanel | aria-selected, aria-controls, id | Arrow keys switch tabs, Tab enters panel |
| Modal dialog | dialog | aria-labelledby, aria-modal="true" | Focus trapped, Escape closes (unless forced) |
| Alert dialog | alertdialog | aria-labelledby, aria-describedby | Focus trapped, Escape cancels (does not confirm) |
| Slider | slider | aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext | Arrow keys adjust value |
| Toggle button | button | aria-pressed="true/false" | Enter/Space toggles |
| Radio group | radiogroup + radio | aria-labelledby, aria-checked | Arrow keys navigate within group, Tab exits group |
| Live feed | log | aria-live="polite", aria-label | New entries appended, screen reader announces |
| Alert message | alert | (implicit aria-live="assertive") | Announced immediately on insertion into DOM |
| Status message | status | (implicit aria-live="polite") | Announced when screen reader is idle |
| Breadcrumb | nav | aria-label="Breadcrumb" | Last item: aria-current="page" |
| Data table | table | aria-label or caption | th scope="col"/"row" for all headers |

---

## 8. Non-Functional Requirements

- **Performance:** Dashboard loads < 3s. Content viewer loads < 2s. Format switching < 1s. API responses < 500ms at p95.
- **Security:** All credentials (API keys, DB URIs) stored encrypted in environment config, never in source code or documentation. Accessibility profile data treated as sensitive health data — audit-logged, RBAC-gated.
- **Privacy:** Disability data visible only to roles with explicit permission in the RBAC matrix. Audit logs capture who viewed disability data, when, and from which IP.
- **Uptime:** 99.9% SLA.
- **WCAG Compliance:** WCAG 2.1 AA minimum on all screens. WCAG 2.1 AAA on all accessibility-critical flows (viewer, assessment, profile setup).
- **Automated Testing:** axe-core integrated into CI/CD pipeline. No critical or serious accessibility violations may be merged to main.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI conversion quality errors | High — student learning compromised | Tier 2 teacher review process; quality scoring; teacher training |
| Screen reader compatibility regressions | High — blind users locked out | NVDA + Chrome manual tests on every release; axe-core in CI |
| Misconfigured enrollment causes wrong content visibility | High — students see wrong materials | Validation tools, simulation/preview mode, audit logs |
| Admin overwhelm with new operational flows | Medium — adoption lag | Guided onboarding, contextual help tooltips, admin training |
| API costs exceed budget | Medium — financial risk | Caching, batch processing, cost dashboard for admin |
| Teacher non-adoption of deletion flow | Medium — accidental data loss | Delete impact modal makes consequences visible before confirmation |
| Credentials leaked in documentation | Critical — security breach | Rotate all keys. Never store credentials in docs. Use .env only. |

---

## 10. Out of Scope (v1.3 / MVP)

- AI tutoring / personalized recommendations.
- Deep LMS/SSO integration beyond basic hooks.
- Advanced gamification / badges.
- Full video-conferencing suite (stub only).
- Mobile native apps (responsive web only).
- Automated IEP generation.
- VR/AR experiences.
- Third-party app marketplace.

---

## Appendix A: Competitive Analysis

| Platform | Multi-Disability? | Auto-Conversion? | WCAG AAA? | Our Advantage |
|---|---|---|---|---|
| Blackboard Ally | No | Partial (audio only) | AA | Full multi-disability, all formats, admin control |
| Canvas Studio | No | Captions only | AA | Modular Tier 2/3 quality, blind-first UX |
| Microsoft Immersive Reader | Partial | TTS only | Unknown | All 5 modules, full admin operations |
| Bookshare | Blind/dyslexic only | Books only | N/A | Full curriculum, assessment, messaging |
| 3Play Media | Deaf only | Manual captions | AA | Automated, multi-disability, screen-reader-first |

**Key Differentiator:** Only platform where a deaf-blind student with ADHD uses ONE account, completes the entire session with screen reader only, and accesses content auto-converted to Braille + simplified + captioned simultaneously.

---

## Appendix B: Changelog from v1.2

| # | Change | Reason |
|---|---|---|
| 1 | Feature 6: Full delete flow with impact modal, trash, restore, permanent delete | Delete action was documented without any confirmation or cascade spec |
| 2 | Feature 7: Admin User Management, Teacher Assignment, Student Enrollment screens | Admin had no operational workflows — platform was non-functional without these |
| 3 | Feature 10: Dual-track enrollment model reconciled | v1.1 had self-enrollment and admin-import as contradictory models |
| 4 | Feature 11: RBAC permission matrix expanded | Permanent delete, assignment, and enrollment permissions were undefined |
| 5 | Feature 13: Blind User Journey Specification | Platform had no component-level ARIA spec; blind users could not use it unaided |
| 6 | Feature 14: Platform Settings screen | Settings was listed in nav with zero screen spec |
| 7 | Feature 5: Announcements added to Communication Suite | Announcements were absent from teacher nav and unspecced |
| 8 | Feature 4: Save & Exit for assessments | No paused-state existed; motor-impaired students had no recourse during fatigue |
| 9 | Feature 3: Braille integration clarified | Old spec required proprietary device registration; corrected to OS accessibility layer |
| 10 | Feature 1: First-login forced profile setup modal | Profile setup was optional and easily missed; blind users landed on inaccessible shell |
| 11 | Section 7: ARIA Component Reference added | No component-level accessibility spec existed for development team |
| 12 | Security note: credentials must not appear in docs | TRD contained live production credentials in plaintext |
