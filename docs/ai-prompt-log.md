# AI-Assisted Development Documentation (Prompt Log)

One entry per prompt. Tools used: Claude Code, ChatGPT.

---

Prompt #1 | Tool: Claude Code
Purpose: documentation / planning

1. **Prompt I used:** "Help me plan Scenario 5 (Student Organization Event and
   Attendance Manager) into 8–10 meaningful commit stages, and set up the
   project folders, README, and requirements analysis."
2. **AI's answer:** Proposed a 10-stage plan (setup → interface → core events →
   registration → validation → search/report → bug fix → refactor →
   check-in/attendance on a branch → docs) and generated the folder structure
   and starter docs.
3. **My evaluation:** The plan matches all 9 scenario features and keeps
   check-in + attendance rate for the required branch/PR. Verified the folder
   layout matches the exam's required structure.
4. **What I changed:** Filled in my own name and scenario details; confirmed the
   status values match the scenario wording exactly.

---

Prompt #2 | Tool: Claude Code
Purpose: code generation

1. **Prompt I used:** "Build the interface (HTML + CSS): an event form, a
   registration form, an events table with columns for registered/slots
   left/present/attendance, a registrations table, and a report area."
2. **AI's answer:** Generated `index.html` and `css/style.css` with a card
   layout, status pills, and a floating message banner.
3. **My evaluation:** Layout matches the scenario's "What the app must show."
   Opened it in the browser — forms and tables render correctly.
4. **What I changed:** Confirmed the status `<option>` values match the exact
   scenario wording (e.g. "Open for Registration").

---

Prompt #3 | Tool: Claude Code
Purpose: code generation

1. **Prompt I used:** "Implement event add/edit/delete with the status flow and
   save everything to localStorage. An event with registrations cannot be
   deleted."
2. **AI's answer:** Added `js/storage.js` (localStorage wrapper) and `js/app.js`
   (state, CRUD, rendering, event delegation for the table buttons).
3. **My evaluation:** Tested adding, editing, deleting. The delete block for
   events with registrations works. Data survives a page refresh.
4. **What I changed:** Understood the `uid()` helper and the event-delegation
   click handler so I can explain them.

---

Prompt #4 | Tool: Claude Code
Purpose: code generation

1. **Prompt I used:** "Add registration: register up to capacity, only when the
   event is Open, block duplicate student IDs, and allow cancelling to free a
   slot."
2. **AI's answer:** Added `registerStudent()` and `cancelRegistration()` plus a
   registrations table renderer.
3. **My evaluation:** Tested capacity limit, duplicate ID (case-insensitive),
   and registering while Draft/Closed — all show the correct error message.
4. **What I changed:** Made the duplicate check case-insensitive after I noticed
   "2023-01" vs "2023-01" edge cases.

---

Prompt #5 | Tool: Claude Code
Purpose: code generation / validation

1. **Prompt I used:** "Add input validation for both forms: required fields,
   capacity at least 1, and capacity cannot drop below students already
   registered."
2. **AI's answer:** Added `validateEvent()` and `validateRegistration()` that
   return an error string, shown via the message banner.
3. **My evaluation:** Tested empty fields and capacity 0 / negative — all
   rejected with a clear message.
4. **What I changed:** Added the "capacity cannot be below registered count"
   rule myself because editing an event could otherwise create negative slots.

---

Prompt #6 | Tool: Claude Code
Purpose: code generation

1. **Prompt I used:** "Add search/filter for registrations (by name, ID,
   attendance) and a report of events per status."
2. **AI's answer:** Added live search + attendance filter to the registrations
   renderer and a `renderReport()` function.
3. **My evaluation:** Search updates as I type; filters combine correctly.
4. **What I changed:** Nothing major — reviewed how the filters chain together.

---

Prompt #7 | Tool: Claude Code
Purpose: debugging

1. **Prompt I used:** "A student named `Ben & <Co>` breaks my table. Why, and
   how do I fix it safely?"
2. **AI's answer:** Explained that values were inserted via `innerHTML` as raw
   HTML; added an `escapeHtml()` helper and applied it to user-entered fields.
3. **My evaluation:** Reproduced the bug, applied the fix, re-tested — the name
   now shows literally and the table is intact.
4. **What I changed:** Applied `escapeHtml` to event name, venue, student name,
   and student ID.

---

Prompt #8 | Tool: Claude Code
Purpose: refactoring

1. **Prompt I used:** "Refactor the repeated document.getElementById calls into
   a small helper without changing behavior."
2. **AI's answer:** Added `const $ = (id) => document.getElementById(id);` and
   replaced the calls.
3. **My evaluation:** App behaves identically after the change (regression
   tested add/edit/register/search).
4. **What I changed:** Caught a bug where the find-replace also rewrote the
   helper's own definition into infinite recursion, and fixed that line.

---

Prompt #9 | Tool: Claude Code
Purpose: code generation (branch feature)

1. **Prompt I used:** "On a branch `feature/check-in-attendance`, add check-in
   (mark registered student Present, with undo) and attendance rate
   (present / registered as %), plus the best Completed event in the report."
2. **AI's answer:** Added `presentCount()`, `attendanceRate()`, `togglePresent()`,
   filled the Present/Attendance columns, a Check-in/Undo button, and extended
   the report.
3. **My evaluation:** Tested checking in, undo, and the 0-registered case
   (shows 0% instead of NaN). Opened a pull request and merged into main.
4. **What I changed:** Confirmed attendance rate rounds to a whole percent.

## What I learned
- How `localStorage` keeps browser-only data across refreshes via JSON.
- Why user input must be escaped before going into `innerHTML`.
- The Git branch → push → pull request → merge workflow on GitHub.
- Reading and testing AI code instead of trusting it (the recursion bug in #8).
