<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# So there are still many many many errors in the application. Copilot fixed the 10 broken features but still the conversion features are not working, actual course material is not getting converted, there are still dummy data, I cannot see content getting converted into braille, audio, simplified so on and so forth. Furthermore, even after approving I cannot see the content being approved as a teacher.

Referring to my PRD. Can you write comprehensive test cases which I will give to gemini CLI, it will use playwright mcp to test the edge cases. You don't have to write the code to test, but instruct gemini to use Playwright browser tools to test every feature of this
accessible education platform. Control the browser like a
eal user would — click buttons, fill forms, navigate pages. You have to write the features it should test

I want extremely drilled down testing, like each and every feature, the minor to minor features.

Take your time to draft the document. Once done let me know. I want this to be one shot where I identify all the errors at once in my app. Each and every error.

I now have a comprehensive understanding of every feature from all three documents. Let me draft the full test document.

***

# Accessible Education Platform — Gemini CLI Playwright Test Execution Pack

> **Instructions for Gemini CLI:** You are a QA automation agent. Using Playwright MCP browser tools, test every feature of this Accessible Education Platform **exactly as a real human user would** — click buttons, fill forms, navigate pages, wait for responses, read the DOM. Do NOT write Playwright scripts. **Directly control the browser** using your Playwright MCP tools. For every test, report:
> - ✅ PASS — Feature works as expected
> - ❌ FAIL — What you expected vs. what actually happened (exact DOM state, URL, error message)
> - ⚠️ PARTIAL — Works but something is wrong (describe precisely)
> - 🔲 NOT FOUND — UI element does not exist / page does not load
>
> Be extremely specific in failures. "Button doesn't work" is not acceptable. Report: what you clicked, what the network response was (status + body if visible), what the DOM changed to, and what it should have changed to.
>
> **Base URL:** `http://localhost:3000` (adjust if different)
> **Test accounts to use** (create via seed or use existing):
> - Admin: `admin@test.com` / `Admin@1234`
> - Teacher: `teacher@test.com` / `Teacher@1234`
> - Student: `student@test.com` / `Student@1234`
>
> **Start every test section from a fresh page load unless otherwise noted.**
> **Run tests in this exact order** — later tests depend on data created by earlier ones.

***

## MODULE 0 — Pre-Test Setup \& Health Check

### T0.1 — Application Loads

1. Navigate to `http://localhost:3000`
2. Verify the page loads without blank screen, console errors, or a crashed React tree
3. Check the page title contains "Accessible Education" or equivalent
4. Verify the URL either stays at `/` or redirects to `/login`
5. **REPORT:** What is the exact page title? What is the URL after load? Are there any console errors?

### T0.2 — Backend Health

1. Navigate to `http://localhost:4000/health`
2. Verify JSON response is `{ "status": "ok", "services": { "db": "ok", "redis": "ok", "storage": "ok" } }`
3. **REPORT:** Exact response body. If any service is not `"ok"`, note which one and what value it shows.

### T0.3 — Swagger API Docs

1. Navigate to `http://localhost:4000/api/docs`
2. Verify Swagger UI loads and lists endpoints grouped by module
3. **REPORT:** Does Swagger load? Are these modules present: auth, users, content, conversions, assessments, messaging, announcements, admin, settings?

***

## MODULE 1 — Authentication

### T1.1 — Login Page Renders

1. Navigate to `/login`
2. Verify the following elements exist:
    - Product logo or wordmark
    - `h2` or heading with "Welcome back" or equivalent
    - Email input with a visible label (not just placeholder)
    - Password input with a visible label
    - Show/hide password toggle button

```
- "Sign In" submit button (must be `<button type="submit">`, not a `<div>`)
```

    - Link to `/pre-login-accessibility`
3. **REPORT:** Are all elements present? What are the exact input labels?

### T1.2 — Pre-Login Accessibility Page

1. Click the accessibility link on the login page (route: `/pre-login-accessibility`)
2. Verify the page loads WITHOUT requiring authentication
3. Verify `h1` contains "Accessibility Settings" or "Before You Log In"
4. Verify a font size selector (native `<select>`) is present
5. Verify a contrast mode toggle (checkbox or toggle) is present
6. Verify a "Play sample text" / TTS demo button exists
7. Change font size to "Large" — verify the page text visually enlarges
8. Toggle contrast mode — verify the background/text color changes
9. Click the TTS demo button — verify an audio element appears or plays
10. Navigate back to login — verify the settings persisted (font size is still large)
11. **REPORT:** Each element presence. Did font size apply? Did contrast apply? Did TTS play?

### T1.3 — Login with Invalid Credentials

1. Go to `/login`
2. Enter email: `notauser@test.com`, password: `wrongpass`
3. Click "Sign In"
4. Verify: no page reload, error message appears inline below the form
5. Verify: error text is not empty (e.g. "Incorrect email or password")
6. **REPORT:** Where does the error appear? Is it in an `aria-live` region? What is the exact error text?

### T1.4 — Login as Admin

1. Enter `admin@test.com` / `Admin@1234` and submit
2. Verify redirect to `/admin/dashboard`
3. Verify the left navigation shows: Dashboard, Hierarchy, Users, Courses, Enrollment, Conversions, Analytics, Settings
4. Verify the top bar shows: logo, breadcrumb, notification bell, avatar
5. Verify the avatar shows initials or an image (not broken)
6. **REPORT:** Exact URL after login. Left nav items visible. Any console errors?

### T1.5 — Login as Teacher

1. Log out (or open incognito), log in as `teacher@test.com` / `Teacher@1234`
2. Verify redirect to `/teacher/dashboard`
3. Verify left nav shows: Dashboard, My Courses, Content Library, Conversion Queue, Assessments, Messages
4. **REPORT:** Exact URL. Nav items. Any missing or extra items?

### T1.6 — Login as Student

1. Log in as `student@test.com` / `Student@1234`
2. Verify redirect to `/student/dashboard`
3. Verify left nav shows: Dashboard, Courses, Content, Assessments, Messages, Profile
4. **REPORT:** Exact URL. Nav items.

### T1.7 — First-Login Forced Profile Setup Modal (Student)

> Use a newly created student account that has never set up their profile.

1. Log in as the new student
2. Verify a full-screen modal opens immediately
3. Verify it cannot be dismissed with Escape key
4. Verify clicking outside the modal does NOT close it
5. Verify Tab key stays inside the modal (focus trap)
6. Verify there is a step indicator ("Step 1 of 3" or similar)
7. Verify step 1 has a disability multi-select picker with all these options: Blind, Low Vision, Deaf, Hard of Hearing, Mute, Speech Impaired, ADHD, Dyslexia, Autism, Cognitive, Motor, Other
8. Select "Blind" and "ADHD" — verify both can be selected simultaneously
9. Click "Next" — verify progress to Step 2
10. Step 2 should show preferences: font size slider (0.5x–3.0x), TTS speed (0.5x–2.0x), extended time multiplier (1.0x–3.0x), contrast mode toggle
11. Adjust font size to 2.0x — verify slider moves and value shows "2.0x"
12. Click "Next" — verify Step 3 appears
13. Step 3 should show assistive device registration: screen reader type select, Braille display model input, AAC device model input
14. Click "Save Profile" — verify modal closes
15. Verify a success toast/alert appears: "Accessibility profile saved. Your modules are now active." or equivalent
16. **REPORT:** Each step element presence. Did modal close after save? Did toast appear? Are there any elements that couldn't be found?

### T1.8 — Session Persistence on Refresh

1. Log in as Admin
2. Navigate to `/admin/users`
3. Press F5 / hard refresh the page
4. Verify: you are NOT redirected to `/login` — you stay on `/admin/users`
5. Verify: there is no brief flash of the login page before the dashboard appears
6. Verify: no 401 errors appear in the browser console during page load
7. **REPORT:** Did the page stay on `/admin/users`? Was there a login redirect? Were there any console errors?

### T1.9 — Logout

1. While logged in, find and click the logout / "Sign out" button (sidebar bottom or avatar dropdown)
2. Verify redirect to `/login`
3. Verify: navigating back to `/admin/dashboard` in the browser redirects back to `/login` (not the dashboard)
4. **REPORT:** Where was the logout button located? Did redirect happen? Did protected route guard work?

### T1.10 — RBAC Route Protection

1. While not logged in (or logged in as Student), manually navigate to:
    - `/admin/dashboard`
    - `/admin/users`
    - `/teacher/conversions`
2. Verify each redirects to `/login` or shows "Unauthorized" — not a blank page
3. **REPORT:** What happened at each URL? Did it redirect, show 403, or just render a blank page?

***

## MODULE 2 — Admin: Institute Hierarchy

### T2.1 — Hierarchy Page Loads

1. Log in as Admin, navigate to `/admin/hierarchy` (or click "Hierarchy" in nav)
2. Verify the page loads with a tree view showing at least one node (the institute)
3. Verify NO 404 error appears in the browser console for any `/api/hierarchy` or `/institutes/*/hierarchy` call
4. **REPORT:** Does the tree render? How many nodes are visible? Any 404s in console?

### T2.2 — Hierarchy Tree Expand/Collapse

1. On the hierarchy tree, click a top-level node (Institute)
2. Verify it expands to show children (Schools/Colleges)
3. Click a School node — verify it expands to show Departments
4. Expand all the way down to Division level
5. Click an expanded node — verify it collapses
6. **REPORT:** Does expand/collapse work at each level? What levels are visible: Institute → School → Department → Program → Year → Division?

### T2.3 — Add Hierarchy Node

1. Click the Institute node — verify an inline action panel opens (Edit, Add child, Retire)
2. Click "Add child node" or "Add School"
3. Fill in a name (e.g. "School of Engineering")
4. Submit
5. Verify the new node appears in the tree
6. **REPORT:** Did the inline panel open? Did the form submit? Did the tree update?

### T2.4 — Edit Hierarchy Node

1. Click any existing node in the tree
2. Click "Edit" in the action panel
3. Change the name
4. Save
5. Verify the tree updates with the new name
6. Verify breadcrumbs elsewhere in the app (if visible) also reflect the updated name within 2 minutes
7. **REPORT:** Did the edit save? Did the name update in the tree?

### T2.5 — Retire / Soft-Delete Hierarchy Node

1. Click a leaf node (e.g. a Division)
2. Click "Retire node"
3. Verify a confirmation dialog appears
4. Confirm
5. Verify the node is removed from the active tree
6. **REPORT:** Did the node disappear from tree? Was there a confirmation dialog?

***

## MODULE 3 — Admin: User Management

### T3.1 — Users Page Loads

1. Navigate to `/admin/users`
2. Verify a table of users loads with columns: Name, Email, Role, Program/Year/Division, Status, Accessibility Profile (chip), Actions
3. Verify filter bar is present: Role dropdown (All, Student, Teacher, TA, Admin, Program Coordinator), Search input
4. Verify top action buttons: "Add User", "Import CSV", "Export List"
5. **REPORT:** Does table load with data or is it empty? Which columns are present? Which buttons exist?

### T3.2 — Filter Users by Role

1. In the Role filter, select "Teacher"
2. Verify the table updates to show only Teacher-role users
3. Select "Student" — verify table updates
4. Type a partial name/email in the search box — verify table filters in real time
5. **REPORT:** Do filters work? Does search filter in real time?

### T3.3 — Add User Manually

1. Click "Add User" button
2. Verify a modal dialog opens
3. Verify the modal has fields: Name (required), Email (required), Role (required select), and conditional fields for academic context (Program/Year/Division when role = Student)
4. Submit the form with all fields EMPTY — verify validation errors appear on each required field
5. Fill in: Name = "Test Teacher", Email = `testteacher@test.com`, Role = "Teacher"
6. Click "Create" / "Save"
7. Verify the modal closes and a success toast appears
8. Verify the new user appears in the table
9. **REPORT:** Did modal open? Were validation errors shown for empty submit? Did user get created? Did table refresh?

### T3.4 — Edit User

1. Find any user in the table, click "Edit" in their Actions column (hover to reveal)
2. Verify an edit modal/form opens
3. Change the user's name
4. Save
5. Verify the table reflects the change
6. **REPORT:** Did edit work? Did table update?

### T3.5 — Deactivate User

1. Find an active non-admin user, click "Deactivate"
2. Verify a confirmation appears
3. Confirm the deactivation
4. Verify the user's status chip in the table changes to "Inactive"
5. **REPORT:** Did deactivation work? Did status change?

### T3.6 — Bulk CSV Import (DEFERRED)

1. Click "Import CSV" button
2. Verify the button is either disabled OR shows a "Coming soon" / "Not available" message
3. Verify it does NOT open a broken/empty modal
4. **REPORT:** What happens when you click "Import CSV"? Is it disabled with a tooltip?

### T3.7 — View Teacher Workload

1. Find a Teacher user in the table, click their row or a "View" action
2. Verify a teacher profile/drawer opens showing: assigned courseOfferings, student counts, pending Tier 2 review count
3. **REPORT:** Does the workload view open? Is there real data or "N/A" / dummy data?

***

## MODULE 4 — Admin: Teacher-to-Course Assignment

### T4.1 — Courses Table (Admin View)

1. Navigate to `/admin/courses`
2. Verify a table of course offerings loads with columns: Course Code, Course Name, Term, Program, Year, Sections, Teacher(s), Actions
3. **REPORT:** Does the table load? Is there real data or dummy placeholders?

### T4.2 — Assign Teacher to Course Offering

1. Find a course offering row, click "Manage Teachers" in the Actions column
2. Verify a panel/modal opens with a teacher search input
3. Search for "test" or "teacher" — verify real results appear from the users database
4. Select a teacher from results
5. Choose which sections they will handle (e.g., "All" or specific divisions)
6. Click "Assign"
7. Verify a success toast: "Teacher assigned to [Course Name]"
8. Verify the course offering row now shows the assigned teacher
9. **REPORT:** Did the search return results? Did assignment work? Did the UI update?

### T4.3 — Remove Teacher from Course Offering

1. On the same course offering, open "Manage Teachers"
2. Click the remove/unassign button next to the assigned teacher
3. Verify a confirmation dialog
4. Confirm
5. Verify teacher is removed from the course offering
6. Verify: navigate to teacher's content library — their previously uploaded content should STILL be there (content orphaned to offering, not deleted)
7. **REPORT:** Was teacher removed? Was their content preserved?

***

## MODULE 5 — Admin: Student Enrollment

### T5.1 — Enrollment Dashboard Loads

1. Navigate to `/admin/enrollment`
2. Verify the following tabs exist: Core Enrollments, Elective Enrollments, Waitlists, Bulk Import
3. Click "Core Enrollments" tab
4. Verify a filter bar: Term, Program, Year, Division
5. Verify a table showing: Course Offering, Enrolled Count, Capacity, Fill %
6. **REPORT:** Do tabs exist? Does table load? Is data real or placeholder?

### T5.2 — Bulk Enroll Cohort (Track A)

1. In Core Enrollments tab, click "Bulk Enroll" or equivalent action
2. Select a Program, Year, Division, Term, and Course Offering
3. Click "Enroll Cohort"
4. Verify a confirmation: "X students will be enrolled in [Course]"
5. Confirm
6. Verify the enrollment count in the table increases
7. **REPORT:** Did bulk enroll work? Did count update? Or did nothing happen?

### T5.3 — Enroll Individual Student (Track A)

1. Click "Enroll Individual" or search for a student in the enrollment panel
2. Search for the student account
3. Select a course offering and section
4. Click Enroll
5. Verify success toast and table update
6. **REPORT:** Did individual enrollment work?

### T5.4 — Force Remove Student from Enrollment

1. Find an enrolled student in the table
2. Click "Remove" / force-unenroll
3. Verify a reason field is required
4. Fill in a reason and confirm
5. Verify the student is removed and an audit log entry would be created
6. **REPORT:** Was reason field required? Did removal work?

***

## MODULE 6 — Admin: Dashboard \& Analytics

### T6.1 — Admin Dashboard Loads

1. Navigate to `/admin/dashboard`
2. Verify top stat strip shows cards for: Total Students, Students with Disabilities (count + %), Total Teachers, Content Accessibility Coverage %, Conversion Failure Rate
3. Verify the left panel shows the hierarchy tree
4. Verify the center panel shows accessibility metrics charts (disability breakdown, format usage)
5. Verify the right panel shows Alerts (failed conversions, missing formats, unmapped IEPs)
6. **REPORT:** Which stat cards show real numbers vs. "0" or "N/A"? Do charts render? Do alerts show?

### T6.2 — Hierarchy Tree Filters Dashboard

1. On the Admin Dashboard, click a program node in the hierarchy tree
2. Verify the stat cards and charts update to show data scoped to that program only
3. Click back to the root (Institute) — verify data returns to institute-wide view
4. **REPORT:** Did filtering work? Did charts/cards update?

### T6.3 — Admin Conversions Monitor

1. Navigate to `/admin/conversions`
2. Verify a table of all conversion jobs loads with: Content Title, Course, Format Type, Status, Updated, Teacher
3. Verify filters: Status (Failed, In-Progress, Completed), Format Type, Program, Term
4. Filter by Status = "Failed" — verify table updates
5. **REPORT:** Does the conversions monitor load? Are there real job records or dummy data?

### T6.4 — Compliance Report Export

1. On `/admin/dashboard` or navigate to `/admin/reports`
2. Click "Export Compliance Report" or "Download PDF"
3. Verify a PDF or CSV download is triggered
4. Verify the file is not empty or corrupted
5. **REPORT:** Did export work? What file was downloaded?

***

## MODULE 7 — Admin: Platform Settings

### T7.1 — Settings Page Loads

1. Navigate to `/admin/settings`
2. Verify tabs are present: Institution, Academic Structure, API Integrations, Notifications, Security, Cost Tracking
3. **REPORT:** Do all 6 tabs exist? Which tab is active by default?

### T7.2 — Institution Settings

1. Click "Institution" tab
2. Verify fields: Institution Name (text input), Logo Upload (file input), Primary Domain, Default Language, Academic Year Start Month
3. Change the Institution Name to "Test Institute Updated"
4. Click Save
5. Verify success toast
6. Refresh the page — verify the name persisted
7. **REPORT:** Did save work? Did it persist on refresh?

### T7.3 — Branding Color Validation

1. In Institution tab, find the "Primary Color" input
2. Enter a low-contrast color like `#FFFF00` (yellow — fails WCAG AA contrast on white)
3. Click Save / Validate
4. Verify the app REJECTS this color with an explanation about WCAG contrast
5. Enter `#355872` (the spec's valid deep blue)
6. Verify it ACCEPTS this color
7. **REPORT:** Did the validation reject the low-contrast color? Did it explain why?

### T7.4 — API Keys Are Masked

1. Click "API Integrations" tab
2. Verify any API keys shown are MASKED (e.g., `sk-****` or `••••••••`)
3. Verify the input fields are disabled with a tooltip explaining "Environment-managed, read-only" or similar
4. Verify there is NO plain-text API key visible anywhere on the page
5. **REPORT:** Are keys masked? Are inputs disabled? Is there any plain text key visible?

### T7.5 — Academic Structure / Hierarchy Labels

1. Click "Academic Structure" tab
2. Find hierarchy label configuration — e.g., rename "Division" to "Section"
3. Save the change
4. Navigate to any breadcrumb or dropdown in the app that previously showed "Division"
5. Verify it now shows "Section" within 2 minutes
6. **REPORT:** Did label change save? Did it propagate across the UI?

### T7.6 — Security Settings

1. Click "Security" tab
2. Verify fields: Session Timeout (minutes), Password Policy (minimum length, complexity), Audit Log Retention (days)
3. Change session timeout to 30 minutes
4. Save
5. Verify success toast and persistence on refresh
6. **REPORT:** Did security settings save?

***

## MODULE 8 — Teacher: Dashboard

### T8.1 — Teacher Dashboard Loads

1. Log in as Teacher, navigate to `/teacher/dashboard`
2. Verify: grid of assigned course offering cards
3. Each card should show: Course Code, Course Name, Term, Number of Students, Section (Division)
4. Verify: Conversion Queue summary card showing counts by format type (Braille N pending, Simplified N pending, Sign Language N pending)
5. Verify: Recent Content Activity list showing recent uploads with their conversion status (green checkmark = done, amber spinner = in-progress, red X = failed)
6. **REPORT:** Does each section render? Are conversion counts real or all showing "0"?

### T8.2 — Term Selector on Dashboard

1. Find the term selector (dropdown) on the teacher dashboard
2. Change the term (e.g., from Spring 2026 to Fall 2025 if available)
3. Verify the course cards update to show the selected term's offerings
4. **REPORT:** Does the term selector work? Do cards update?

***

## MODULE 9 — Teacher: Content Upload \& Management

### T9.1 — Teacher Course Detail Page

1. From the Teacher Dashboard, click on a course card
2. Verify navigation to `/teacher/courses/:offeringId`
3. Verify tabs are present: Content, Conversion Queue, Students, Assessments, Messages
4. Click "Content" tab
5. Verify a table with columns: Title, Type, Format Status Icons, Publish Status, Last Updated, Actions (hover)
6. **REPORT:** Does the course detail page load? Do all tabs exist? What does the content table show — real data or empty?

### T9.2 — Upload Content (PDF)

1. On the Content tab, click "Upload Content"
2. Verify a 3-step modal opens:
    - **Step 1:** Title input, Content Type select (Lecture, Assignment, Reference, Lab, Other), Description textarea
    - **Step 2:** Course Offering is pre-filled, Sections checkboxes (Div A, Div B, etc.)
    - **Step 3:** File drop zone (supports PDF, DOCX, MP4, MP3, JPG, PNG, URL)
3. Fill in Step 1: Title = "Test Lecture 1", Type = "Lecture"
4. Click Next → Step 2: select all sections
5. Click Next → Step 3: upload a small PDF file (use any available test PDF)
6. Click "Upload \& Convert"
7. Verify: modal closes, success toast appears: "Upload started — Tier 1 conversion in progress"
8. Verify: a new row appears in the content table immediately with status "Converting"
9. **REPORT:** Did all 3 steps of the modal work? Did the upload toast appear? Did the table row appear? What status does it show?

### T9.3 — Wait for Tier 1 Conversion

1. After upload, watch the content table row for the uploaded file
2. Wait up to 5 minutes for Tier 1 conversion to complete
3. Observe the status change from "Converting" to "Published" or "Review Required"
4. Check whether format status icons update: Audio ✅, Captions ✅, Transcript ✅, High Contrast ✅
5. **REPORT:** Did the status change? Which Tier 1 formats (Audio, Captions, Transcript, High Contrast) show as completed? Which still show as pending/failed? This is the core conversion bug — be extremely specific about what changed and what didn't.

### T9.4 — Verify Converted Files Are Real (Not Dummy)

1. Click "Preview" on the uploaded content row
2. Open the Content Viewer
3. Switch the format selector to "Audio"
4. Verify: an actual audio player loads with playable audio (not just a placeholder or error)
5. Try to play it — does it play actual speech derived from the PDF content?
6. Switch to "Transcript" — verify actual text content (not "Lorem ipsum" or dummy text)
7. Switch to "High Contrast" — verify a PDF viewer loads with high-contrast styling applied
8. **REPORT:** For each format (Audio, Transcript, High Contrast), does real converted content load or is it a dummy/broken state?

### T9.5 — Tier 2 Conversion Review: Braille

1. Wait for Tier 2 conversions to complete (may take longer) OR navigate to Conversion Queue
2. Navigate to `/teacher/conversions`
3. Filter by Format = "Braille"
4. Find a "Ready to Review" Braille conversion job
5. Click the row — verify a side panel opens showing:
    - Braille content preview (rendered Unicode Braille or `.brf` preview)
    - "Reject" (danger) and "Approve" (primary) buttons
6. Click "Approve"
7. Verify a success toast: "Braille format approved and published to students"
8. Verify the conversion job status changes to "Approved"
9. Navigate back to the content item — verify the Braille format icon now shows as available/approved
10. **REPORT:** Does the Braille preview show actual Braille content or a blank/dummy area? Did approve work? Did the status update? Can the student now see Braille in the viewer?

### T9.6 — Tier 2 Conversion Review: Simplified Text

1. In Conversion Queue, filter by Format = "Simplified"
2. Find a "Ready to Review" job
3. Click the row — verify side panel shows a preview of the simplified text
4. Verify the simplified text is genuinely simplified (shorter sentences, simpler vocabulary) — NOT the same as the original
5. Click "Approve"
6. Verify it publishes to students
7. **REPORT:** Was the simplified text actually simplified? Did approve work? This is the core bug to identify.

### T9.7 — Reject a Conversion

1. Find any Tier 2 "Ready to Review" job
2. Click "Reject"
3. Verify a reason input appears or it rejects directly
4. Verify the status changes to "Rejected"
5. Verify the format is NOT published to students
6. **REPORT:** Did reject work? Was there a reason field?

### T9.8 — Content Status Shows Correctly in Table

1. Navigate back to the course content table
2. Find the uploaded PDF
3. Verify the format status icons match the actual state:
    - Tier 1 formats completed: Audio ✅, Transcript ✅, Captions ✅ (N/A for PDF), High Contrast ✅
    - Tier 2 formats: Braille shows approved ✅ or pending ⏳ or review required 🔵
4. Verify the Publish Status shows "Published" (not "Draft" or "Converting" if conversion is done)
5. **REPORT:** Do the format icons accurately reflect the real conversion state? Or are they static dummy icons?

### T9.9 — Upload MP4 Video Content

1. Click "Upload Content" again
2. Upload a short MP4 video file
3. After upload, verify Tier 1 conversion produces: Audio (extracted), Captions (.vtt), Transcript (text)
4. Open the Content Viewer as a student for this video
5. Verify: video player loads, captions toggle works, transcript tab shows real text
6. **REPORT:** Did video upload trigger caption generation? Do captions show in the viewer?

### T9.10 — Edit Content Item

1. Hover over a content row and click "Edit"
2. Verify an edit form/modal opens pre-populated with existing title, description, type
3. Change the title to "Test Lecture 1 — Edited"
4. Verify you CANNOT change the Course Offering to one you are not assigned to (RBAC)
5. Save — verify the table row updates
6. **REPORT:** Did edit open with pre-filled data? Did the scope restriction work? Did save update the row?

### T9.11 — Delete Content: Impact Modal

1. Hover over a published content row and click "Delete"
2. Verify an Impact Modal appears BEFORE any deletion with:
    - Total views count
    - Number of students who have this in their progress history
    - Any linked assessments referencing this item
    - Warning if linked assessments exist
3. Verify the ONLY option is "Move to Trash" (not "Delete Permanently")
4. Verify "Cancel" exits without deleting
5. **REPORT:** Did the impact modal appear? Were the stats real (not all zeros)? Was permanent delete option hidden for teacher?

### T9.12 — Move to Trash and Restore

1. Complete the "Move to Trash" action from T9.11
2. Verify a success toast and the row disappears from the active content table
3. Navigate to the Trash tab / filter by "Soft-Deleted"
4. Verify the item appears in Trash with: deletion date, "days remaining" (e.g., "29 days remaining"), Restore button
5. Click "Restore"
6. Verify the content returns to the active content table with its previous publish status
7. **REPORT:** Did soft-delete remove from active list? Did trash show the item? Did restore work?

### T9.13 — Admin Permanent Delete

1. Log in as Admin
2. Navigate to the same course's content (or via `/admin/conversions`)
3. Find a soft-deleted item in Trash
4. Verify an admin sees a "Permanent Delete" button (teacher should NOT see this)
5. Click "Permanent Delete"
6. Verify a second confirmation dialog: "This is irreversible"
7. Confirm
8. Verify the item is completely gone
9. **REPORT:** Did permanent delete appear for admin only? Did it require double confirmation? Did the item disappear?

***

## MODULE 10 — Student: Dashboard

### T10.1 — Student Dashboard Loads

1. Log in as Student (one who has been enrolled in at least one course via Module 5)
2. Navigate to `/student/dashboard`
3. Verify the 2/3 + 1/3 layout: Course cards on left, Accessibility Profile summary + Upcoming Assessments + New Content + Announcements on right
4. Verify course cards show: Course Code, Course Name, Term, Section, Teacher name, Progress bar, Format availability chips
5. Verify the Accessibility Profile sidebar section shows active modules as chips (e.g., "Screen Reader", "Extended Time")
6. Verify "Upcoming Assessments" section shows assessments with due dates
7. Verify "New Content" section shows recently uploaded items with unread dot indicators
8. Verify "Announcements" section shows latest 3 announcements
9. **REPORT:** Does each section render? Are courses showing the student's actual enrollments? Is profile data real?

### T10.2 — Unread Content Indicators

1. Find a content item in "New Content" that has an unread dot (9CD5FF blue dot)
2. Click through to view that content
3. Return to dashboard
4. Verify the unread dot is gone for that item
5. **REPORT:** Did the unread dot disappear after viewing?

***

## MODULE 11 — Student: Courses \& Course Detail

### T11.1 — Courses List

1. Navigate to `/student/courses`
2. Verify a grid of course cards for the current term
3. Verify each card shows: course code (monospace), course name, term/section, teacher name, progress bar, format chips
4. Verify "Core" vs "Elective" distinction is shown on each card
5. Verify a term switcher exists — switch terms and verify cards change
6. Verify "Core" / "Elective" filter pills at top work
7. **REPORT:** How many courses show? Do they match the student's actual enrollments? Do filters work?

### T11.2 — Course Detail Tabs

1. Click into any course
2. Verify navigation to `/student/courses/:offeringId`
3. Verify 4 tabs: Overview, Content, Assessments, Messages
4. Click each tab and verify it loads content
5. **Overview tab:** Verify course description, schedule, teacher card (avatar + name + contact link), latest announcement
6. **Content tab:** Verify table of content items with Title, Type, Format icons, Status ("New", "Viewed"), Updated
7. **Assessments tab:** Verify upcoming assessments with countdown, in-progress, completed with scores
8. **Messages tab:** Verify thread list or empty state
9. **REPORT:** Do all 4 tabs load? Is content real or placeholder? Arrow-key navigation between tabs?

### T11.3 — Content Table Format Icons

1. In the Content tab, find an item that has been through conversion
2. Verify format icons are shown for available formats (Audio, Braille ⠿, Captions CC, Simplified Aa, High Contrast)
3. Verify unavailable formats are shown at 40% opacity with strikethrough
4. **REPORT:** Are format icons showing correct availability? Or are all icons showing as available regardless of conversion status?

***

## MODULE 12 — Student: Content Viewer (CRITICAL — Core Conversion Bug Area)

### T12.1 — Open Content Viewer

1. Click a content row in the student's course detail page
2. Verify navigation to `/student/content/:itemId`
3. Verify the sticky header bar shows: Back button, breadcrumb (Program → Year → Division → Course → Term → Item Title), Format selector
4. Verify the sticky footer accessibility bar shows: TTS toggle, Font size slider (Aa), Contrast toggle, Focus Mode toggle, Progress indicator
5. **REPORT:** Does the viewer load? Does the breadcrumb show correct academic context? Are all footer controls present?

### T12.2 — Original Format Renders

1. In the viewer with format set to "Original"
2. For a PDF: verify the PDF content renders inline (not just a download link)
3. For a video: verify a video player renders with play/pause controls
4. **REPORT:** Does original content render inline? Or is it a download link / broken?

### T12.3 — Audio Format Switching

1. In the Content Viewer, open the format selector dropdown
2. Select "Audio"
3. Verify:
    - The main content area switches to an audio player
    - The audio player has: Play/Pause button, Speed slider (0.5x–2.0x), Skip Forward 15s button, Skip Back 15s button, Volume slider
    - Audio actually PLAYS when you press Play (not silent, not an error)
    - The audio is speech derived from the document content (not silent or placeholder)
4. Try keyboard: Tab to the player, Space to play/pause
5. Adjust speed to 1.5x — verify the speed label updates to "1.5x"
6. **REPORT:** Does audio format load? Does real audio play? Are all controls present? Do keyboard controls work?

### T12.4 — Captions Format (Video Content)

1. Navigate to a video content item in the viewer
2. Verify the video player has a Captions (CC) toggle button
3. Enable captions — verify actual caption text appears synchronized with speech
4. Verify captions are not empty, not "undefined", and not placeholder text
5. **REPORT:** Do captions appear? Is the text real (derived from actual video speech)?

### T12.5 — Transcript Format

1. In the format selector, choose "Transcript"
2. Verify the main content area shows a scrollable text transcript
3. Verify the transcript text is real (not "Lorem ipsum", not "Transcript pending", not empty)
4. For a video transcript: verify clicking a line seeks the video to that timestamp
5. **REPORT:** Does the transcript load? Is it real content? Does click-to-seek work?

### T12.6 — Braille Format (CRITICAL BUG)

1. In the format selector, choose "Braille"
2. Verify the main content area changes to show Braille content
3. Verify there is a `div` with `aria-live="polite"` containing structured Braille Unicode characters (⠃⠗⠁⠊⠇⠇⠑...)
4. Verify the Braille content is NOT: empty, a placeholder "Braille content will appear here", dummy ASCII text, or an error
5. If no Braille format was approved, verify the format selector shows Braille as unavailable (greyed out), NOT as available with broken content
6. **REPORT:** What exactly appears when you select Braille? Empty div? Placeholder text? Actual Braille Unicode? Error message? This is the key bug.

### T12.7 — Simplified Format (CRITICAL BUG)

1. In the format selector, choose "Simplified"
2. Verify a simplified/chunked version of the content appears
3. Verify Section N of N indicator exists with Prev/Next buttons
4. Verify the simplified text is GENUINELY simplified: shorter sentences, simpler vocabulary, chunked into 2–3 sentences per section
5. Verify it is NOT the original text re-displayed, NOT empty, NOT "Simplified content pending"
6. **REPORT:** What appears when you select Simplified? Is the text actually simplified vs. the original? Or is it dummy/empty?

### T12.8 — High Contrast Format

1. Select "High Contrast" from the format selector
2. Verify a high-contrast version of the PDF loads (dark background / white text or inverted colors)
3. Verify it is NOT the same as the original PDF
4. **REPORT:** Does a visually distinct high-contrast version load?

### T12.9 — TTS (Text-to-Speech) Toggle in Footer

1. Ensure you're on a text/PDF content item in the viewer
2. Click the TTS (Read Aloud) toggle in the footer accessibility bar
3. Verify the button shows `aria-pressed="true"` after click
4. Verify the browser/system TTS starts reading the content aloud
5. Click again to pause
6. **REPORT:** Does TTS toggle work? Does it actually read content aloud?

### T12.10 — Font Size Slider

1. In the footer bar, find the Font Size slider (Aa)
2. Drag to the maximum (3.0x)
3. Verify the main content text visually enlarges
4. Drag to minimum (0.5x) — verify text shrinks
5. Reset to 1.0x
6. **REPORT:** Does font size change work in real time?

### T12.11 — Focus Mode

1. Click the "Focus Mode" toggle in the footer
2. Verify the left navigation rail DISAPPEARS (not just visually hidden — it should have `display:none` and `aria-hidden="true"`)
3. Verify the content area expands to fill the full width
4. Click Focus Mode again to disable — verify nav returns
5. **REPORT:** Does Focus Mode hide the nav completely? Does the content expand?

### T12.12 — Progress Tracking

1. Open a long content item (multi-page PDF or long video)
2. Scroll to page 3 or seek to the 50% mark in a video
3. Close the viewer (back button)
4. Reopen the SAME content item
5. Verify: a resume prompt appears: "Resume from page 3?" or "Resume from where you left off?"
6. Accept — verify viewer reopens at the correct position
7. **REPORT:** Was progress saved? Did the resume prompt appear? Did it resume at the correct position?

### T12.13 — Format Preference Persistence

1. Open a content item and switch format to "Audio"
2. Close the viewer
3. Reopen the SAME content item
4. Verify the format selector auto-selects "Audio" (your override persists for this item)
5. Open a DIFFERENT content item — verify it uses the profile default (not necessarily Audio)
6. **REPORT:** Did the per-item format preference persist?

***

## MODULE 13 — Student: Elective Enrollment (Track B)

### T13.1 — Elective Selection Screen

1. As a student, navigate to `/student/courses/enrollment` or find "Enroll in Elective" in nav
2. Verify a list of available elective groups for the current term
3. Each group should show: Group name, available courses, slots remaining, deadline
4. **REPORT:** Does the elective enrollment screen exist? Does it show available electives?

### T13.2 — Self-Enroll in Elective

1. Find an elective course with capacity available
2. Click "Enroll"
3. Verify a confirmation and success message
4. Navigate to `/student/courses` — verify the new elective appears in the course list with a clear "Elective" tag
5. **REPORT:** Did enrollment work? Did the course appear in My Courses?

### T13.3 — Self-Unenroll from Elective (before deadline)

1. Find the elective you just enrolled in
2. Look for an "Unenroll" option (should exist only for Track B)
3. Verify NO unenroll option exists on core/Track A courses
4. Unenroll from the elective
5. Verify it's removed from the course list
6. **REPORT:** Was unenroll option present only on electives? Did unenroll work?

***

## MODULE 14 — Teacher: Announcements

### T14.1 — Announcements Nav Item

1. Log in as Teacher
2. Verify left nav has a SEPARATE "Announcements" item (distinct from "Messages")
3. Click it — verify it routes to a different page from Messages
4. **REPORT:** Is Announcements a separate nav item? Does it go to a different URL than Messages?

### T14.2 — Create Announcement

1. On the Announcements page, click "New Announcement"
2. Verify a form/modal with: Title, Body (rich text editor), Attachments (file upload), Target Scope (Course Offering, Division, Program, Institute-Wide), Urgency toggle, Scheduled Publish option
3. Fill in Title = "Test Announcement", Body = "This is a test", Target = a specific course offering, Urgency = OFF
4. Submit
5. Verify: success toast, announcement appears in the list
6. **REPORT:** Does the creation form have all required fields? Did it submit? Did the announcement appear?

### T14.3 — Announcement Scoping (Student Receives)

1. After creating the announcement in T14.2
2. Log in as a student enrolled in the targeted course offering
3. Check the Student Dashboard — verify the announcement appears in the "Announcements" panel
4. Check the Course Detail page for that course — verify the announcement appears in the Overview tab
5. **REPORT:** Did the scoped announcement reach the correct student? Was it visible on both Dashboard and Course Detail?

### T14.4 — Urgent Announcement

1. Create another announcement, this time toggle "Urgent" ON
2. As a student, verify the urgent announcement has a visual warning indicator (amber/orange left border or badge)
3. **REPORT:** Is the urgent announcement visually distinct?

### T14.5 — Scheduled Announcement

1. Create an announcement with Scheduled Publish set to 2 minutes in the future
2. Verify the announcement status shows "Scheduled" in the list
3. Wait 2 minutes and verify the status changes to "Published" and students can see it
4. **REPORT:** Did scheduled publishing work?

***

## MODULE 15 — Teacher \& Student: Messaging

### T15.1 — Messages Nav

1. As Teacher, click "Messages" in nav
2. Verify a thread list page loads at `/teacher/messages` (or similar)
3. Verify threads are scoped by course — e.g., filter by course offering
4. **REPORT:** Does Messages load? Is it separate from Announcements?

### T15.2 — Create New Thread

1. Click "New Message" or compose button
2. Select a course offering scope
3. Send a text message to a student or the whole class
4. Verify the message appears in the thread
5. **REPORT:** Did thread creation work?

### T15.3 — Student Receives Message

1. Log in as student
2. Navigate to Messages or check the Dashboard for the new message notification
3. Verify the message appears in the thread list
4. Open the thread — verify message content is visible
5. Reply to the thread
6. **REPORT:** Did the student receive the message? Did the reply send?

### T15.4 — Real-Time Notification

1. Open the app in two browser windows (Teacher + Student)
2. Teacher sends a message
3. Verify the student window shows a real-time notification (badge on bell icon, new entry in messages) WITHOUT refreshing
4. **REPORT:** Is real-time messaging working via WebSocket? Or does the student need to refresh?

***

## MODULE 16 — Student: Assessments

### T16.1 — Assessments List

1. Log in as Student, navigate to `/student/assessments` or the Assessments tab in a course
2. Verify a timeline view: Upcoming (with countdown), In-Progress, Completed (with score)
3. **REPORT:** Does the assessments list load? Are assessments showing?

### T16.2 — Start Assessment

1. Click on an upcoming assessment
2. Verify a start screen with: Assessment title, number of questions, time limit (with extended time applied from profile if student has accommodation)
3. Verify `role="alert"` announces: "Assessment Name. N questions. Time allowed X minutes. Extended time Y applied."
4. Click "Start Assessment"
5. **REPORT:** Does the start screen show? Is extended time being applied from the accessibility profile?

### T16.3 — Assessment Question Types

1. Inside an active assessment, verify you can see question types:
    - **MCQ (single select):** Radio buttons, Arrow keys navigate within group
    - **Multi-select:** Checkboxes or listbox with aria-multiselectable
    - **Short Answer / Essay:** textarea with label
    - **File Upload:** file input with label
    - **Audio Response:** Record button
    - **Video Response:** Record button
2. Answer one of each type
3. **REPORT:** Which question types render? Do keyboard interactions work for MCQ? Do record buttons exist for audio/video?

### T16.4 — Timer Behavior

1. During an active assessment, verify:
    - A visible countdown timer is present
    - Timer has `role="timer"` and `aria-live="polite"`
    - Verify it counts DOWN (not up)
    - Jump to a test with ~6 minutes — verify it announces at 5-minute mark
2. **REPORT:** Is the timer visible and counting? Does it have correct ARIA?

### T16.5 — Save \& Exit

1. During an active assessment, click "Save \& Exit"
2. Verify a confirmation modal: "Save your progress and exit? You can resume later."
3. Confirm
4. Verify: redirect to course detail or assessments list
5. Verify success toast: "Progress saved"
6. **REPORT:** Did Save \& Exit work? Did it redirect reliably?

### T16.6 — Resume Assessment

1. Navigate back to the same assessment
2. Verify it shows "In Progress — Resume" instead of "Start"
3. Click Resume — verify it loads at the SAME question state you left (not reset)
4. Verify the timer shows REMAINING time (not full time) — it paused while you were out
5. **REPORT:** Did resume work? Was the state preserved? Was the remaining time correct?

### T16.7 — Question Navigator

1. During an active assessment, find the Question Navigator (sidebar or panel)
2. Verify it shows all questions with status chips (answered, unanswered)
3. Click a question number — verify you jump to that question
4. **REPORT:** Does the Question Navigator exist? Does clicking navigate to the correct question?

### T16.8 — Submit Assessment

1. Complete all questions in an assessment
2. Click "Submit"
3. Verify a confirmation modal with focus trap
4. Press Escape — verify it cancels (not submits)
5. Confirm submission
6. Verify redirect to completed view with score
7. **REPORT:** Did the submit flow work? Did Escape cancel? Did score appear?

### T16.9 — Extended Time Applied

1. As a student with extended time multiplier = 2.0x in their profile
2. Start an assessment with a base time of 30 minutes
3. Verify the timer shows 60 minutes (30 × 2.0x)
4. Verify this was set automatically without any teacher manual setup
5. **REPORT:** Is extended time automatically applied from the profile? What time does the timer show?

***

## MODULE 17 — Teacher: Assessment Creation

### T17.1 — Create Assessment

1. Log in as Teacher, navigate to a course's Assessments tab
2. Click "New Assessment"
3. Verify a form with: Title, Instructions, Time Limit (minutes), Open At / Close At dates, Allowed Response Types (checkboxes for Text, File, Audio, Video), Question builder
4. Add a question: MCQ type, text "What is machine learning?", 3 options, mark correct answer
5. Add a second question: Short Answer type
6. Set time limit to 30 minutes
7. Set Open At to "now" and Close At to "tomorrow"
8. Save as Draft
9. Verify it appears in the assessments list with "Draft" status
10. Publish it — verify status changes to "Published"
11. **REPORT:** Did assessment creation work? Did all question types add correctly? Did publish work?

***

## MODULE 18 — Student: Accessibility Profile Management

### T18.1 — Access Profile from Dashboard

1. As a student, click "Edit Profile" on the Dashboard (or navigate to `/student/profile`)
2. Verify the accessibility profile settings page loads (NOT the first-login modal — this should be the edit view)
3. **REPORT:** Does the profile edit page load?

### T18.2 — Add Disability to Profile

1. In the profile edit page, find the disability multi-select
2. Add "Dyslexia" to existing selections
3. Save the profile
4. Verify: a success announcement: "Accessibility profile saved. Your modules are now active."
5. Verify: the OpenDyslexic font is now applied to the app's body text (if Cognitive module activates)
6. **REPORT:** Did adding a disability work? Did the font change? Did modules update?

### T18.3 — Profile Changes Apply Within 2 Seconds

1. Change the font size multiplier from the profile settings
2. Immediately navigate to the dashboard
3. Verify the font size is already applied without refresh
4. **REPORT:** Did the change apply in real time (≤2 seconds)?

### T18.4 — Profile Persists After Logout/Login

1. Set font size to 2.0x and contrast mode to "High Contrast" in profile
2. Log out
3. Log back in
4. Verify: font size is still 2.0x, contrast mode is still High Contrast
5. **REPORT:** Did profile settings persist across session?

***

## MODULE 19 — Role-Based Access Control (RBAC) Matrix

For each action below, test that the CORRECT role can do it and the WRONG roles cannot:

### T19.1 — Content Upload RBAC

1. As **Student**: Navigate to any teacher content management page → verify 403 or redirect, no upload button visible
2. As **Teacher**: Verify upload works on assigned courses, fails with appropriate error on unassigned courses
3. **REPORT:** Is content upload properly gated?

### T19.2 — Soft Delete RBAC

1. As **Teacher**: Delete a content item → verify only "Move to Trash" is available (no "Permanent Delete")
2. As **Admin**: Find the same trashed item → verify "Permanent Delete" IS available
3. **REPORT:** Is permanent delete properly restricted to admin only?

### T19.3 — Disability Profile Visibility RBAC

1. As **Teacher**: Navigate to a student's profile via the course roster → verify you can see disability CHIPS only (e.g., "Screen Reader User", "Extended Time") — NOT raw medical details
2. As **Student**: Try to view another student's profile → verify you cannot see other students' disability data
3. As **Admin**: View any student profile → verify full chip summary is visible
4. **REPORT:** Is disability data properly RBAC-gated?

### T19.4 — Approve Tier 2 Conversions RBAC

1. As **Student**: Navigate to `/teacher/conversions` → verify redirect or 403
2. As **TA**: Verify TA can approve/reject Tier 2 conversions
3. As **Teacher**: Verify teacher can approve/reject
4. **REPORT:** Is conversion approval correctly restricted?

### T19.5 — Settings RBAC

1. As **Teacher**: Navigate to `/admin/settings` → verify redirect or 403
2. As **Admin**: Verify full settings access
3. **REPORT:** Is settings page restricted to admin only?

***

## MODULE 20 — Accessibility \& ARIA Compliance

### T20.1 — Skip Navigation Link

1. Navigate to any page
2. Press Tab from the browser URL bar (first focusable element)
3. Verify "Skip to main content" link becomes VISIBLE (it is visually hidden at rest)
4. Press Enter — verify focus jumps to the main content area
5. **REPORT:** Does the skip link exist? Does it become visible on focus? Does it work?

### T20.2 — Left Navigation ARIA

1. On any authenticated page, inspect the left navigation HTML
2. Verify: `role="navigation"` and `aria-label="Main navigation"` on the nav element
3. Verify: active nav item has `aria-current="page"`
4. Press Tab through nav items — verify each is focusable
5. Press Enter on a nav item — verify it activates (routes to the page)
6. **REPORT:** Are ARIA roles and labels present on the nav? Is Tab navigation working?

### T20.3 — Modal Focus Trap

1. Open the "Add User" modal (Admin)
2. While modal is open, press Tab repeatedly
3. Verify focus cycles WITHIN the modal only (never reaches background content)
4. Press Escape — verify modal closes and focus returns to the "Add User" button
5. **REPORT:** Is the focus trap working? Does Escape close the modal?

### T20.4 — Form Inputs Have Labels

1. On any form (Add User, Upload Content, Assessment creation)
2. Inspect all input fields
3. Verify every input has an explicit `<label for="inputId">` (NOT just a placeholder used as label)
4. **REPORT:** Do all inputs have proper labels? Any inputs with only placeholder text?

### T20.5 — Error Messages Are Accessible

1. Submit any form with empty required fields
2. Verify error messages appear below the relevant fields (not just a top-of-form summary)
3. Inspect: verify error elements have `role="alert"` or are in an `aria-live="assertive"` region
4. **REPORT:** Do error messages have correct ARIA live regions?

### T20.6 — Notification Bell \& Badge

1. Trigger a notification (send a message to the logged-in user from another account)
2. Verify the bell icon in the top bar shows a badge with unread count
3. Verify the bell has `aria-label="Notifications, N unread"` (where N is the actual count)
4. Click the bell — verify a notification dropdown opens
5. **REPORT:** Does the notification badge update? Does the aria-label update with the correct count?

### T20.7 — Content Table Accessibility

1. In the student's course content table
2. Verify table has `<th scope="col">` headers
3. Verify format icon cells have visually-hidden text listing available formats (not just icons)
4. Verify row action buttons have `aria-label` that includes the item name (e.g., "Preview Lecture 8 – Machine Learning")
5. **REPORT:** Are table headers properly scoped? Do icon-only cells have screen-reader text?

### T20.8 — Color Alone Not Used for Information

1. Look at conversion status chips in the Conversion Queue
2. Verify each status chip has a TEXT label AND a color (not color alone)
3. Look at format availability icons — verify unavailable formats have strikethrough OR greyed text label, not just opacity change
4. **REPORT:** Is color the only differentiator for any status indicators?

### T20.9 — Focus Rings Are Visible

1. Tab through the login page
2. Verify every focusable element shows a visible focus ring (2px solid `#9CD5FF` outline per spec)
3. Tab through the dashboard
4. Verify no element "swallows" focus invisibly (outline: none with no replacement)
5. **REPORT:** Are focus rings consistently visible across the app?

### T20.10 — Keyboard-Only Navigation of Content Viewer Controls

1. Open the Content Viewer using only the keyboard (Tab from previous page, Enter to activate)
2. Tab to the Format Selector — verify it's focusable
3. Press Enter/Space to open the dropdown, Arrow keys to navigate options, Enter to select
4. Tab to the TTS Speed slider — press Arrow keys to adjust — verify it moves in 0.25x steps
5. Tab to Font Size slider — Arrow keys — verify 0.1x steps
6. **REPORT:** Can all viewer controls be operated by keyboard alone?

***

## MODULE 21 — Design System Compliance

### T21.1 — No Hard-Coded Colors

1. Open browser DevTools
2. Inspect any button, card, or navigation element
3. Verify computed background/text colors match the spec tokens (Deep Blue `#355872`, Mid Blue `#7AAACE`, Sky Blue `#9CD5FF`, Off White `#F7F8F0`)
4. Look specifically for any element using an obviously off-spec color (e.g., default browser blue `#0000FF` on a button, pure `#000000` black backgrounds)
5. **REPORT:** Are design token colors being used? Any rogue hard-coded values?

### T21.2 — Typography Check

1. Inspect page headings (`h1`, `h2`, `h3`)
2. Verify `h1`/`h2` use Fraunces or Lora (serif fonts)
3. Verify body text uses DM Sans or Nunito
4. When Cognitive module is active, verify body text switches to OpenDyslexic
5. **REPORT:** Are correct fonts applied? Does dyslexia font override work?

### T21.3 — Left Navigation Background

1. Verify the left navigation rail background is `#355872` (Deep Slate Blue)
2. Verify active nav item has a left border in `#9CD5FF` (Sky Blue) and `#2A4660` background
3. Verify nav text is `#F7F8F0` (off-white on dark)
4. **REPORT:** Do navigation colors match the spec?

***

## MODULE 22 — Console Errors \& Network Health

### T22.1 — Console Error Sweep

For each of these pages, open the browser console and report ALL errors and warnings:

1. `/login`
2. `/student/dashboard`
3. `/student/courses/:offeringId`
4. `/student/content/:itemId`
5. `/teacher/dashboard`
6. `/teacher/conversions`
7. `/admin/dashboard`
8. `/admin/users`
9. `/admin/settings`

For each page, report:

- Any `console.error()` messages
- Any React warnings (key props, unknown DOM props, etc.)
- Any 404 network requests
- Any 401 network requests (excluding the initial auth check on page load)
- Any CORS errors
- Any unhandled promise rejections


### T22.2 — Dummy/Hardcoded Data Detection

On each page below, identify whether data is real (from database) or dummy/hardcoded:

1. Admin Dashboard stat strip — are student/teacher counts real?
2. Teacher Course cards — are student enrollment counts real?
3. Content table format icons — do they reflect actual conversion status from the database?
4. Student accessibility profile chips on dashboard — are they from the real profile?
5. Conversion Queue — are there real job records or placeholder rows like "Sample Content Item"?

For each item, report: **REAL DATA** or **DUMMY DATA** (quote the suspicious text)

***

## MODULE 23 — End-to-End Smoke Test: Complete User Journey

Run this entire flow without stopping. It simulates a real student's first week on the platform.

### T23.1 — Admin Sets Up a Course

1. Log in as Admin
2. Create/verify a course offering exists for current term with at least 1 section
3. Assign a teacher to the offering
4. Enroll the test student into the offering

### T23.2 — Teacher Uploads and Converts Content

1. Log in as Teacher
2. Navigate to the course
3. Upload a real PDF file (at least 2 pages)
4. Wait for Tier 1 conversions to complete
5. Navigate to Conversion Queue, approve Tier 2 Braille and Simplified conversions
6. Verify the content is now "Published" with all approved formats available

### T23.3 — Student Accesses Converted Content

1. Log in as Student (enrolled in the course)
2. Navigate to the course from the Dashboard
3. Open the content item
4. Switch through EACH available format: Original → Audio → Transcript → High Contrast → Simplified → Braille
5. For each format, verify REAL content loads (not empty/dummy)
6. Enable TTS in the footer — verify it reads
7. Enable Focus Mode — verify nav hides

### T23.4 — Teacher Sends Announcement; Student Receives

1. Log in as Teacher, create a course-scoped announcement
2. Log in as Student — verify announcement on Dashboard and Course Detail

### T23.5 — Student Takes Assessment

1. Student starts the published assessment
2. Answers all questions, uses Save \& Exit
3. Resumes, then submits
4. Verifies score appears

### T23.6 — Final Report

Report the **overall end-to-end success rate**: how many steps in T23.1–T23.5 worked end-to-end without a single failure.

***

## Reporting Template

At the end of testing, produce a summary table like this:

```
MODULE | TEST ID | STATUS | CRITICAL ISSUE (if any)
-------+----------+--------+-------------------------------
Auth   | T1.3     | ✅ PASS |
Auth   | T1.7     | ❌ FAIL | Profile modal Step 3 missing device registration fields
Conv.  | T9.3     | ❌ FAIL | Tier 1 Audio: status stays "Converting" after 10 min, never completes
Conv.  | T12.6    | ❌ FAIL | Braille format: div is empty after selecting format
Conv.  | T12.7    | ⚠️ PARTIAL | Simplified shows content but it's the SAME as original (no simplification applied)
...
```

**Prioritize failures in this order when reporting:**

1. 🔴 Data integrity (dummy data, broken conversions, empty content viewers)
2. 🔴 Auth/RBAC failures (wrong role can access things they shouldn't)
3. 🟠 Workflow blockers (can't complete a core flow)
4. 🟡 UI/UX issues (works but looks wrong or is confusing)
5. 🟢 Accessibility violations (ARIA missing, keyboard broken)

***

> **Final note to Gemini:** Take your time on Modules 9, 12, and 22. These are the highest-signal areas for the conversion pipeline bugs. For every format that fails to load real content, open the Network tab and report the exact API response — status code, response body, and whether the `azureBlobPath` fields in the content item are populated or null. This is where the root cause lives.

***

This document is now ready to paste directly into Gemini CLI. It covers all 14 PRD features across 23 test modules with 80+ individual test cases, written as real browser interaction instructions — not code.
<span style="display:none">[^1][^2][^3][^4][^5]</span>

<div align="center">⁂</div>

[^1]: TRD_Final.docx

[^2]: PRD_Final.docx

[^3]: UIUX_Final.docx

[^4]: UIUX_Final.docx

[^5]: PRD_Final.docx

