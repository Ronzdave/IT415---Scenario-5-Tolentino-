# Requirements Analysis — Scenario 5

**Student Organization Event and Attendance Manager**
Author: Ronian Dave P. Tolentino

| # | Item | Answer |
| --- | ---- | ------ |
| 1 | **Problem** | A student organization runs many events each semester. Sign-ups are on paper and attendance is on a separate sheet, so officers cannot tell how many people who signed up actually came. |
| 2 | **Target users** | Student organization officers. |
| 3 | **Functional requirements** | Add/edit/delete events with a status flow; register students up to capacity; block duplicate student IDs; cancel registrations; check students in as Present; stop deletion of events that have registrations; show per-event counts and attendance rate; search/filter registrations and list events by status; produce a status report. |
| 4 | **Required inputs** | Event: name, date, venue, capacity, status. Registration: student name, student ID, year level. Plus search text and filter choices. |
| 5 | **Expected outputs** | Event list with live counts (registered, slots left, present, attendance rate), the registrations for a selected event, success/error messages, and a report (events per status + best Completed event by attendance rate). |
| 6 | **Proposed features** | The 9 features listed in the scenario, split into event management, registration, check-in, statistics, search/report. |
| 7 | **Tools and technologies** | HTML, CSS, JavaScript, `localStorage`. Git + GitHub for version control. AI tool: Claude Code (also ChatGPT for cross-checking). |

## Business rules captured

- Registration is allowed **only** when an event's status is *Open for Registration*.
- Capacity is a hard limit — when full, show a message and do not register.
- A student ID may appear **once** per event.
- An event that has registrations cannot be deleted; set it to *Completed* instead.
- Only a **registered** student can be checked in; Present can be undone.
- Attendance rate = present ÷ registered, shown as a percent (0% when nobody is registered).
