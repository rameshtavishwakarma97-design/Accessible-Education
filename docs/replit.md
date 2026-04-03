# Accessible Education Platform (AccessEd)

## Overview
Full-stack Accessible Education Platform serving students with disabilities, teachers, and administrators. Built with Express + React + PostgreSQL following the TRD specification.

## Architecture
- **Backend**: Express.js + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs password hashing
- **Routing**: wouter (frontend)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: recharts
- **State**: React Context (AuthProvider)
- **File Uploads**: multer (local storage)

## Design System
- **Fonts**: Lora (headings), DM Sans (body), JetBrains Mono (code)
- **Primary Color**: #355872 (warm blue)
- **Accent Colors**: #7AAACE, #9CD5FF
- **Background**: #F7F8F0 (warm cream)
- **Success**: #2E8B6E | Warning: #C07B1A | Error: #C0392B
- **WCAG**: AA baseline, AAA for critical flows

## Backend Structure

### Database Schema (`shared/schema.ts`)
All tables defined with Drizzle ORM:
- **users** - All user types (student, teacher, admin) with disabilities, preferences, accessibility profiles
- **institutes, schools, departments, programs, years, divisions, terms** - Full academic hierarchy
- **courses, course_offerings** - Course catalog and term-specific offerings with teacher assignments
- **enrollments** - Dual-track (admin_assigned / student_selected) enrollment
- **content_items** - Learning materials with multi-format support (original, audio, braille, simplified, etc.)
- **conversion_jobs** - Accessibility format conversion tracking (tier 1 auto, tier 2 review)
- **assessments, submissions** - Multi-modal assessments with save & exit support
- **threads, messages** - Messaging system
- **announcements** - Announcements with scope targeting
- **analytics_events, audit_logs** - Event tracking and audit trail
- **platform_settings** - Per-institute configuration

### API Routes (`server/routes.ts`)
All routes prefixed with `/api`:

**Auth**: POST /auth/register, /auth/login, /auth/logout, GET /auth/me
**Users**: GET/PATCH /users/:id, PUT /users/:id/accessibility-profile, GET /me/accessibility-profile
**Admin Users**: POST /admin/users, /admin/users/:id/deactivate, /admin/users/:id/reset-password
**Hierarchy**: Full CRUD for institutes/schools/departments/programs/years/divisions/terms, GET /hierarchy
**Courses**: CRUD for courses and course-offerings, teacher assignment
**Enrollment**: Dual-track enrollment (admin bulk + student self-enroll), unenroll
**Content**: Upload with multer, CRUD, soft-delete/restore/permanent-delete, trash
**Conversions**: List/approve/reject/retry conversion jobs
**Assessments**: CRUD, start/answer/save-exit/resume/submit flow
**Messaging**: Threads + messages CRUD
**Announcements**: CRUD with scope targeting
**Dashboard**: Student/teacher/admin dashboards with aggregated stats
**Analytics**: Event tracking, admin analytics
**Settings**: Platform settings CRUD
**Audit Logs**: Read-only audit trail

### Auth (`server/auth.ts`)
- JWT tokens with 7-day expiry using SESSION_SECRET
- bcryptjs password hashing
- requireAuth middleware (Bearer token)
- requireRole middleware (RBAC enforcement)

### Storage (`server/storage.ts`)
- DatabaseStorage class implementing IStorage interface
- All CRUD operations using Drizzle ORM
- Hierarchy tree builder
- Admin stats aggregation

### Seed Data (`server/seed.ts`)
- Auto-seeds on first startup (checks for existing users)
- 14 users: 8 students, 5 teachers, 1 admin
- Full hierarchy: 1 institute, 3 schools, 4 departments, 4 programs
- 6 courses, 6 course offerings, student enrollments
- 8 content items, 8 conversion jobs
- 5 assessments with questions
- 4 announcements, 3 message threads with messages
- Default password for all seed users: `password123`

## Key Files

### Backend
- `server/index.ts` — Express server entry point with seed
- `server/routes.ts` — All API route handlers
- `server/storage.ts` — Database storage interface & implementation
- `server/auth.ts` — JWT auth utilities and middleware
- `server/seed.ts` — Database seed script
- `server/db.ts` — Drizzle database connection
- `shared/schema.ts` — Complete database schema with types

### Frontend Core
- `client/src/lib/mock-data.ts` — Mock data types and sample data (frontend reference)
- `client/src/lib/auth-context.tsx` — Auth context
- `client/src/App.tsx` — Route configuration
- `client/src/components/app-sidebar.tsx` — Role-based sidebar
- `client/src/components/top-bar.tsx` — Top bar with notifications

### Frontend Pages
**Student**: dashboard, courses, course-detail, assessments, content-viewer, assessment-taking
**Teacher**: dashboard, course-detail, conversions
**Admin**: dashboard, hierarchy, users, courses, enrollment, conversions, analytics, settings
**Shared**: messages, announcements

## Running
- `npm run dev` starts Express backend + Vite frontend on port 5000
- Database auto-seeds on first startup
- `npm run db:push` to push schema changes to PostgreSQL

## Test Credentials
- Student: maya.sharma@university.edu / password123
- Teacher: anand.rao@university.edu / password123
- Admin: priya.patel@university.edu / password123
