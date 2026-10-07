/*
 * storage.js
 * A small wrapper around localStorage so the rest of the app never touches
 * localStorage directly. Everything is stored as JSON under two keys.
 */
const Storage = {
  EVENTS_KEY: "soeam.events",
  REGS_KEY: "soeam.registrations",

  // Read an array back from localStorage. Returns [] if nothing is saved yet
  // or if the stored text is somehow corrupted.
  _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Could not read " + key, err);
      return [];
    }
  },

  _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getEvents() { return this._read(this.EVENTS_KEY); },
  saveEvents(events) { this._write(this.EVENTS_KEY, events); },

  getRegistrations() { return this._read(this.REGS_KEY); },
  saveRegistrations(regs) { this._write(this.REGS_KEY, regs); },
};
