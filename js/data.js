/* Seed data + localStorage persistence for the Event & Attendance Manager.
   Two collections are stored:
     events        — { id, name, date, venue, capacity, status }
     registrations — { id, eventId, studentName, studentId, year, dateRegistered, present }
   Everything is kept in the browser via localStorage so the app works with no server. */

const STORAGE_KEY = "eam_data_v1";

// Valid status flow (used to validate transitions in the UI).
const STATUS_ORDER = ["Draft", "Open for Registration", "Closed", "Completed"];

// First-run sample data so the app is not empty on open.
const SEED = {
  events: [
    { id: "ev1", name: "Tech Summit 2026", date: "2026-10-20", venue: "Main Hall", capacity: 3, status: "Open for Registration" },
    { id: "ev2", name: "Leadership Workshop", date: "2026-09-15", venue: "Room 201", capacity: 2, status: "Completed" },
    { id: "ev3", name: "Orientation Day", date: "2026-11-05", venue: "Auditorium", capacity: 50, status: "Draft" },
  ],
  registrations: [
    { id: "rg1", eventId: "ev2", studentName: "Ana Cruz",   studentId: "2021-00101", year: "3rd Year", dateRegistered: "2026-09-01", present: true  },
    { id: "rg2", eventId: "ev2", studentName: "Ben Lopez",  studentId: "2021-00102", year: "2nd Year", dateRegistered: "2026-09-02", present: true  },
    { id: "rg3", eventId: "ev1", studentName: "Cara Reyes", studentId: "2022-00201", year: "1st Year", dateRegistered: "2026-10-01", present: false },
  ],
};

// Load from localStorage, or fall back to the seed on first run.
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read saved data, using seed.", err);
  }
  return structuredClone(SEED);
}

// Persist the whole dataset after every change.
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Could not save data.", err);
  }
}

// Simple unique id generator.
function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
