/* Event & Attendance Manager — screen logic.
   Covers all 9 required features. Data lives in localStorage (see data.js). */

const $ = (id) => document.getElementById(id);

// ---------- State ----------
let data = loadData();          // { events, registrations }
let currentEventId = null;      // which event the Registrations view is showing
let regSearch = "";
let regAttFilter = "All";
let statusListFilter = "All";

// ---------- Helpers ----------
function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function commit() { saveData(data); }

// All registrations belonging to one event.
function regsFor(eventId) {
  return data.registrations.filter(r => r.eventId === eventId);
}

// Feature 7: derived counts for an event.
function statsFor(ev) {
  const regs = regsFor(ev.id);
  const registered = regs.length;
  const present = regs.filter(r => r.present).length;
  const slotsLeft = Math.max(0, ev.capacity - registered);
  const rate = registered === 0 ? 0 : Math.round((present / registered) * 100);
  return { registered, present, slotsLeft, rate };
}

function statusClass(s) {
  return "badge badge-" + s.toLowerCase().replace(/[^a-z]+/g, "-");
}

// =====================================================================
//  EVENTS VIEW
// =====================================================================

// Feature 1: add / edit an event (with validation).
function handleEventSubmit(e) {
  e.preventDefault();
  const id = $("event-id").value;
  const name = $("e-name").value.trim();
  const date = $("e-date").value;
  const venue = $("e-venue").value.trim();
  const capacity = parseInt($("e-capacity").value, 10);
  const status = $("e-status").value;

  // Validation — reject empty or nonsensical input.
  if (!name || !date || !venue) return setMsg("event-msg", "Name, date, and venue are required.", true);
  if (!Number.isInteger(capacity) || capacity < 1) return setMsg("event-msg", "Capacity must be a whole number of at least 1.", true);

  if (id) {
    // Edit existing. Capacity cannot drop below the number already registered.
    const ev = data.events.find(x => x.id === id);
    const registered = regsFor(id).length;
    if (capacity < registered) return setMsg("event-msg", `Capacity cannot be below ${registered} already registered.`, true);
    Object.assign(ev, { name, date, venue, capacity, status });
    setMsg("event-msg", "Event updated.");
  } else {
    data.events.push({ id: uid("ev"), name, date, venue, capacity, status });
    setMsg("event-msg", "Event added.");
  }
  commit();
  resetEventForm();
  renderEvents();
}

function editEvent(id) {
  const ev = data.events.find(x => x.id === id);
  if (!ev) return;
  $("event-id").value = ev.id;
  $("e-name").value = ev.name;
  $("e-date").value = ev.date;
  $("e-venue").value = ev.venue;
  $("e-capacity").value = ev.capacity;
  $("e-status").value = ev.status;
  $("event-form-title").textContent = "Edit Event";
  $("event-submit").textContent = "Save changes";
  $("event-cancel").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetEventForm() {
  $("event-form").reset();
  $("event-id").value = "";
  $("event-form-title").textContent = "Add Event";
  $("event-submit").textContent = "Add Event";
  $("event-cancel").classList.add("hidden");
}

// Feature 1 + 6: delete only if there are no registrations.
function deleteEvent(id) {
  if (regsFor(id).length > 0) {
    alert("This event has registrations and cannot be deleted. Set its status to Completed instead.");
    return;
  }
  if (!confirm("Delete this event?")) return;
  data.events = data.events.filter(x => x.id !== id);
  commit();
  renderEvents();
}

function renderEvents() {
  const wrap = $("event-list");
  wrap.innerHTML = "";
  const list = data.events.filter(ev =>
    statusListFilter === "All" ? true : ev.status === statusListFilter);

  if (list.length === 0) {
    wrap.innerHTML = `<p class="muted">No events in this status.</p>`;
    return;
  }

  list.forEach(ev => {
    const s = statsFor(ev);
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-top">
        <div>
          <h3 class="event-name">${escapeHtml(ev.name)}</h3>
          <p class="event-meta">${escapeHtml(ev.date)} · ${escapeHtml(ev.venue)}</p>
        </div>
        <span class="${statusClass(ev.status)}">${escapeHtml(ev.status)}</span>
      </div>
      <div class="event-counts">
        <span><strong>${s.registered}</strong> registered</span>
        <span><strong>${s.slotsLeft}</strong> slots left</span>
        <span><strong>${s.present}</strong> present</span>
        <span><strong>${s.rate}%</strong> attendance</span>
        <span class="cap">cap ${ev.capacity}</span>
      </div>
      <div class="event-actions">
        <button class="btn btn-primary btn-sm" data-act="open" data-id="${ev.id}">Registrations</button>
        <button class="btn btn-ghost btn-sm" data-act="edit" data-id="${ev.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-act="del" data-id="${ev.id}">Delete</button>
      </div>`;
    wrap.appendChild(card);
  });
}

// =====================================================================
//  REGISTRATIONS VIEW
// =====================================================================

function openEvent(id) {
  currentEventId = id;
  regSearch = ""; regAttFilter = "All";
  $("reg-search").value = ""; $("reg-att-filter").value = "All";
  showView("registrations");
  renderRegistrations();
}

// Feature 2 + 3: register a student (capacity + duplicate checks, Open-only).
function handleRegSubmit(e) {
  e.preventDefault();
  const ev = data.events.find(x => x.id === currentEventId);
  if (!ev) return;

  const name = $("r-name").value.trim();
  const studentId = $("r-id").value.trim();
  const year = $("r-year").value;

  if (ev.status !== "Open for Registration")
    return setMsg("reg-msg", "Registration is only allowed when the event is Open for Registration.", true);
  if (!name || !studentId) return setMsg("reg-msg", "Student name and ID are required.", true);

  const regs = regsFor(ev.id);
  if (regs.length >= ev.capacity) return setMsg("reg-msg", "Event is full — cannot register.", true);
  if (regs.some(r => r.studentId.toLowerCase() === studentId.toLowerCase()))
    return setMsg("reg-msg", "This student ID is already registered for this event.", true);

  data.registrations.push({
    id: uid("rg"), eventId: ev.id, studentName: name, studentId, year,
    dateRegistered: new Date().toISOString().slice(0, 10), present: false,
  });
  commit();
  setMsg("reg-msg", `${name} registered.`);
  $("reg-form").reset();
  renderRegistrations();
}

// Feature 4: cancel a registration (frees a slot).
function cancelReg(id) {
  if (!confirm("Cancel this registration?")) return;
  data.registrations = data.registrations.filter(r => r.id !== id);
  commit();
  renderRegistrations();
}

// Feature 5: toggle Present (check-in / undo). Only registered students appear here,
// so a non-registered student can never be checked in.
function togglePresent(id) {
  const r = data.registrations.find(x => x.id === id);
  if (!r) return;
  r.present = !r.present;
  commit();
  renderRegistrations();
}

function renderRegistrations() {
  const ev = data.events.find(x => x.id === currentEventId);
  if (!ev) return;
  const s = statsFor(ev);

  $("reg-event-name").textContent = ev.name;
  $("reg-event-meta").textContent = `${ev.date} · ${ev.venue} · ${ev.status}`;

  $("reg-stats").innerHTML = `
    ${statCard(s.registered, "Registered")}
    ${statCard(s.slotsLeft, "Slots left")}
    ${statCard(s.present, "Present")}
    ${statCard(s.rate + "%", "Attendance rate")}`;

  // Feature 8: search + filter registrations.
  const term = regSearch.toLowerCase();
  let list = regsFor(ev.id);
  if (term) list = list.filter(r =>
    r.studentName.toLowerCase().includes(term) || r.studentId.toLowerCase().includes(term));
  if (regAttFilter === "Present") list = list.filter(r => r.present);
  if (regAttFilter === "Absent") list = list.filter(r => !r.present);

  const body = $("reg-body");
  body.innerHTML = "";
  $("reg-empty").classList.toggle("hidden", list.length !== 0);

  list.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.studentName)}</td>
      <td><span class="emp-id">${escapeHtml(r.studentId)}</span></td>
      <td>${escapeHtml(r.year)}</td>
      <td>${escapeHtml(r.dateRegistered)}</td>
      <td><span class="badge ${r.present ? "badge-present" : "badge-absent"}">${r.present ? "Present" : "Not present"}</span></td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" data-act="present" data-id="${r.id}">${r.present ? "Undo" : "Check in"}</button>
        <button class="btn btn-danger btn-sm" data-act="cancel" data-id="${r.id}">Cancel</button>
      </td>`;
    body.appendChild(tr);
  });
}

function statCard(num, label) {
  return `<div class="stat"><div class="stat-num">${num}</div><div class="stat-name">${label}</div></div>`;
}

// =====================================================================
//  REPORT VIEW (Feature 9)
// =====================================================================

function renderReport() {
  // Count events per status.
  const counts = {};
  STATUS_ORDER.forEach(s => counts[s] = 0);
  data.events.forEach(ev => counts[ev.status] = (counts[ev.status] || 0) + 1);
  $("report-status").innerHTML = STATUS_ORDER.map(s => statCard(counts[s], s)).join("");

  // Completed event with the highest attendance rate.
  const completed = data.events.filter(ev => ev.status === "Completed");
  const box = $("report-best");
  if (completed.length === 0) {
    box.innerHTML = `<p class="muted">No completed events yet.</p>`;
    return;
  }
  let best = null, bestRate = -1;
  completed.forEach(ev => {
    const rate = statsFor(ev).rate;
    if (rate > bestRate) { bestRate = rate; best = ev; }
  });
  const s = statsFor(best);
  box.innerHTML = `
    <div class="event-card">
      <h3 class="event-name">${escapeHtml(best.name)}</h3>
      <p class="event-meta">${escapeHtml(best.date)} · ${escapeHtml(best.venue)}</p>
      <div class="event-counts">
        <span><strong>${s.present}</strong>/${s.registered} present</span>
        <span><strong>${s.rate}%</strong> attendance rate</span>
      </div>
    </div>`;
}

// =====================================================================
//  View switching + wiring
// =====================================================================

function setMsg(id, text, isError = false) {
  const el = $(id);
  el.textContent = text;
  el.className = "form-msg" + (isError ? " error" : " ok");
}

function showView(name) {
  ["events", "registrations", "report"].forEach(v =>
    $("view-" + v).classList.toggle("hidden", v !== name));
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("active", t.dataset.view === name));
  if (name === "events") renderEvents();
  if (name === "report") renderReport();
}

function init() {
  // Tabs
  document.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => showView(t.dataset.view)));
  $("back-to-events").addEventListener("click", () => showView("events"));

  // Event form
  $("event-form").addEventListener("submit", handleEventSubmit);
  $("event-cancel").addEventListener("click", resetEventForm);
  $("status-list-filter").addEventListener("change", e => { statusListFilter = e.target.value; renderEvents(); });

  // Event list actions (delegation)
  $("event-list").addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "open") openEvent(id);
    if (btn.dataset.act === "edit") editEvent(id);
    if (btn.dataset.act === "del") deleteEvent(id);
  });

  // Registration form + filters
  $("reg-form").addEventListener("submit", handleRegSubmit);
  $("reg-search").addEventListener("input", e => { regSearch = e.target.value.trim(); renderRegistrations(); });
  $("reg-att-filter").addEventListener("change", e => { regAttFilter = e.target.value; renderRegistrations(); });

  // Registration table actions (delegation)
  $("reg-body").addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    if (btn.dataset.act === "present") togglePresent(btn.dataset.id);
    if (btn.dataset.act === "cancel") cancelReg(btn.dataset.id);
  });

  renderEvents();
}

document.addEventListener("DOMContentLoaded", init);
