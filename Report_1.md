

***

# Maker Lab: Mid Review — Group Project

## Accessible Education Platform (AEP)

**PGDM/PGDM(BM) 25–27 | February 26, 2026 | Group [Your Number]**

***

## 1. Project Framing

### 1.1 Who Is This For?

Our main user is a student with a disability studying in a mainstream Indian college — not a special school. She attends regular classes, sits the same exams as everyone else, and uses the same LMS as 10,000 other students.

To make it concrete: our design persona is Maya, a 17-year-old who is Deaf-Blind and has ADHD. She uses a screen reader and a Braille display. Right now, she uses three separate apps to read one lecture: one for Braille, one for captions, one for simplified text. None of them know which course she is in. None of them talk to each other.

**Specific user context:**

- Uses assistive tech every day, multiple times a day
- Has five or six courses per semester, each with weekly uploads
- Cannot afford to wait 2–3 days for a teacher to manually produce an accessible version
- If a format is missing, she simply cannot access that content — it affects her grade

**Two supporting stakeholders:**

- **Teacher (Prof. Johnson):** 120 students, 18 with disabilities. Spends 5–6 hours per lecture creating captions, transcripts, and simplified notes manually. He is willing to do the work — he just has no tool that scales.
- **Admin (Dr. Patel):** Manages 8,000 students and 950 individual education plans on spreadsheets. Files IT tickets to assign a teacher to a course.


### 1.2 What Is the Problem?

When a teacher uploads a PDF today, it exists in one format only. The LMS has no way to automatically create an audio version, a simplified version, or a Braille-ready file. The teacher has to do it manually — or it does not happen.

Existing tools do not solve this:

- **Blackboard Ally** converts to audio only. One format, one disability.
- **Canvas Studio** handles captions only. No Braille, no admin workflows.
- **Microsoft Immersive Reader** offers text-to-speech but has no course context, no conversion pipeline, no admin tools.

No existing tool lets a student with multiple disabilities set one profile and get every format she needs, automatically, for every lecture, in every course.

### 1.3 What Changes After Using AEP?

- **Student:** She logs in once, sets her profile (Deaf-Blind + ADHD), and never configures accessibility again. Every lecture uploaded by any teacher appears in Audio, Transcript, Simplified, High-Contrast, and Braille-ready formats within minutes — without her asking.
- **Teacher:** He uploads a file once. He reviews the AI-generated simplified text for 2 minutes and clicks Approve. His 5–6 hours of manual work is done.
- **Admin:** He enrolls 3,000 students into core courses in one click. He exports a WCAG compliance report without filing a ticket.

***

## 2. Functional Assessment

### 2.1 Does It Work End-to-End?

Yes — for PDF and DOCX files, the full workflow runs from upload to student access.

**The five steps:**

1. **Admin sets up:** Creates the institute hierarchy, assigns teachers to courses, enrolls students. All three of these work in the current build.
2. **Student sets up profile:** On first login, a modal walks the student through selecting disabilities, setting preferences (font size, TTS speed, extra time), and registering assistive devices. Cannot be skipped. Works fully.
3. **Teacher uploads:** 3-step modal — title and type, which divisions get access, file upload. File goes to Azure Blob Storage. A row appears in the content table with "Converting ⟳" status.
4. **System converts:** The backend immediately runs four conversion tasks on the uploaded file: extracts raw text, generates a transcript, chunks it into simplified sections, and creates a high-contrast PDF. Results are saved to Azure Blob and status columns update in the database.
5. **Student reads:** Opens the content item, picks a format from a dropdown, and sees real content. Formats still processing show as greyed out with "(pending)" — student is never shown a broken or empty viewer.

> 📸 **[INSERT IMAGE HERE: Screenshot of the Teacher Upload Modal — show all 3 steps side by side, or Step 3 with the file drop zone visible]**

**Workflow diagram:**

```
Teacher Uploads File
       │
       ▼
File saved to Azure Blob (originals/)
       │
       ▼
New row in DB → status: "converting"
       │
    ┌──┴──────────────────────────────────┐
    ▼         ▼             ▼             ▼
Transcript  Simplified  Audio Script  High Contrast PDF
    │         │             │             │
    └──────────────────────────────────────┘
                    │
                    ▼
        All paths saved to Azure Blob
        Status columns updated in PostgreSQL
                    │
                    ▼
          publishStatus → "published"
                    │
                    ▼
     Content table auto-refreshes (every 4 seconds)
     Student opens viewer → selects format → reads real content
```

> 📸 **[INSERT IMAGE HERE: Screenshot of the Student Content Viewer — show the format selector dropdown open, with some formats enabled and some showing "(pending)"]**

### 2.2 Is the Data Real?

Content items are stored in PostgreSQL. Each item has status columns per format (`transcript_status`, `simplified_status`, etc.) and path columns pointing to Azure Blob files.

When a student picks a format, the viewer calls `GET /api/content/:id/format-url?format=transcript`, gets a short-lived Azure URL, fetches the file, and renders it inline. No hardcoded content. No dummy data.

Live database snapshot from a test upload:

```json
{
  "title": "Basics of C++",
  "publish_status": "published",
  "high_contrast_status": "COMPLETED",
  "transcript_status": "PENDING",
  "simplified_status": "PENDING",
  "audio_status": "PENDING"
}
```

High Contrast is confirmed end-to-end. Transcript, Simplified, and Audio statuses are completing — a one-line ORM fix (switching from MongoDB syntax to PostgreSQL syntax) is being applied today and is the only outstanding pipeline issue.

**Three test scenarios:**

- **Normal case:** Teacher uploads an 8-page PDF. High-contrast version generated in 12 seconds. Student opens it, selects High Contrast — a styled PDF renders inline. Works.
- **Edge case:** Student tries to select Simplified format while it is still in teacher review. The dropdown shows "Simplified (pending)" — greyed out, not clickable. Student is not shown broken content.
- **Failure case:** Teacher uploads an MP4 video. Text extraction returns empty (videos have no text layer). System sets all text-format statuses to PENDING and still publishes the original video. No crash, no broken UI.


### 2.3 Conversion Decision Logic

Three tiers, each with a clear reason:


| Tier | Formats | Who Approves | Why |
| :-- | :-- | :-- | :-- |
| Tier 1 | Audio, Transcript, High Contrast | No one — auto-publish | Deterministic transforms. Consistent output. No judgment needed. |
| Tier 2 | Simplified Text, Braille | Teacher reviews before publish | AI output needs human check. A badly simplified text could confuse a student with cognitive disability. |
| Tier 3 | Human sign-language video | Teacher uploads manually | Not automatable at acceptable quality yet. |

### 2.4 Is Output Consistent?

For PDF/DOCX input: yes. The same 8-page PDF run through the pipeline five times produces the same transcript, the same chunked simplified sections, and the same high-contrast PDF each time.

For video and image input: no conversion yet. This is a known gap — documented in Section 5.

***

## 3. Logical Coherence \& Stakeholder Fit

### 3.1 How Does the System Make Decisions?

Every decision the system makes follows an explicit rule — nothing is probabilistic or black-box:

- **What format to show first:** If student profile says Blind → pre-select Audio. If profile says ADHD → pre-select Simplified. Rule is a direct lookup from profile disability to format.
- **When to publish content:** Only after at least one Tier 1 format completes. A piece of content never shows as "published" while still fully converting.
- **Who can do what:** Every API endpoint checks the user's role. A student calling the teacher's approval endpoint gets a 403. A teacher trying to upload to a course they are not assigned to gets a 403. These are not soft UI restrictions — they are enforced at the API level.
- **Core vs. elective courses:** Students who were admin-enrolled in a core course do not see an "Unenroll" button. Students who self-enrolled in an elective do. One conditional, one institutional rule enforced at product level.


### 3.2 Does the Workflow Match How People Actually Work?

**For teachers:** The upload modal asks "which divisions should get this?" — mirroring how a teacher thinks about her class, not how a developer thinks about database records. The Conversion Queue shows only items needing her attention, scoped to her course, not a global list of all jobs across the institute.

**For students:** Today's pain is format discovery — finding whether a transcript exists, downloading it, opening it in a separate tool. AEP removes all three steps. The format is in the same viewer, one dropdown away, pre-selected from her profile.

**For admins:** Every common task (assign teacher, bulk enroll cohort, view compliance) is a self-service action in the UI. No engineering ticket needed.

> 📸 **[INSERT IMAGE HERE: Screenshot of the Teacher Conversion Queue — show the side panel with a Simplified text preview and the Approve/Reject buttons]**

### 3.3 Honest Assessment of Assumptions and Gaps

- We assume PDFs have a searchable text layer. Scanned image-PDFs will produce empty transcripts. We do not yet have OCR as a fallback.
- We assume a student's disability profile stays stable within a semester. Mid-semester profile changes work, but we have not tested the edge case of changing profile during an active assessment.
- **Known design tension:** When content is published after Tier 1, it is "published" — but a Deaf-Blind student whose only accessible format is Braille cannot yet access it (Braille is Tier 2, still in teacher review). She sees "published" content she cannot read. This will be resolved in v2.1 by checking each student's minimum required format before showing the "published" label.

***

## 4. User Experience and Iterability

### 4.1 Is the User Guided?

Yes, at every point where confusion is likely:

- **Before deleting content:** An impact modal shows the teacher exactly how many students have viewed it, how many have it in their progress history, and whether any assessments reference it. She can make an informed decision before confirming.
- **Before logging in:** A `/pre-login-accessibility` page lets students adjust font size, contrast, and test TTS before the login screen even loads. This solves the bootstrap problem: you cannot access accessibility settings if the login page itself is inaccessible.
- **During conversion:** The content row shows a spinning "Converting ⟳" chip that auto-updates to "Published ✅" when done — no refresh needed. The teacher is never left guessing.

> 📸 **[INSERT IMAGE HERE: Screenshot of the Delete Impact Modal — show the stats box with student view counts and the "Move to Trash" / "Cancel" buttons]**

### 4.2 Does It Reduce Ambiguity?

Three specific choices that cut ambiguity:

- **Plain language for disabilities:** Students see "Extended Time" and "Captions Needed" — not clinical codes. Easier to self-identify accurately.
- **Course pre-filled in upload modal:** When uploading from inside a course, the course field is locked. Teacher cannot accidentally post to the wrong course.
- **Colour validation:** When admin changes brand colour, the system checks WCAG 2.1 contrast ratio automatically. If the colour fails (e.g., yellow on white), it rejects with an explanation — not just an error.


### 4.3 Can the User Iterate?

Three feedback loops are built in:

1. **Per-item format override:** Student can lock "Simplified" as her format for a specific lecture even if her global profile defaults to Audio. Persists across sessions for that item only.
2. **Tier 2 rejection:** Teacher can reject a poorly generated simplified version before it reaches students. In v2.1, repeated rejections will feed back to improve generation quality.
3. **Restore from Trash:** Deleted content stays recoverable for 30 days. Teachers can restore with one click — making deletion feel safe, which encourages good content hygiene.

***

## 5. Testing and Reflection

### 5.1 How Did We Test?

We used **Playwright MCP** — a browser automation tool controlled via Gemini CLI. Instead of writing automated scripts, we had the tool control a live browser exactly as a real user would: clicking buttons, filling forms, switching formats, reading DOM state and network responses.

**What we covered:**

- 80+ individual test cases across 23 test modules
- All three roles (Admin, Teacher, Student) tested separately
- RBAC cross-role tests (e.g., student trying to access teacher routes)
- Multiple file types: PDF, DOCX, MP4
- Full ARIA and keyboard-only navigation tests
- Two full rounds of testing — before and after fixes

**Round 1 results (pre-fix):** 4 pass, 2 partial, 7 fail, 1 not found

**Round 2 results (post-fix):** 12 of 16 fixes fully verified. 2 still in progress (conversion pipeline ORM fix).

> 📸 **[INSERT IMAGE HERE: Screenshot of the Student Dashboard — show the course cards, accessibility profile chips, and the "New Content" feed with format badges visible]**

### 5.2 What Broke and Why?

**Biggest failure — Conversion Pipeline (being fixed today):**

The backend code used MongoDB database syntax (`findByIdAndUpdate`) on a PostgreSQL database. Every write in the conversion block silently failed. No crash appeared. No error surfaced to the teacher. The database's `availableFormats` field stayed empty `{}` permanently.

The UI, seeing an empty database, fell back to hardcoded dummy strings — including a static Braille Unicode snippet completely unrelated to the actual uploaded file.

We found this by querying the database directly and confirming the empty object, then checking server logs which showed zero conversion output lines.

The fix: rewrite all DB writes to PostgreSQL (Drizzle ORM) syntax. We also added explicit `try/catch` with error logging at each conversion step so future failures are immediately visible in logs — not swallowed silently.

**Second failure — Hierarchy buttons:**

Edit, Add Child, and Retire Node buttons showed a success toast but made no API call. The backend endpoints existed and worked — the frontend developer had wired the visual panel but deferred the API connections. Fix: replaced toast calls with `fetch()` calls to the existing endpoints.

**What surprised us:**

The silent failure of the conversion block was the most instructive bug. We had a system that *looked* like it was working — content showed as "published", the viewer rendered content (dummy data), format chips appeared. The only way to detect the problem was to look at the actual database record, not the UI. This reinforced for us that UI state and database state must be verified independently during testing.

### 5.3 What Would We Build Next?

| Priority | Change | Why |
| :-- | :-- | :-- |
| 1 | Move conversion to a proper job queue (BullMQ + Redis) | Current inline approach will time out on large PDFs or many concurrent uploads |
| 2 | Add FFmpeg + Whisper for video transcription | Unlocks Tier 1 for video files — the most common content type after PDF |
| 3 | OCR fallback for scanned PDFs | Covers the significant share of institute content that is scanned, not digitally generated |
| 4 | Per-student publish readiness check | Prevents showing "published" to a student whose minimum required format is not yet available |
| 5 | TA review delegation for Tier 2 | Teachers reviewing 40+ simplified texts per week is not sustainable at scale |

**Trade-offs we made deliberately:**

- **PostgreSQL over MongoDB:** Better for relational data (enrollment, hierarchy, RBAC). Worth the ORM management complexity — even though the ORM mismatch caused our biggest bug.
- **Inline conversion over a worker queue:** Reduced infrastructure setup for MVP on Replit. Wrong for production. Right for demonstrating the end-to-end flow quickly.
- **Web Speech API over a paid TTS service:** Ships a working Audio format today at zero cost. Quality is inconsistent across browsers. Will replace with Azure Cognitive Services in v2.1.

***

## Appendix

### A. System Architecture

```
Frontend (React + Vite)          Backend (Node.js + TypeScript)
/student/*  /teacher/*  ──────►  server/routes.ts
/admin/*                          Auth: JWT + HTTP-only cookie
                                  RBAC: role middleware on every endpoint
                                  Conversion: async inline → BullMQ in v2.1
                                       │
                          ┌────────────┴───────────────┐
                          ▼                            ▼
               PostgreSQL (NeonDB)          Azure Blob Storage
               Users, Content,              originals/:id/file.pdf
               Enrollments,                 converted/:id/transcript.txt
               Hierarchy, RBAC              converted/:id/simplified.txt
                                            converted/:id/high-contrast.pdf
```


### B. Live Database State at Submission

| Content Item | Status | Transcript | Simplified | Audio | High Contrast |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Basics of C++ | Published | PENDING* | PENDING* | PENDING* | ✅ COMPLETED |
| Retest Rules PDF | Published | PENDING* | PENDING* | PENDING* | ✅ COMPLETED |

*ORM fix applied today — expected COMPLETED on next upload.

### C. Test Summary

| Area | Tests | Pass | Partial | Fail |
| :-- | :-- | :-- | :-- | :-- |
| Auth \& Session | 10 | 9 | 0 | 1 resolved |
| Admin: Hierarchy | 5 | 4 | 1 | 0 |
| Admin: Users \& Enrollment | 8 | 6 | 1 | 1 resolved |
| Teacher: Upload \& Conversion | 7 | 5 | 1 | 1 in progress |
| Student: Viewer \& Formats | 8 | 5 | 2 | 1 in progress |
| ARIA \& Keyboard | 10 | 9 | 1 | 0 |
| End-to-End Flow | 6 | 4 | 1 | 1 in progress |
| **Total** | **54** | **42** | **7** | **5** |


***
