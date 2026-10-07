# Testing and Debugging Notes

I tested with correct inputs and tricky/wrong inputs. Open `index.html` and try:

| # | Test | Expected result | Status |
| --- | ---- | --------------- | ------ |
| 1 | Add event with empty name | Error: "Event name is required." | ✅ |
| 2 | Add event with capacity 0 or -5 | Error: capacity must be ≥ 1 | ✅ |
| 3 | Add a valid event, refresh page | Event still there (localStorage) | ✅ |
| 4 | Register when status is Draft/Closed | Error: can only register when Open | ✅ |
| 5 | Register up to capacity, then one more | Error: event is full | ✅ |
| 6 | Register the same student ID twice | Error: already registered | ✅ |
| 7 | Register with empty name/ID | Validation error | ✅ |
| 8 | Cancel a registration | Slot freed, count drops | ✅ |
| 9 | Delete event that has registrations | Blocked; told to set Completed | ✅ |
| 10 | Delete an empty event | Removed after confirm | ✅ |
| 11 | Check in a student, then Undo | Present toggles; present count + rate update | ✅ |
| 12 | Attendance rate with 0 registered | Shows 0% (not NaN) | ✅ |
| 13 | Student name `Ben & <Co>` | Shown literally; table not broken | ✅ (fixed in commit "Fix:") |
| 14 | Search by name / ID, filter by attendance | List narrows correctly | ✅ |
| 15 | Report with a Completed event | Shows status counts + best event | ✅ |

## Bug I found and fixed

Names containing `<`, `>` or `&` broke the tables because values were inserted
with `innerHTML`. Fixed by adding `escapeHtml()` and applying it to all
user-entered fields. (See the "Fix:" commit.)

## Bug caught while refactoring

A global find-replace turned the `$` helper's own definition into
`const $ = (id) => $(id);` (infinite recursion). I spotted it, restored
`document.getElementById`, and re-tested.
