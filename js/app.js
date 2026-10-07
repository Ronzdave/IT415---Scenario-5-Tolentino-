/*
 * app.js — core application logic.
 * Holds the in-memory state, event CRUD, rendering, and wiring.
 * (Registration, validation, search, and report are added in later stages.)
 */

// ---------- State ----------
let events = Storage.getEvents();
let registrations = Storage.getRegistrations();
let selectedEventId = null; // which event's registrations we are viewing

// The only legal status values, in order.
const STATUS_ORDER = ["Draft", "Open for Registration", "Closed", "Completed"];

// ---------- Small helpers ----------
function uid() {
  // Good-enough unique id for a browser-only app.
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Escape text before putting it into innerHTML, so a name or venue that
// contains <, >, & or quotes is shown as-is instead of breaking the table.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function showMessage(text, type = "success") {
  const box = document.getElementById("message");
  box.textContent = text;
  box.className = "message " + type;
  // Auto-hide after 3 seconds.
  clearTimeout(showMessage._timer);
  showMessage._timer = setTimeout(() => box.classList.add("hidden"), 3000);
}

function statusPillClass(status) {
  return {
    "Draft": "pill-draft",
    "Open for Registration": "pill-open",
    "Closed": "pill-closed",
    "Completed": "pill-completed",
  }[status] || "pill-draft";
}

// How many students are registered for an event.
function registeredCount(eventId) {
  return registrations.filter(r => r.eventId === eventId).length;
}

function slotsLeft(ev) {
  return ev.capacity - registeredCount(ev.id);
}

// ---------- Validation ----------
// Returns an error string, or "" when the data is valid.
function validateEvent(data) {
  if (!data.name) return "Event name is required.";
  if (!data.date) return "Please choose an event date.";
  if (!data.venue) return "Venue is required.";
  if (!Number.isFinite(data.capacity) || data.capacity < 1) {
    return "Capacity must be a whole number of at least 1.";
  }
  if (!STATUS_ORDER.includes(data.status)) return "Please choose a valid status.";
  return "";
}

function validateRegistration(name, studentId) {
  if (!name) return "Student name is required.";
  if (!studentId) return "Student ID is required.";
  return "";
}

// ---------- Event CRUD ----------
function saveEvent(e) {
  e.preventDefault();
  const id = document.getElementById("event-id").value;
  const data = {
    name: document.getElementById("event-name").value.trim(),
    date: document.getElementById("event-date").value,
    venue: document.getElementById("event-venue").value.trim(),
    capacity: Number(document.getElementById("event-capacity").value),
    status: document.getElementById("event-status").value,
  };

  const error = validateEvent(data);
  if (error) { showMessage(error, "error"); return; }

  // When editing, capacity cannot drop below the number already registered.
  if (id && data.capacity < registeredCount(id)) {
    showMessage(`Capacity cannot be less than the ${registeredCount(id)} students already registered.`, "error");
    return;
  }

  if (id) {
    // Edit existing event.
    const ev = events.find(ev => ev.id === id);
    Object.assign(ev, data);
    showMessage("Event updated.");
  } else {
    // Add new event.
    events.push({ id: uid(), ...data });
    showMessage("Event added.");
  }

  Storage.saveEvents(events);
  resetEventForm();
  render();
}

function editEvent(id) {
  const ev = events.find(ev => ev.id === id);
  if (!ev) return;
  document.getElementById("event-id").value = ev.id;
  document.getElementById("event-name").value = ev.name;
  document.getElementById("event-date").value = ev.date;
  document.getElementById("event-venue").value = ev.venue;
  document.getElementById("event-capacity").value = ev.capacity;
  document.getElementById("event-status").value = ev.status;
  document.getElementById("event-submit").textContent = "Save changes";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteEvent(id) {
  // Rule 6: an event that has registrations cannot be deleted.
  if (registeredCount(id) > 0) {
    showMessage("This event has registrations. Set it to Completed instead of deleting.", "error");
    return;
  }
  if (!confirm("Delete this event?")) return;
  events = events.filter(ev => ev.id !== id);
  if (selectedEventId === id) selectedEventId = null;
  Storage.saveEvents(events);
  showMessage("Event deleted.");
  render();
}

function resetEventForm() {
  document.getElementById("event-form").reset();
  document.getElementById("event-id").value = "";
  document.getElementById("event-submit").textContent = "Add event";
}

function selectEvent(id) {
  selectedEventId = id;
  render();
}

// ---------- Registration ----------
function registerStudent(e) {
  e.preventDefault();
  if (!selectedEventId) {
    showMessage("Pick an event first (click View on an event).", "error");
    return;
  }
  const ev = events.find(ev => ev.id === selectedEventId);

  // Rule 1: registration only when the event is Open for Registration.
  if (ev.status !== "Open for Registration") {
    showMessage(`"${ev.name}" is ${ev.status}. You can only register when it is Open for Registration.`, "error");
    return;
  }

  const studentName = document.getElementById("student-name").value.trim();
  const studentId = document.getElementById("student-id").value.trim();
  const yearLevel = document.getElementById("year-level").value;

  const error = validateRegistration(studentName, studentId);
  if (error) { showMessage(error, "error"); return; }

  // Rule 2: do not go over capacity.
  if (slotsLeft(ev) <= 0) {
    showMessage(`"${ev.name}" is full (capacity ${ev.capacity}). Cannot register.`, "error");
    return;
  }

  // Rule 3: the same student ID cannot register twice for the same event.
  const duplicate = registrations.some(
    r => r.eventId === ev.id && r.studentId.toLowerCase() === studentId.toLowerCase()
  );
  if (duplicate) {
    showMessage(`Student ID ${studentId} is already registered for this event.`, "error");
    return;
  }

  registrations.push({
    id: uid(),
    eventId: ev.id,
    studentName,
    studentId,
    yearLevel,
    dateRegistered: new Date().toISOString().slice(0, 10),
    present: false,
  });
  Storage.saveRegistrations(registrations);
  document.getElementById("registration-form").reset();
  showMessage(`${studentName} registered.`);
  render();
}

// Rule 4: cancelling a registration frees a slot.
function cancelRegistration(id) {
  if (!confirm("Cancel this registration? This frees a slot.")) return;
  registrations = registrations.filter(r => r.id !== id);
  Storage.saveRegistrations(registrations);
  showMessage("Registration cancelled.");
  render();
}

// ---------- Report ----------
function renderReport() {
  const box = document.getElementById("report");
  if (events.length === 0) {
    box.innerHTML = `<p class="muted">No events yet, so there is nothing to report.</p>`;
    return;
  }

  // Feature 9: count events per status.
  const counts = STATUS_ORDER.map(status => ({
    status,
    n: events.filter(ev => ev.status === status).length,
  }));

  let html = "<p><strong>Events per status:</strong></p><ul>";
  counts.forEach(c => { html += `<li>${c.status}: ${c.n}</li>`; });
  html += "</ul>";

  box.innerHTML = html;
}

// ---------- Rendering ----------
function render() {
  renderEvents();
  renderRegistrations();
  renderReport();
}

function renderEvents() {
  const body = document.getElementById("events-body");
  const filter = document.getElementById("status-filter").value;
  const list = events.filter(ev => filter === "All" || ev.status === filter);
  body.innerHTML = "";

  if (list.length === 0) {
    body.innerHTML = `<tr class="empty-row"><td colspan="9">No events yet. Add one above.</td></tr>`;
    return;
  }

  list.forEach(ev => {
    const reg = registeredCount(ev.id);
    const tr = document.createElement("tr");
    if (ev.id === selectedEventId) tr.classList.add("selected-row");
    tr.innerHTML = `
      <td>${escapeHtml(ev.name)}</td>
      <td>${ev.date || "—"}</td>
      <td>${escapeHtml(ev.venue) || "—"}</td>
      <td><span class="pill ${statusPillClass(ev.status)}">${ev.status}</span></td>
      <td>${reg}</td>
      <td>${slotsLeft(ev)}</td>
      <td>—</td>
      <td>—</td>
      <td>
        <button class="small" data-act="select" data-id="${ev.id}">View</button>
        <button class="small secondary" data-act="edit" data-id="${ev.id}">Edit</button>
        <button class="small danger" data-act="delete" data-id="${ev.id}">Delete</button>
      </td>`;
    body.appendChild(tr);
  });
}

function renderRegistrations() {
  const label = document.getElementById("selected-event-name");
  const body = document.getElementById("registrations-body");
  body.innerHTML = "";

  const ev = events.find(ev => ev.id === selectedEventId);
  if (!ev) {
    label.textContent = "— click View on an event to see its registrations";
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No event selected.</td></tr>`;
    return;
  }
  label.textContent = `— ${ev.name}`;

  // Feature 8: search by name/ID and filter by attendance.
  const term = document.getElementById("reg-search").value.trim().toLowerCase();
  const attFilter = document.getElementById("reg-attendance-filter").value;

  let list = registrations.filter(r => r.eventId === ev.id);
  if (term) {
    list = list.filter(r =>
      r.studentName.toLowerCase().includes(term) ||
      r.studentId.toLowerCase().includes(term)
    );
  }
  if (attFilter === "Present") list = list.filter(r => r.present);
  if (attFilter === "Absent") list = list.filter(r => !r.present);

  if (list.length === 0) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No registrations match.</td></tr>`;
    return;
  }

  list.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.studentName)}</td>
      <td>${escapeHtml(r.studentId)}</td>
      <td>${r.yearLevel || "—"}</td>
      <td>${r.dateRegistered}</td>
      <td>${r.present ? "Present" : "—"}</td>
      <td>
        <button class="small danger" data-act="cancel" data-id="${r.id}">Cancel</button>
      </td>`;
    body.appendChild(tr);
  });
}

// ---------- Wiring ----------
function init() {
  document.getElementById("event-form").addEventListener("submit", saveEvent);
  document.getElementById("event-reset").addEventListener("click", resetEventForm);
  document.getElementById("status-filter").addEventListener("change", render);
  document.getElementById("registration-form").addEventListener("submit", registerStudent);
  document.getElementById("reg-search").addEventListener("input", render);
  document.getElementById("reg-attendance-filter").addEventListener("change", render);

  document.getElementById("registrations-body").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.act === "cancel") cancelRegistration(btn.dataset.id);
  });

  // One click handler for all event-table buttons (event delegation).
  document.getElementById("events-body").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "edit") editEvent(id);
    if (btn.dataset.act === "delete") deleteEvent(id);
    if (btn.dataset.act === "select") selectEvent(id);
  });

  render();
}

document.addEventListener("DOMContentLoaded", init);
