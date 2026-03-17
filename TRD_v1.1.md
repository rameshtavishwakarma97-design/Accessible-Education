Got it—that’s a hybrid setup: app code on your laptop, but data & files in real cloud services (Mongo Atlas, Azure, Redis cloud). That’s absolutely doable and actually a great “realistic” student build.

## **1\. Target architecture for your case**

Run locally:

* React frontend (localhost:3000).  
* Node.js/NestJS backend (localhost:4000).  
* Python AI worker services (Whisper, Coqui TTS, Liblouis) on your machine.

Use cloud services:

* Database: MongoDB Atlas M0 free tier cluster (instead of local Mongo).  
* File storage: Azure Blob Storage (free tier) for originals \+ converted files.  
* Cache/queue (optional but nice):  
  * Redis Cloud free tier, or Azure Cache for Redis free tier.​

So your machine talks over the internet to Atlas/Blob/Redis, but you don’t deploy the app itself to Azure yet.

---

## **2\. What changes vs the doc you already have**

From the technical requirements document you built, only infrastructure bindings change; all high‑level modules (hierarchy, courses, content pipeline, assessments, RBAC) stay the same.​

## **2.1 Database layer**

* Instead of mongodb://localhost:27017/app, your backend uses the MongoDB Atlas connection string,   
  mongodb+srv://rameshtavishwakarma97\_db\_user:wtKCAucWbCfM7L3N@cluster0.rknpjbl.mongodb.net/?appName=Cluster0  
* Keep the same collections (users, courses, courseOfferings, etc.).​

No schema or code logic change, just environment variables and maybe IP allowlisting for your local IP in Atlas.

## **2.2 File storage layer**

Replace the “local filesystem storage” implementation with Azure Blob:

* Install @azure/storage-blob in the Node backend.​  
* In your storage service module, instead of fs.writeFile to /data/uploads/..., you:  
  * Create/get a container (e.g., content).  
  * Use BlockBlobClient.uploadStream / uploadData to push the file to Blob Storage.  
  * Store the resulting blob URL (or path) in contentItems in Mongo.​  
* Conversion worker (Python) downloads from blob (using signed URL or SDK), processes, and re‑uploads converted versions back to Blob.

From the app’s perspective, it still just stores file URLs and metadata; the backend hides whether those URLs are local or Azure.

## **2.3 Cache / queue**

Two options:

* Keep Redis local (Docker) for simplicity.  
* Or point BullMQ to a small Redis Cloud free instance (change REDIS\_URL only).
* AZURE_STORAGE_ACCOUNT_KEY=<your_storage_account_key>
Functionality is identical; for localhost dev, local Redis is often simpler.
   Connection string \= DefaultEndpointsProtocol=https;AccountName=<your_account_name>;AccountKey=<your_account_key>;EndpointSuffix=core.windows.net
---

## **3\. Is this significantly harder?**

Not really; it’s a few extra setup steps, but conceptually it’s the same architecture:

* You already need to understand env vars, HTTP APIs, and DB drivers.  
* Adding Atlas/Blob means:  
  * Creating resources via web UI once.  
  * Copy–pasting connection strings into .env.  
  * Swapping the storage adapter implementation with sample code from the Azure quickstarts.

For your “AI‑vibe coder” profile, this is very manageable.

---

## **4\. Minimal concrete changes to your tech spec**

You can tweak your technical requirements doc like this:

1. Datastore section  
   * “Primary DB: MongoDB Atlas M0 (free tier) instead of local MongoDB. The API uses the Atlas connection URI from env vars.”  
2. File & Media Storage section  
   * “All content is stored in Azure Blob Storage (standard/general‑purpose v2 account, free tier where possible). The backend uses @azure/storage-blob to upload/download files; only URLs are stored in MongoDB.”  
3. Dev environment  
   * Docker Compose no longer needs a mongo container (if you rely solely on Atlas).  
   * Keep redis, api, web, ai-conversion services.

If you want, the next step can be:

* A small, concrete config snippet for .env and a TypeScript example of the StorageService interface with a LocalStorageAdapter vs AzureBlobStorageAdapter, so you can plug and play.

Prepared by Deep Research  
Yes you got it, that is what I want.

Now with this crucial discussion, can you update the technical requirements document and make it detailed and comprehensive in chronological way so that the vibe coding AI can understand?  
Here is a revised, detailed technical requirements document that matches your intent:

* App and services run on localhost.  
* Data and files live in real cloud services: MongoDB Atlas M0 on Azure, Azure Blob Storage, optional cloud Redis.  
* Structure is chronological so a coding assistant can implement phase by phase.​

You can copy‑paste this as TECHNICAL\_REQUIREMENTS.md.

---

# **Technical Requirements – Accessible Education Platform (Hybrid Local \+ Cloud Services)**

## **0\. Scope, Goals, and Assumptions**

## **0.1 Goal**

Build a web application that implements the PRD features:

* Multi‑level institute hierarchy (institute → school → department → program → year → division → section).​  
* Course catalog, course offerings, sections/divisions, and elective enrollment.​  
* Accessible content upload, automatic conversion (audio, captions/transcripts, Braille, simplified text).​  
* Accessible content viewer linked with user accessibility profiles.​  
* Multi‑modal assessments, messaging, and admin analytics.​

## **0.2 Deployment & Infra Model**

* Application runtime (Node.js API, React frontend, Python AI workers) runs locally (on developer’s machine, using Docker or direct npm/python commands).  
* Data & storage live in cloud free tiers:  
  * MongoDB Atlas M0 free tier (512 MB, free forever; 100 ops/sec, 1 free cluster) as primary database.  
  * Azure Blob Storage using free/5 GB hot LRS capacity from the Azure free tier for content files (original \+ converted formats).  
  * Redis: local Docker Redis by default; optionally Redis Cloud or Azure Cache free tier.

No Azure App Service, Kubernetes, or deployment pipelines are required at this stage.

## **0.3 Non‑Goals (Now)**

* No production‑grade SSO, LMS integration, or autoscaling; only stubs/interfaces for future implementation.​  
* No detailed Helm/ARM/Bicep deployment specs.

---

## **1\. Technology Stack Summary**

## **1.1 Frontend**

* React 18 \+ TypeScript.  
* React Router for routing.  
* State: Redux Toolkit or Zustand.  
* UI library: Material UI (MUI) for accessibility‑friendly components.  
* Styling: Tailwind CSS or MUI’s SX system.  
* Testing: React Testing Library \+ Jest.

## **1.2 Backend API**

* Node.js LTS.  
* TypeScript.  
* Framework: NestJS (preferred) or Express \+ modular architecture.  
* RESTful JSON APIs; OpenAPI/Swagger docs.  
* Auth: JWT (access \+ refresh) with HTTP‑only cookies.  
* Validation: Zod or class‑validator (if using NestJS).

## **1.3 AI / Conversion Services**

* Python 3.11.  
* Speech‑to‑Text: Whisper (via faster-whisper or whisper.cpp) for transcripts & captions.​  
* Text‑to‑Speech: Coqui TTS (Python library) for generating audio from text.  
* Braille: Liblouis for Grade 2 Braille & Nemeth Code.​  
* Simplified Text: small LLM / heuristic simplifier (OSS model via llama.cpp or a rule‑based first version).

These run as a Python worker service that reads jobs from Redis and writes results to Azure Blob.

## **1.4 Data & Storage**

* Database: MongoDB Atlas M0 cluster deployed on Azure or another provider, but selected with Azure as cloud so it’s close to Blob Storage.  
* File Storage: Azure Blob Storage – general‑purpose v2 storage account, hot tier, using free 5 GB as per Azure free tier limits.  
* Cache & Queue: Redis (local container; cloud later).

---

## **2\. Cloud Services to Provision (Chronological)**

## **2.1 MongoDB Atlas M0 Cluster**

Requirements

* Create a MongoDB Atlas account and a free M0 cluster (512 MB, 100+ ops/s, free forever).  
* Choose Azure as cloud provider and a region close to your Azure storage region.​  
* Configure:  
  * IP allowlist: add your local machine’s IP or 0.0.0.0/0 for dev (not recommended for long term).  
  * Create an app database user (username/password).

Outputs into .env

* mongodb+srv://rameshtavishwakarma97\_db\_user:wtKCAucWbCfM7L3N@cluster0.rknpjbl.mongodb.net/?appName=Cluster0

## **2.2 Azure Storage Account \+ Blob Container**

Requirements

* Create an Azure account (free tier).  
* Create a Storage Account (General Purpose v2).  
* Configure:  
  * Region close to chosen Atlas cluster.  
  * Default access tier: Hot (good for frequently accessed content).  
* Create a Blob container named e.g. content.

Outputs into .env

* AZURE\_STORAGE\_ACCOUNT\_NAME=accessibilitystore  
* AZURE\_STORAGE\_ACCOUNT\_KEY=<your_azure_storage_account_key>

   Connection string \= DefaultEndpointsProtocol=https;AccountName=accessibilitystore;AccountKey=<your_azure_storage_account_key>;EndpointSuffix=core.windows.net

* AZURE\_BLOB\_CONTAINER=content

## **2.3 Optional: Redis Cloud / Local Redis**

* For now, use local Docker Redis (redis:latest).  
* Reserve environment variable:  
  * REDIS\_URL=redis://localhost:6379

---

## **3\. Project Structure (Repo Layout)**

Proposed monorepo:

text

`/`  
  `backend/           # NestJS API`  
  `frontend/          # React app`  
  `workers/           # Python AI services`  
  `infra/             # Docker Compose, scripts`  
  `docs/              # PRD, technical requirements`

---

## **4\. Chronological Implementation Phases**

Each phase is written as “what to build” so a coding assistant can follow step by step.

---

## **Phase 1 – Backend Skeleton & Config**

Objective: Create a minimal NestJS API connected to MongoDB Atlas and Azure Blob clients, with healthcheck endpoints.

Requirements

1. Backend project initialization  
   * Create backend with NestJS \+ TypeScript.  
   * Install core deps: @nestjs/common, @nestjs/core, @nestjs/config, mongoose or @nestjs/mongoose, @azure/storage-blob, ioredis or redis.  
2. Configuration module  
   * Implement a ConfigModule that reads:  
     * MONGODB\_URI, AZURE\_STORAGE\_ACCOUNT\_NAME, AZURE\_STORAGE\_ACCOUNT\_KEY, AZURE\_BLOB\_CONTAINER, REDIS\_URL, JWT\_SECRET, PORT.  
3. Database module  
   * Connect to MongoDB Atlas via MONGODB\_URI.  
   * Expose a Mongoose connection.  
4. Azure Blob client module  
   * Singleton BlobServiceClient initialized with account name & key using @azure/storage-blob.  
   * Helper function uploadBuffer(file: Buffer, path: string) \-\> url.  
   * Helper function getDownloadUrl(path: string) \-\> url (could be direct blob URL or SAS token later).  
5. Redis module  
   * Create Redis connection from REDIS\_URL.  
6. Health endpoints  
   * /health checks DB connection, Redis, and Blob connectivity.

---

## **Phase 2 – Identity, Auth, and RBAC**

Objective: Implement user model, login/signup, JWT auth, and role system based on PRD roles.​

Data Model – users Collection

* \_id  
* instituteId  
* email, passwordHash, name  
* role (enum) – INSTITUTE\_ADMIN, DEAN, HOD, PROGRAM\_COORDINATOR, TEACHER, TA, STUDENT, PARENT.​  
* accessibilityProfile (to be filled later).  
* createdAt, updatedAt

Requirements

1. Auth routes  
   * POST /auth/signup – minimal for now: institute admin \+ student \+ teacher.  
   * POST /auth/login – returns JWT, sets HTTP‑only cookie.  
2. Password hashing  
   * Use Argon2 or bcrypt.  
3. JWT guard & decorators  
   * NestJS guard that validates JWT, attaches user to Request.  
4. RBAC guard  
   * Decorator @Roles('TEACHER', 'INSTITUTE\_ADMIN') plus guard that checks user.role.  
   * Later extended to scope aware (institute, program, etc.).

---

## **Phase 3 – Institute & Academic Hierarchy**

Objective: Model and manage the multi‑level hierarchy as per PRD (Feature 10).​

Data Models

* institutes: \_id, name, branding, settings.  
* schools: \_id, instituteId, name.  
* departments: \_id, schoolId, name.  
* programs: \_id, departmentId, name, code, type (e.g., B.Tech CS).  
* years: \_id, programId, number (1–4).  
* divisions: \_id, yearId, name (A, B, C).  
* sections (optional if separate from divisions).  
* terms: \_id, name (Fall 2026), startDate, endDate.

Requirements

1. Admin APIs  
   * CRUD for each entity, restricted to INSTITUTE\_ADMIN or higher.  
   * Validation to prevent orphan nodes (e.g., department must reference valid schoolId).  
2. Configurable labels (future)  
   * Config in institutes.settings where admins can rename “Division” → “Section”, etc.  
3. User linkage  
   * users must reference: programId, yearId, divisionId for students; relevant scope for staff.

---

## **Phase 4 – Course Catalog, Offerings & Enrollment**

Objective: Implement course system that matches PRD Feature 11 and supports electives.​

Data Models

* courses: code, name, description, credits, departmentId, courseType (CORE/ELECTIVE), prerequisites.  
* courseOfferings: courseId, termId, programIds\[\], yearIds\[\], sections\[\], teachers\[\], capacity per section.  
* electiveGroups: programId, yearId, termId, list of courseIds, rules (min/max selections).  
* enrollments: studentId, courseOfferingId, sectionName, status (ENROLLED/WAITLISTED).

Requirements

1. Admin/program coordinator APIs  
   * Create courses & prerequisites.  
   * Create course offerings per term, map to program/year/division.  
   * Define electiveGroups.  
2. Student APIs  
   * GET /me/courses – view enrolled courses this term.  
   * GET /me/electives – see available electives & rules.  
   * POST /me/enroll – request enrollment; validate limits.  
3. Teacher linkages  
   * courseOfferings.teachers stores teacher IDs; RBAC uses this for scope.

---

## **Phase 5 – Content Storage & Azure Blob Integration**

Objective: Implement teacher content upload and storage in Azure Blob (not local disk), matching PRD Features 2 & 6.​

Data Model – contentItems

* \_id  
* ownerTeacherId  
* instituteId, programId, yearId, divisionId, courseId, courseOfferingId, sections\[\].  
* title, description, tags\[\]  
* type (LECTURE, ASSIGNMENT, REFERENCE, LAB, OTHER).  
* original:  
  * azureBlobPath (e.g., originals/{contentId}/{filename})  
  * mimeType, sizeBytes  
* availableFormats:  
  * audio, captions, transcript, braille, simplified (with blob paths).  
* publishStatus (DRAFT, PUBLISHED).  
* visibilityScope (PROGRAM/COURSE/OFFERING/SECTION/STUDENTS).  
* createdAt, updatedAt

Requirements

1. Upload API  
   * POST /content – form fields: metadata \+ file.  
   * Backend:  
     * Reads file into memory/stream.  
     * Uses Azure Blob SDK to upload to content container under originals/{contentId}/....  
     * Creates contentItems record with original blob path.  
     * Enqueues conversion jobs into Redis queue.  
2. Scoping/targeting UI \+ API  
   * Allow teacher to choose:  
     * All my sections of this course.  
     * Specific sections/divisions.  
     * Specific students.  
   * Persist this as visibilityScope.  
3. List & fetch content  
   * GET /content/my-teaching – list content for teacher by courseOffering.  
   * GET /content/for-me – student view; filter by enrollments \+ visibilityScope.

---

## **Phase 6 – Conversion Pipeline (Whisper, Coqui, Liblouis, Simplifier)**

Objective: Implement the automatic content conversion engine (PRD Feature 2\) using open‑source tools.​

Data Model – conversionJobs

* \_id  
* contentId  
* jobType (TTS, CAPTIONS, TRANSCRIPT, BRAILLE, SIMPLIFIED\_TEXT)  
* status (PENDING, IN\_PROGRESS, COMPLETED, FAILED, READY\_FOR\_REVIEW)  
* inputBlobPath, outputBlobPath  
* errorMessage (if any)  
* createdAt, updatedAt

Requirements

1. Job Enqueue (backend)  
   * After content upload, create jobs for Tier 1 (audio, basic captions, transcript, high contrast) and Tier 2 (braille, simplified, sign language placeholder).​  
   * Push messages into Redis queue with contentId, jobType, inputBlobPath.  
2. Worker Process (Python)  
   * Single workers service:  
     * Connects to Redis.  
     * For each job type:  
       * TRANSCRIPT/CAPTIONS:  
         * Download original from Azure Blob (via Python SDK).  
         * Run Whisper to generate transcript and .vtt/.srt captions.  
         * Upload to Azure Blob under converted/{contentId}/transcript.\*.  
       * TTS:  
         * For textual content (PDF \-\> pre‑extracted text or teacher‑provided text).  
         * Run Coqui TTS to produce .mp3.  
         * Upload to converted/{contentId}/audio.mp3.  
       * BRAILLE:  
         * Run Liblouis on text to produce .brf.  
         * Upload to converted/{contentId}/braille.brf.  
       * SIMPLIFIED\_TEXT:  
         * Run simple text simplifier (Phase 1: heuristic; later LLM).  
         * Upload to converted/{contentId}/simplified.txt.  
     * Update conversionJobs and contentItems.availableFormats.  
3. Review queue (Tier 2\)  
   * GET /content/conversions/review – list pending Braille/simplified jobs for teacher review.  
   * POST /content/conversions/:jobId/approve – mark as approved and visible.

---

## **Phase 7 – Accessibility Profiles & Content Viewer**

Objective: Connect user accessibility profiles to content viewing experience (PRD Feature 1 & 3).​

Data Model – users.accessibilityProfile

* disabilities\[\]: Blind, Low Vision, Deaf, Hard of Hearing, Mute, Speech Impaired, ADHD, Dyslexia, Autism, Cognitive, Motor, Other.​  
* preferences: fontSizeMultiplier, contrastMode, ttsSpeed, extendedTimeMultiplier, inputMethods, modulesActivated\[\] (derived).

Requirements

1. Profile APIs  
   * GET /me/accessibility-profile  
   * PUT /me/accessibility-profile – allow updating disabilities and preferences.  
2. Frontend global state  
   * Load profile on login and store in context.  
   * Derive active modules (visual, auditory, cognitive, navigation).​  
3. Accessible Content Viewer​  
   * Given a contentItem, show:  
     * Format selector: Original, Audio, Captions, Transcript, Simplified, High‑Contrast.  
     * Auto‑select default based on accessibilityProfile.  
   * Implement:  
     * Text viewer (HTML/PDF) with adjustable font & contrast.  
     * Audio player for TTS.  
     * Video player with captions track, sign language overlay stub.  
   * Track progress in progressTracking collection (contentId, userId, position).

---

## **Phase 8 – Multi‑Modal Assessments**

Objective: Implement Feature 4 using existing stack.​

Data Models

* assessments: courseOfferingId, title, timeLimitMinutes, questions\[\].  
* questions: embedded or separate collection; fields: type (MCQ/TF/SHORT/ESSAY/FILE/AUDIO/VIDEO), text, options, correctAnswers.  
* submissions: assessmentId, studentId, responses\[\], score, status, timeStarted, timeSubmitted.

Requirements

1. Creation APIs  
   * Teachers create assessments under specific courseOfferingId.  
2. Extended time logic  
   * When student loads assessment, compute time \= base \* extendedTimeMultiplier from profile.​  
3. Client  
   * Accessible question navigation (keyboard‑friendly).  
   * Support for answering with text, file uploads, audio/video recording.  
   * Upload recorded media to Azure Blob like content items.  
4. Grading  
   * Auto‑grade MCQ/TF; queue rest for manual grading.

---

## **Phase 9 – Messaging & Notifications**

Objective: Implement Feature 5 with local Socket.IO and cloud data.​

Data Models

* threads: scope (courseOfferingId, section, direct user→user).  
* messages: threadId, senderId, type (TEXT/AUDIO/VIDEO/FILE), body (text or blob URL), timestamps.

Requirements

1. Messaging API \+ WebSocket  
   * REST to fetch threads/history.  
   * Socket.IO for real‑time messages.  
2. Audio/video messages  
   * Upload using Azure Blob (same pipeline).  
   * Worker uses Whisper to transcribe audio/video, stores transcript in messages.transcript.  
3. Notifications  
   * Use Redis queue to send email notifications (via free SMTP provider) respecting accessibility profile notification preferences.​

---

## **Phase 10 – Admin Dashboard & Analytics**

Objective: Implement Feature 7 analytics on top of collected events.​

Data Models

* analyticsEvents: userId, type (VIEW\_CONTENT, COMPLETE\_ASSESSMENT, FORMAT\_USED, MESSAGE\_SENT, etc.), payload (contentId, format, etc.), timestamp.  
* analyticsSnapshots: pre‑aggregated metrics per period (e.g., daily, weekly) per scope (program, year, division, courseOffering).

Requirements

1. Event tracking middleware  
   * On key actions (view content, change format, submit assessment), create analyticsEvents record.  
2. Batch aggregation job  
   * Cron or periodic worker that aggregates events into analyticsSnapshots.  
3. Admin dashboard  
   * UI widgets:  
     * Students with disabilities by type.​  
     * Format usage (audio vs text vs braille) by program/year.​  
     * Content coverage (% with required formats).​  
   * Filters by institute hierarchy.

---

## **5\. Environment & Configuration Requirements**

* .env example (not values, just keys):

text

`MONGODB_URI=`  
`AZURE_STORAGE_ACCOUNT_NAME=`  
`AZURE_STORAGE_ACCOUNT_KEY=`  
`AZURE_BLOB_CONTAINER=content`  
`REDIS_URL=redis://localhost:6379`  
`JWT_SECRET=super-secret`  
`PORT=4000`  
`NODE_ENV=development`

* All secrets must be local only (no commit to Git).

---

## **6\. Security & Privacy Requirements**

* Treat accessibilityProfile and disability info as sensitive; log reads/writes in auditLogs with who/when.​  
* Only authorized roles (e.g., teacher for their students, accessibility coordinator, institute admin) can view/edit these profiles.  
* Enforce strict RBAC checks around all admin and hierarchy APIs.​

---

This document now reflects:

* Your hybrid model (local runtime \+ cloud DB/storage).  
* The full PRD feature set mapped into technical modules and data models.​  
* A chronological build path that a vibe‑coding AI can follow phase by phase.

If you want, the next step can be: a “Phase 1–3 only” cut with specific folder names and function signatures so you can literally paste tasks into an AI code agent.