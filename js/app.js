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

// ---------- Rendering ----------
function render() {
  renderEvents();
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
      <td>${ev.name}</td>
      <td>${ev.date || "—"}</td>
      <td>${ev.venue || "—"}</td>
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

// ---------- Wiring ----------
function init() {
  document.getElementById("event-form").addEventListener("submit", saveEvent);
  document.getElementById("event-reset").addEventListener("click", resetEventForm);
  document.getElementById("status-filter").addEventListener("change", render);

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
