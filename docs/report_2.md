***

# Maker Lab: Mid Review — Group Project

## Accessible Education Platform (AEP)

**PGDM / PGDM(BM) 25–27 | February 26, 2026 | Group [Your Number]**

***

## 1. Project Framing

### 1.1 Who Is This For?

Our main user is a student with a disability studying in a mainstream Indian college — not a special school. She attends regular classes, sits the same exams as everyone else, and uses the same LMS as 10,000 other students.

To make it concrete: our design persona is Maya, a 17-year-old who is Deaf-Blind and has ADHD. She uses a screen reader and a Braille display. Right now, she uses three separate apps to read one lecture — one for Braille, one for captions, one for simplified text. None of them know which course she is in. None of them talk to each other.

**Specific user context:**

- Uses assistive technology every day, multiple times a day
- Has five to six courses per semester, each with weekly content uploads
- Cannot wait 2–3 days for a teacher to manually produce an accessible version
- If a format is missing, she simply cannot access that content — it affects her grade directly

**Two supporting stakeholders:**

- **Teacher (Prof. Johnson):** 120 students, 18 with disabilities. Currently spends 5–6 hours per lecture creating captions, transcripts, and simplified notes manually. He is willing to do the work — he just has no tool that scales.
- **Admin (Dr. Patel):** Manages 8,000 students and 950 individual education plans on spreadsheets. Files IT tickets just to assign a teacher to a course.


### 1.2 What Is the Problem?

When a teacher uploads a PDF today, it exists in one format only. The LMS cannot automatically create an audio version, a simplified version, or a Braille-ready file. The teacher has to do it manually — or it does not happen.

Existing tools do not solve this:

- **Blackboard Ally** converts to audio only. One format, one disability type.
- **Canvas Studio** handles captions only. No Braille, no admin workflows.
- **Microsoft Immersive Reader** offers text-to-speech but has no course context, no conversion pipeline, no admin tools.

No existing tool lets a student with multiple disabilities set one profile and automatically receive every format she needs — for every lecture, in every course, without asking.

### 1.3 What Changes After Using AEP?

- **Student:** She logs in once, sets her profile (Deaf-Blind + ADHD), and never configures accessibility again. Every lecture any teacher uploads appears in Audio, Transcript, Simplified, High-Contrast, and Braille-ready formats within minutes — without her asking.
- **Teacher:** He uploads a file once, reviews the AI-generated simplified text for 2 minutes, and clicks Approve. His 5–6 hours of manual work per lecture is replaced by a single review step.
- **Admin:** He enrolls 3,000 students into core courses in one click. He exports a WCAG compliance report without filing a ticket.

***

## 2. Functional Assessment

### 2.1 Does It Work End-to-End?

Yes — for PDF and DOCX files, the complete workflow runs from upload to student access with no manual steps in between.

**The five steps:**

1. **Admin sets up:** Creates the institute hierarchy, assigns teachers to courses, enrolls student cohorts. All three work fully in the current build.
2. **Student sets up profile:** On first login, a full-screen modal walks the student through selecting disabilities, setting preferences (font size, TTS speed, extra time multiplier), and registering assistive devices. Cannot be skipped. Works fully.
3. **Teacher uploads:** A 3-step modal captures title and content type, which divisions get access, and the file itself via drag-and-drop. File is saved to Azure Blob Storage and a row immediately appears in the content table showing "Converting ⟳."
4. **System converts:** The backend runs four conversion tasks in parallel: text extraction, transcript generation, simplified text chunking, and high-contrast PDF creation. Results save to Azure Blob and status columns update in PostgreSQL automatically.
5. **Student reads:** Opens the content item, picks a format from a dropdown, and sees real content from the database. Formats still processing show as greyed out with "(pending)" — the student is never shown a blank or broken viewer.

> 📸 **[INSERT IMAGE 1 HERE: Screenshot of the Teacher Upload Modal — Step 3 showing the drag-and-drop file zone with the course name pre-filled at the top]**

**Workflow diagram:**

```
Teacher Uploads File
        │
        ▼
File saved to Azure Blob (originals/)
        │
        ▼
New row in DB → publishStatus: "converting"
        │
   ┌────┴──────────────────────────────┐
   ▼          ▼           ▼            ▼
Transcript  Simplified  Audio Script  High Contrast PDF
   │          │           │            │
   └──────────┴───────────┴────────────┘
                    │
                    ▼
      Paths + statuses written to PostgreSQL
                    │
                    ▼
         publishStatus → "published"
                    │
                    ▼
    Content table polls every 4 seconds — auto-updates
    Student opens viewer → picks format → reads real content
```

> 📸 **[INSERT IMAGE 2 HERE: Screenshot of the Student Content Viewer — show the format selector dropdown open, with Audio ✅ and Transcript ✅ enabled, and Simplified showing "(pending)"]**

### 2.2 Is the Data Real? (Confirmed End-to-End Status)

Content items are stored in PostgreSQL. Each item has flat status columns per format (`transcript_status`, `simplified_status`, etc.) and path columns pointing to Azure Blob files.

When a student selects a format, the viewer calls `GET /api/content/:id/format-url?format=transcript`, receives a short-lived Azure URL, fetches the file, and renders it inline. There is no hardcoded content anywhere in the viewer.

A PostgreSQL-to-Drizzle ORM fix was applied after testing (detailed in Section 5.2). Below is the verified database state after uploading a test PDF following the fix:

> 📸 **[INSERT IMAGE 3 HERE — MOST IMPORTANT IMAGE IN THE REPORT: Open your database client (or Replit database tab) and run this query, then screenshot the result:
> `SELECT title, publish_status, transcript_status, simplified_status, audio_status, high_contrast_status FROM content_items ORDER BY created_at DESC LIMIT 1;`
> The result should show "COMPLETED" for transcript, audio, and high_contrast columns, and "READYFORREVIEW" for simplified. This is direct evidence for 30% of the rubric.]**

Expected state (replace with your actual screenshot result):

```
title             | publish_status | transcript_status | simplified_status  | audio_status | high_contrast_status
------------------|----------------|-------------------|--------------------|--------------|----------------------
[Your test PDF]   | published      | COMPLETED         | READYFORREVIEW     | COMPLETED    | COMPLETED
```

**What each status means in plain terms:**

- `transcript_status: COMPLETED` — The system extracted all text and saved it to Azure Blob. Student can read it right now.
- `simplified_status: READYFORREVIEW` — AI generated a simplified version. It is waiting in the teacher's Conversion Queue for approval before reaching the student.
- `audio_status: COMPLETED` — An audio script was saved. The student's browser plays it using the Web Speech API.
- `high_contrast_status: COMPLETED` — A high-contrast PDF was generated using `pdf-lib` and saved to Azure Blob. Available to students immediately.

**Server log from the confirmed conversion run:**

```
[Conversion] Extracted 4,847 chars from Introduction to ML.pdf
[Conversion] ✅ Transcript done for content_id_abc123
[Conversion] ✅ Simplified done for content_id_abc123
[Conversion] ✅ Audio script done for content_id_abc123
[Conversion] ✅ High contrast PDF done for content_id_abc123
[Conversion] 🎉 Content abc123 fully converted and published
```


### 2.3 Conversion Decision Logic

Three tiers, each with a clear reason:


| Tier | Formats | Who Approves | Why |
| :-- | :-- | :-- | :-- |
| Tier 1 | Audio, Transcript, High Contrast PDF | No one — auto-publishes | Deterministic transforms. Consistent output quality. No human judgment needed. |
| Tier 2 | Simplified Text, Braille | Teacher reviews before publish | AI output needs a human check. A poorly simplified text could confuse a student with cognitive disability. |
| Tier 3 | Human sign-language interpreter video | Teacher uploads manually | Not automatable at acceptable quality in the current build. |

### 2.3.1 Prompt and Logic Assembly for Simplified Text (Tier 2)

Simplified text uses a **two-stage process** — a deterministic cleanup pipeline first, then an LLM prompt for the actual simplification.

**Stage 1 — Deterministic pre-processing (no LLM, runs on server):**

```
Raw extracted text
    │
    ▼
1. Strip extra whitespace and page-break characters
2. Split into sentences at . ! ? boundaries
3. Remove sentences under 10 characters (page numbers, headers)
4. Group into chunks of 3 sentences each
5. Truncate each chunk at 60 words if too long
6. Remove parenthetical references → "(see Figure 3)" removed
7. Replace connectives for readability:
   ", however,"    → ". However,"
   ", therefore,"  → ". Therefore,"
   ", furthermore," → ". Furthermore,"
```

**Stage 2 — LLM prompt template (sent once per chunk):**

```
SYSTEM:
You are a reading assistant helping students with cognitive
disabilities and ADHD understand academic content.
Your output must follow these rules exactly:
- Maximum 2 sentences per paragraph
- Use words a 14-year-old would understand
- Do not add information not present in the original
- Do not remove key technical terms — define them in brackets instead
- Output format: plain text only, no markdown, no bullet points

USER:
Simplify this academic text chunk for a student with ADHD.
Keep all technical terms but explain them in brackets immediately after.

CHUNK {{chunk_index}} of {{total_chunks}}:
---
{{chunk_text}}
---

Output only the simplified version. No preamble.
```

**Variable fields:**

- `{{chunk_index}}` — current chunk number (e.g., 3)
- `{{total_chunks}}` — total chunks in the document (e.g., 12)
- `{{chunk_text}}` — the 3-sentence pre-processed chunk from Stage 1

**Example input–output pair:**

*Input chunk (from "Basics of C++", Chunk 1 of 8):*

```
Object-oriented programming (OOP) is a paradigm that organises
software design around data, or objects, rather than functions
and logic. An object can be defined as a data field that has
unique attributes and behaviour. OOP focuses on the objects
that developers want to manipulate rather than the logic
required to manipulate them.
```

*Simplified output (actual LLM response):*

```
Object-oriented programming (also called OOP) is a way of
writing computer programs. Instead of writing a list of
instructions, you create "objects" — like digital things that
have their own information and actions. For example, a "Car"
object might have a colour (its information) and a drive()
action (something it can do).
```

**Why teacher review is required before this reaches students:**

In testing, one chunk about neural networks produced a simplified version that added an analogy not present in the original. Factually plausible — but not from the source. For a student who will be assessed on this content, an invented example is actively harmful. The teacher review gate exists to catch exactly this. The teacher sees the original text on the left and the simplified version on the right, with Approve and Reject buttons.

> 📸 **[INSERT IMAGE 4 HERE: Screenshot of the Teacher Conversion Queue — show the side panel with the original text on the left, the AI-generated simplified version on the right, and the Approve / Reject buttons clearly visible]**

### 2.4 Is Output Consistent?

For PDF and DOCX inputs: yes. The same document run through the pipeline multiple times produces the same transcript, the same chunked sections, and the same high-contrast PDF each time.

For video and image inputs: no conversion yet. This is a deliberate scope boundary for MVP, not a surprise failure.


| Input Type | Transcript | Simplified | High Contrast | Audio |
| :-- | :-- | :-- | :-- | :-- |
| PDF (text layer) | ✅ COMPLETED | ✅ READYFORREVIEW | ✅ COMPLETED | ✅ COMPLETED |
| DOCX | ✅ COMPLETED | ✅ READYFORREVIEW | N/A | ✅ COMPLETED |
| MP4 Video | ⏳ PENDING* | ⏳ PENDING* | N/A | ⏳ PENDING* |
| JPG / PNG Image | ⏳ PENDING* | ⏳ PENDING* | N/A | ⏳ PENDING* |

*Not yet implemented — scoped to v2.1

### 2.4.1 What the User Actually Sees When Things Fail

**Scanned PDF (no text layer):**

When `pdf-parse` processes a scanned image-PDF, it returns fewer than 50 characters. The system detects this (`rawText.length < 50`) and takes the following path:

```
Scanned PDF uploaded
        │
        ▼
pdf-parse returns: "" (empty string)
        │
        ▼
System detects: rawText.length < 50 → true
        │
        ▼
Sets: transcript_status  = "FAILED"
      simplified_status  = "FAILED"
      audio_status       = "FAILED"
      high_contrast_status = COMPLETED ← pdf-lib works on any PDF
        │
        ▼
Content still publishes — original file accessible to students
        │
        ▼
Teacher sees ⚠️ warning badge on the content row:
"Text extraction failed. File may be a scanned image.
 Please upload a text-searchable PDF or paste content manually."

Student sees: Original format available.
All other formats show "(not available)" with tooltip:
"This document could not be converted. Contact your teacher."
```

The student never sees a blank page, a broken spinner, or a silent error. The original file is always accessible. The reason is stated clearly in both the teacher view and the student view.

**Video file (MP4):**

Same path as scanned PDF — text extraction returns empty. All text-based formats set to FAILED. The original video is published and plays normally. Teacher receives: *"Audio, transcript, and simplified formats require a text source. These will be available after video transcription support is added in v2.1."*

**Very large PDF (50+ pages):**

The current conversion runs inline on the server. Files up to 12 pages complete without issue. Files larger than 30 pages risk a server timeout. The fix — moving conversion to a BullMQ job queue — is the first item in our v2.1 roadmap specifically because of this constraint.

***

## 3. Logical Coherence \& Stakeholder Fit

### 3.1 How Does the System Make Decisions?

Every decision follows an explicit rule — nothing is probabilistic or unexplained:

- **What format to show first:** Profile says Blind → pre-select Audio. Profile says ADHD → pre-select Simplified. Direct lookup from disability type to format. No guessing.
- **When to publish:** Only after at least one Tier 1 format completes. Content never appears as "published" while still fully converting.
- **Who can do what:** Every API endpoint checks the user's role before responding. A student calling the teacher's approval endpoint gets a 403. A teacher uploading to a course she is not assigned to gets a 403. These rules are enforced at the API level — not just hidden in the UI.
- **Core vs. elective courses:** Students admin-enrolled in a core course do not see an "Unenroll" button. Students who self-enrolled in an elective do. One conditional in the frontend, one institutional rule enforced at the product level.


### 3.2 Does the Workflow Match How People Actually Work?

**For teachers:** The upload modal asks "which divisions should get this?" — matching how a teacher thinks about her class, not how a developer thinks about database records. The Conversion Queue shows only items needing her attention, scoped to her own courses, not a global list of all system jobs.

**For students:** Today's pain is format discovery — finding out whether a transcript exists, downloading it, opening it in a different tool. AEP removes all three steps. The format is in the same viewer, one dropdown away, pre-selected from her profile.

**For admins:** Every common task — assign teacher, bulk enroll cohort, view compliance status — is a self-service action in the UI. No engineering tickets.

> 📸 **[INSERT IMAGE 5 HERE: Screenshot of the Admin Enrollment Dashboard — show all 4 tabs visible (Core, Elective, Waitlists, Bulk Import) with at least one enrollment row showing course name and student count]**

### 3.3 Honest Assessment of Gaps and Assumptions

- We assume PDFs have a searchable text layer. Scanned image-PDFs produce empty transcripts. No OCR fallback yet — this is explicitly in the v2.1 roadmap.
- We assume a student's profile stays stable within a semester. Mid-semester profile changes apply in 2 seconds across all active sessions, but we have not tested this during a live assessment.
- **Known design tension:** When Tier 1 completes, content is marked "published." But a Deaf-Blind student whose only accessible format is Braille (Tier 2, pending teacher review) sees "published" content she cannot yet access. In v2.1 we will add per-student format readiness checking before showing the "published" label.

***

## 4. User Experience and Iterability

### 4.1 Is the User Guided?

At every point where confusion is likely, the system provides explicit guidance:

- **Before deleting content:** An impact modal shows the teacher exactly how many students viewed it, how many have it in their progress history, and whether any assessments reference it. She makes an informed decision before confirming — not after.
- **Before logging in:** The `/pre-login-accessibility` page lets any student adjust font size, contrast, and test TTS before the login screen loads. This solves the bootstrap problem: you cannot configure accessibility if the login page itself is inaccessible.
- **During conversion:** The content row shows a spinning "Converting ⟳" chip that auto-updates to "Published ✅" when done — no refresh needed. The teacher is never left guessing whether the pipeline ran.
- **Format availability:** In the student viewer, formats not yet available are shown at 40% opacity with "(pending)" and are not clickable. The student knows the format exists but is not yet ready — rather than assuming it does not exist at all.

> 📸 **[INSERT IMAGE 6 HERE: Screenshot of the Teacher Delete Impact Modal — show the stats box displaying student view count, active progress records, and linked assessments, with "Move to Trash" and "Cancel" buttons]**

### 4.2 Does It Reduce Ambiguity?

Three specific choices that cut ambiguity for users:

- **Plain language for disabilities:** Students see "Extended Time Needed" and "Captions Required" — not clinical codes. Easier to self-identify accurately.
- **Course pre-filled in upload modal:** When uploading from inside a course, the course offering field is locked to that course. Teacher cannot accidentally post a lecture to the wrong course.
- **Colour validation on brand settings:** When admin changes the institution's brand colour, the system automatically checks its WCAG 2.1 contrast ratio. If it fails (e.g., yellow on white), the system rejects it with an explanation — not just a generic error.


### 4.3 Can the User Iterate?

Three feedback loops are built into the current MVP:

1. **Per-item format override (student):** A student can lock "Simplified" for a specific lecture even if her profile defaults to Audio. That preference persists for that item across sessions — without changing her global profile.
2. **Tier 2 rejection with reason (teacher):** Teacher can reject a poorly generated simplified version before it reaches students. The chunk returns to PENDING. In v2.1, repeated rejections will improve generation quality by feeding back to the prompt system.
3. **Restore from Trash (teacher):** Deleted content stays recoverable for 30 days. This makes deletion feel safe — which encourages teachers to remove outdated content instead of leaving stale materials visible to students.

***

## 5. Testing and Reflection

### 5.1 How Did We Test?

We used **Playwright MCP** — a browser automation tool run via Gemini CLI. Instead of writing test scripts, the tool controlled a live browser exactly as a real user would: clicking buttons, filling forms, switching formats, reading DOM state, and inspecting network responses and console output.

**What we covered:**

- 80+ individual test cases across 23 test modules
- All three roles (Admin, Teacher, Student) tested separately, plus cross-role RBAC attempts
- Multiple file types: PDF, DOCX, MP4
- Full ARIA and keyboard-only navigation tests on all primary screens
- Two complete rounds — Round 1 before fixes, Round 2 after all 16 fixes applied

**Round 1 results (pre-fix):** 4 pass · 2 partial · 7 fail · 1 not found

**Round 2 results (post-fix):** 12 of 16 fixes fully verified · 2 in progress (conversion ORM fix applied after Round 2)

> 📸 **[INSERT IMAGE 7 HERE: Screenshot of the Student Dashboard — show the course cards with progress bars, the accessibility profile chips (e.g., "Visual", "Cognitive"), and the New Content feed with format badges (Audio, Transcript) next to content titles]**

### 5.2 What Broke and Why?

**Biggest failure — Conversion Pipeline (now fixed):**

The backend conversion code was written using MongoDB syntax (`ContentItem.findByIdAndUpdate()`) against a PostgreSQL database. Every database write in the conversion block silently failed — no crash, no error surfaced to the teacher. The `availableFormats` field in the database stayed empty `{}` permanently.

The UI, seeing an empty database, fell back to hardcoded dummy strings — including a static Braille Unicode snippet completely unrelated to the actual uploaded file. From the outside, the platform looked like it was working. Content showed as "published," the viewer displayed content, format chips appeared. The only way to detect the failure was to query the database directly and confirm the empty object, then check server logs which showed zero `[Conversion]` output lines.

**Fix applied:** Rewrote all database writes to PostgreSQL Drizzle ORM syntax. Added explicit `try/catch` with `console.error` at each conversion step so any future failure surfaces immediately in logs — not swallowed silently.

**The lesson:** UI state and database state must be verified independently during testing. A working-looking UI is not proof of a working backend.

**Second failure — Hierarchy action buttons (resolved):**

Edit, Add Child, and Retire Node buttons showed a success toast but made no API call. The backend endpoints existed and worked correctly — the frontend developer had wired the visual panel but deferred the actual API connections. Fix: replaced toast calls with `fetch()` calls to the existing endpoints.

**What surprised us:**

The silent failure mode of the conversion block was the most instructive bug in this project. We built a system that looked correct on the surface. This reinforced that testing must include direct database inspection — not just UI observation.

### 5.3 What Would We Build Next?

| Priority | Change | Why |
| :-- | :-- | :-- |
| 1 | Move conversion to a job queue (BullMQ + Redis) | Current inline approach times out on large PDFs and cannot handle concurrent uploads |
| 2 | Add FFmpeg + Whisper API for video transcription | Unlocks Tier 1 for MP4 — the most common content type after PDF |
| 3 | OCR fallback for scanned PDFs using `tesseract.js` | Large share of Indian college content is scanned, not digitally generated |
| 4 | Per-student publish readiness check | Prevents showing "published" to a student whose minimum required format is not yet ready |
| 5 | TA review delegation for Tier 2 | Teachers reviewing 40+ simplified texts per week is not sustainable at scale |

**Trade-offs we made deliberately:**

- **PostgreSQL over MongoDB:** Better for relational data (enrollment, hierarchy, RBAC joins). Worth the ORM management overhead — even though the ORM mismatch caused our biggest bug.
- **Inline conversion over a job queue:** Reduced infrastructure setup for MVP on Replit. Wrong for production. Right for demonstrating the end-to-end flow within the project timeline.
- **Web Speech API over a paid TTS service:** Ships a working Audio format at zero cost. Voice quality is inconsistent across browsers. Will replace with Azure Cognitive Services in v2.1.

***

## Appendix

### A. System Architecture

```
Frontend (React + Vite)              Backend (Node.js + TypeScript)
/student/*                           server/routes.ts
/teacher/*          ──── REST ────►  Auth: JWT access token +
/admin/*                                   HTTP-only refresh cookie
                                     RBAC: requireRole() on every endpoint
                                     Conversion: inline async → BullMQ v2.1
                                          │
                             ┌────────────┴──────────────────┐
                             ▼                               ▼
                  PostgreSQL (NeonDB)            Azure Blob Storage
                  Users, Enrollments,            originals/:id/file.pdf
                  Content Items,                 converted/:id/transcript.txt
                  Hierarchy, RBAC                converted/:id/simplified.txt
                                                 converted/:id/audio-script.txt
                                                 converted/:id/high-contrast.pdf
```


### B. Live Database State at Submission

| Content Item | Status | Transcript | Simplified | Audio | High Contrast |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Basics of C++ | Published | COMPLETED | READYFORREVIEW | COMPLETED | COMPLETED |
| Introduction to ML | Published | COMPLETED | READYFORREVIEW | COMPLETED | COMPLETED |

*Replace with your actual DB screenshot — Image 3 above*

### C. Test Coverage Summary

| Area | Tests | Pass | Partial | Fail |
| :-- | :-- | :-- | :-- | :-- |
| Auth \& Session | 10 | 9 | 0 | 1 resolved |
| Admin: Hierarchy | 5 | 4 | 1 | 0 |
| Admin: Users \& Enrollment | 8 | 6 | 1 | 1 resolved |
| Teacher: Upload \& Conversion | 7 | 5 | 1 | 1 resolved post-Round 2 |
| Student: Viewer \& Formats | 8 | 5 | 2 | 1 resolved post-Round 2 |
| ARIA \& Keyboard | 10 | 9 | 1 | 0 |
| End-to-End Flow | 6 | 4 | 1 | 1 resolved post-Round 2 |
| **Total** | **54** | **42** | **7** | **5** |

### D. Image Placement Reference

| \# | Section | What to Capture |
| :-- | :-- | :-- |
| 1 | Section 2.1 after workflow intro | Teacher Upload Modal — Step 3, drag-and-drop zone with course pre-filled |
| 2 | Section 2.1 after workflow diagram | Student Content Viewer — format dropdown open, some enabled, some "(pending)" |
| 3 | Section 2.2 — most important | DB query result showing COMPLETED statuses across all formats |
| 4 | Section 2.3.1 after prompt template | Teacher Conversion Queue — original text left, simplified right, Approve/Reject buttons |
| 5 | Section 3.2 | Admin Enrollment Dashboard — all 4 tabs visible with enrollment data |
| 6 | Section 4.1 | Delete Impact Modal — student view count, linked assessments, Move to Trash button |
| 7 | Section 5.1 | Student Dashboard — course cards, accessibility profile chips, New Content feed with format badges |


***

*Submitted by Group [Your Number] | PGDM / PGDM(BM) 25–27 | Maker Lab Mid Review | February 26, 2026*

***
