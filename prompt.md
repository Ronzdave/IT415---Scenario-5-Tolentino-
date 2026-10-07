# Prompt Log — IT 415 Midterm (Scenario 5)

**Project:** Student Organization Event and Attendance Manager
**Author:** Ronian Dave P. Tolentino
**Course:** IT 415 — Application Development and Emerging Technologies
**Tool used:** Claude Code (Opus 4.8)
**Repo:** https://github.com/Ronzdave/IT415---Scenario-5-Tolentino-

This file records the conversation and AI prompts used to build the project,
for transparency and exam defense.

---

## 1. Initial prompt — build the whole app

> Here is my IT 415 Midterm Exam scenario: SCENARIO 5: Student Organization
> Event and Attendance Manager … build this step by step: plan into 8–10 commit
> stages, give code + explanation, give exact Git commands, build features 5 and
> 7 (check-in + attendance rate) on a branch `feature/check-in-attendance`,
> guide the pull request, make the repo public, remind me to submit the link.
> "follow this on the UI img and prompt faster" / "edit this current folder i
> already open faster"

**What the AI did:**
- Found the folder held a different app (an "accord IRM" employee screen) and
  replaced it with the Event & Attendance Manager.
- Created the four core files:
  - `index.html` — Events, Registrations, and Report views.
  - `css/style.css` — styling.
  - `js/data.js` — seed data + `localStorage` load/save.
  - `js/app.js` — all screen logic.
- Mapped all 9 required features to functions in the code.

## 2. Decision — how to satisfy the branch/PR requirement

> AskUserQuestion: "How do you want to handle the branch/PR requirement for
> check-in + attendance?" → **Answer: "I'll split it for you."**

**What the AI did:**
- Reduced `main` to features 1–4, 6, 8, 9 (no check-in, no attendance rate,
  no best-event report).
- Committed `main` in meaningful stages.
- Created branch `feature/check-in-attendance` from `main` and added:
  - `togglePresent` (check-in / undo Present) — Feature 5.
  - present count + attendance rate (present ÷ registered %) — Feature 7.
  - attendance column, check-in button, attendance filter.
  - "best Completed event by attendance rate" in the report.

## 3. Prompt — use this GitHub repo

> https://github.com/Ronzdave/IT415---Scenario-5-Tolentino-.git — use this repo

**What the AI did:**
- Set the remote, pushed the feature branch.
- Reconciled with GitHub's auto-created "Initial commit" (merged unrelated
  histories so `main` could push without a destructive force-push).

## 4. Prompt — modern UI + HCI

> "also update the UI make it look modern with HCI principles, professional and
> presentable, and make it faster"

**What the AI did:**
- Rewrote `css/style.css` into a modern design system: Inter font, 4px spacing
  scale, card elevation + hover, visible keyboard focus rings, instant form
  feedback (red/green messages), status dots on badges, sticky header,
  responsive layout, and `prefers-reduced-motion` support.
- Applied the same UI to both `main` and the feature branch so the PR merges
  cleanly.

## 5. Prompts — GitHub steps

> "give me now the step by step on the github's steps" / "where is the pull" /
> "so last are commit?" / embedded-repo warning / "how do i see the commit"

**What the AI did:**
- Gave step-by-step push → pull request → merge → make public → submit.
- Explained the "embedded repo" warning came from a stray nested clone
  (`IT415---Scenario-5-Tolentino-/`) and how to remove it.
- Showed how to view commits on GitHub ("17 Commits") and via `git log`.

## 6. Prompt — this file

> "create me a prompt.md and record all our conversation here and commit"

---

## Feature → code map (for defense)

| # | Requirement | Where |
|---|-------------|-------|
| 1 | Add/edit/delete events, status order, register only when Open | `handleEventSubmit`, `editEvent`, `deleteEvent` |
| 2 | Register up to capacity, message when full | `handleRegSubmit` |
| 3 | No duplicate student ID per event | `handleRegSubmit` |
| 4 | Cancel registration frees a slot | `cancelReg` |
| 5 | Check-in Present / undo, only registered | `togglePresent` *(feature branch)* |
| 6 | Event with registrations can't be deleted | `deleteEvent` |
| 7 | registered / slots left / present / attendance rate | `statsFor` *(feature branch)* |
| 8 | Search/filter registrations, list events by status | `renderRegistrations`, `statusListFilter` |
| 9 | Report: events per status + best Completed event | `renderReport` |

**Branch + PR feature:** Features 5 and 7 were built on
`feature/check-in-attendance` and merged into `main` via a pull request.
