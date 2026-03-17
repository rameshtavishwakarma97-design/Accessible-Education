
**REQUEST A — The conversion pipeline files (most critical)**

```
Show me the COMPLETE file contents of:

1. Every file inside workers/ or server/workers/ or any folder 
   containing "tts", "braille", "simplified", "transcript", "worker"
   (run: find . -type f | grep -iE "worker|tts|braille|simplif|transcript|convert" | grep -v node_modules | grep -v .git)

2. The file where content upload happens and conversion jobs are 
   enqueued — search for where "Converting" status is SET:
   grep -r "Converting\|CONVERTING\|conversionJob\|enqueue\|bullmq\|queue.add" --include="*.ts" -rn | grep -v node_modules

3. Show the complete file that contains the queue consumer / 
   job processor on the backend side
```


***

**REQUEST B — The Content Viewer dummy data (second most critical)**

```
Search for the hardcoded Braille and Simplified strings:

grep -r "⠃⠗⠁\|⠓⠑⠇⠇⠕\|dummy\|placeholder\|Lorem\|hardcoded\|static" --include="*.tsx" --include="*.ts" -rn | grep -v node_modules

Also show the complete file that renders the Content Viewer 
(search: grep -r "FormatSelector\|availableFormats\|brailleContent\|simplifiedText\|format.*selector" --include="*.tsx" -rn | grep -v node_modules)

Then show the FULL file contents of whatever renders the viewer.
```


***

**REQUEST C — Add User button with no handler**

```
Find and show the COMPLETE file that contains the "Add User" button:

grep -r "add-user\|addUser\|AddUser\|add_user" --include="*.tsx" --include="*.ts" -rn | grep -v node_modules

Show the full file. I need to see what onClick is (or isn't) 
attached to the button.
```


***

**REQUEST D — Hierarchy Edit/Add Child (fake toast buttons)**

```
Find the hierarchy detail panel / node action panel:

grep -r "Add Child\|addChild\|EditNode\|RetireNode\|hierarchy.*edit\|edit.*node" --include="*.tsx" -rn | grep -v node_modules

Show the full component file. I need to see where it fires 
a toast instead of an API call.
```


***

**REQUEST E — Auth flicker (isLoading not blocking routes)**

```
Show me these complete files:

1. The AuthProvider or AuthContext (search: grep -r "AuthProvider\|isLoading\|isHydrated\|authLoading" --include="*.tsx" --include="*.ts" -rn | grep -v node_modules)

2. The ProtectedRoute / RoleRoute component

3. The main router (App.tsx or router.tsx — wherever routes are defined)
```


***

**REQUEST F — Enrollment dashboard broken tabs**

```
Find the enrollment dashboard component:

grep -r "enrollment\|Enrollment" --include="*.tsx" -rn | grep -v node_modules | grep -i "page\|dashboard\|tab"

Show the full file for the Admin Enrollment page.
```


***

**REQUEST G — Course Detail tabs loading empty**

```
Find the student course detail component:

grep -r "CourseDetail\|course-detail\|offeringId\|publishStatus" --include="*.tsx" -rn | grep -v node_modules

Show the full file. I specifically need to see:
- How the Content tab fetches its data
- What API endpoint it calls
- What filter it applies (is it filtering by publishStatus === 'published'?)
```


***

**REQUEST H — The ONE most important database query**

```
Run this in your terminal (mongosh or MongoDB Compass):

db.contentitems.findOne({}, {
  title: 1,
  publishStatus: 1,
  availableFormats: 1
})

Paste the COMPLETE output. This will show whether:
- availableFormats.braille.azureBlobPath is null or a real path
- availableFormats.simplified.status is "COMPLETED" or "PENDING"
- publishStatus is "DRAFT", "CONVERTING", or "PUBLISHED"
```


***