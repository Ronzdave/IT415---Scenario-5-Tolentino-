# Student Organization Event and Attendance Manager

A web app for student-organization officers to manage events and track who
actually attended. Sign-ups and attendance live in one place instead of on
separate paper sheets.

**Author:** Ronian Dave P. Tolentino
**Course:** IT 415 – Application Development and Emerging Technologies
**Scenario:** 5 – Student Organization Event and Attendance Manager

## What it does

- Add, edit, and delete events (status flow: Draft → Open for Registration → Closed → Completed)
- Register students for an event up to its capacity (no duplicate student IDs)
- Cancel a registration to free a slot
- Check in registered students as Present (with undo)
- Show live counts per event: registered, slots left, present, attendance rate
- Search / filter registrations and list events by status
- A report: event counts per status + the Completed event with the highest attendance rate

## Tech

Plain HTML, CSS, and JavaScript. All data is saved in the browser with
`localStorage`, so nothing is lost on refresh. No server or database needed.

## How to run

1. Download or clone this repository.
2. Open `index.html` in any modern web browser (double-click it).

That's it — there is no build step.

## Folder layout

```text

event-attendance-manager/
  index.html
  css/style.css
  js/            app logic
  docs/          requirements, AI prompt log, screenshots

```

