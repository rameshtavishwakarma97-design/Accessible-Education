<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I have performed all the fixes using copilot. The first 1-10 features and the reamining 6 features. Now should I ask gemini to test these again?

Yes, but don't just ask Gemini to re-run the same test pack blindly. Be surgical about it — you only need to verify the specific fixes that were applied, plus a quick regression check to make sure nothing that was working before got broken.

Here is exactly what to send to Gemini CLI:

***

# Gemini CLI — Targeted Re-Test Pack (Post-Fix Verification)

> **Context:** We have applied 16 fixes to the Accessible Education Platform. Do NOT re-run the full 23-module test pack. Run only the tests below — they are targeted at the exact fixes that were implemented. For each test, report ✅ PASS / ❌ FAIL / ⚠️ PARTIAL with the exact DOM state, network response, and console output.

***

## ROUND 1 — Smoke Test (Run First, 2 Minutes)

> If any of these fail, stop and report immediately — the app may be in a broken state.

1. Navigate to `http://localhost:3000` — does the app load without a white screen?
2. Log in as `admin@test.com` — does it reach `/admin/dashboard`?
3. Log in as `teacher@test.com` — does it reach `/teacher/dashboard`?
4. Log in as `student@test.com` — does it reach `/student/dashboard`?
5. On each dashboard, open the browser console — are there any new **red errors** that weren't there before?

***

## ROUND 2 — Conversion Pipeline (The Most Critical Fix)

**This is the single most important thing to verify.**

1. Log in as Teacher
2. Navigate to a course → Content tab → click **Upload Content**
3. Upload a real PDF (any 2–5 page document)
4. Immediately after upload:
    - Does a success toast appear saying "Upload started"?
    - Does a new row appear in the content table with status **"Converting"**?
5. Wait **up to 3 minutes** watching the content table. Report:
    - Does the status change from "Converting" to something else automatically (without refresh)?
    - If you manually refresh — what does the status show?
6. Open **MongoDB** (Atlas or mongosh) and run:

```
db.contentitems.findOne({}, { title:1, publishStatus:1, availableFormats:1 })
```

Paste the **complete output**. Specifically — is `availableFormats` still `{}` or does it now have data?
7. Check **Azure Blob Storage** — are there any new files in the `converted/` subfolder?
8. Check **server logs / terminal** — are there any errors from the conversion service? Paste any `[Conversion]` log lines.

***

## ROUND 3 — Content Viewer Format Switching

1. As a Student, open a content item that was just uploaded and converted
2. For **each format below**, report exactly what appears on screen:
| Format | What appears? | Is it real content or placeholder? |
| :-- | :-- | :-- |
| Original |  |  |
| Transcript |  |  |
| Simplified |  |  |
| Audio |  |  |
| High Contrast |  |  |
| Braille |  |  |

3. For Transcript specifically — does the text match the actual content of the PDF you uploaded?
4. For Simplified — are the sections genuinely shorter/simpler than the original, or identical?
5. For Audio — does the Play button work? Does speech come out of the browser?
6. For Braille — is the content now real (from DB) or still the old hardcoded Unicode string?

***

## ROUND 4 — Previously Passing Tests (Regression Check)

Quickly verify these still work (they passed before — make sure the fixes didn't break them):

1. **T1.7** — First-login profile setup modal still opens and completes for new student ✅?
2. **T2.1** — Hierarchy tree still renders ✅?
3. **T9.11** — Delete impact modal still shows real statistics ✅?
4. **T12.11** — Focus Mode still hides the nav visually ✅?
5. **T22.1** — Console is still clean (no new React key warnings or 404s) ✅?

***

## ROUND 5 — New Feature Fixes

### Logout Button

1. While logged in as any user, is there a **"Sign out"** button visible in the sidebar or avatar menu?
2. Click it — does it redirect to `/login`?
3. After logout, manually navigate to `/admin/dashboard` — does it redirect back to `/login`?

### Add User Modal

1. As Admin → `/admin/users` → click **"Add User"**
2. Does a modal open with fields: Name, Email, Role, and conditional Program/Year/Division?
3. Submit with empty fields — do validation errors appear?
4. Fill in valid data and submit — does the user appear in the table?

### Auth Flicker

1. Log in as Admin, go to `/admin/users`
2. Press **F5** (hard refresh)
3. Watch carefully — is there a **flash of the login page** before the dashboard appears?
4. Report: flash present ❌ or completely gone ✅?

### Hierarchy Edit/Add Child/Retire

1. Click any node in the hierarchy tree
2. Click **Edit** — does an actual form open (not just a toast)?
3. Change the name and save — does the tree update with the new name?
4. Click **Add Child** — does a prompt/form appear and actually create a new node?
5. Click **Retire** — does a confirmation appear and remove the node?

### Enrollment Dashboard

1. Navigate to `/admin/enrollment`
2. Do all 4 tabs render: Core Enrollments, Elective Enrollments, Waitlists, Bulk Import?
3. Click **Bulk Enroll** — does a modal open with Program/Year/Division/Term/Course selectors?
4. Does the **Import CSV** button show as disabled with a "v2.1" chip and tooltip?

### Conversion Status Polling

1. Upload a new file as Teacher
2. Watch the content table **without refreshing**
3. Does the row status update automatically from "Converting ⟳" to "Published" once done?
4. Report: auto-updates ✅ or requires manual refresh ❌?

### Focus Mode aria-hidden

1. Open any content item as Student
2. Click **Focus Mode** in the footer bar
3. Inspect the sidebar/nav element in DevTools
4. Does it have **both** `display: none` AND `aria-hidden="true"`?

### Swagger Docs

1. Navigate to `http://localhost:4000/api/docs`
2. Does Swagger UI load with endpoint groups?

***

## ROUND 6 — One Full End-to-End Flow

Run this entire sequence and report pass/fail at each step:

1. Admin assigns Teacher to a course offering
2. Teacher uploads a PDF to that course
3. **Wait for conversion** — content moves to Published status
4. Teacher opens Conversion Queue — finds Simplified format "Ready to Review" — approves it
5. Student (enrolled in the course) opens the course → Content tab → sees the new item
6. Student opens the content item → switches to **Simplified** format → sees real chunked text
7. Student switches to **Transcript** → sees real extracted text
8. Student switches to **Audio** → clicks Play → browser speaks the content

***

## What to Report Back

At the end, give me:

1. **The conversion pipeline verdict** — is `availableFormats` populated in MongoDB? (Yes/No + paste the DB document)
2. **The full results table** for Rounds 2–6
3. **Any NEW bugs** that weren't present before (regressions)
4. **Server error logs** from the conversion attempt (paste any stack traces)

***

That's it. Send this to Gemini CLI and paste back what it returns. Based on the results, I'll know in 60 seconds whether the conversion pipeline is truly working or needs one more targeted fix.

