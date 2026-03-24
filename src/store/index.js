// ─── Mently LocalStorage Store ─────────────────────────────────────────────
// All data persisted in localStorage under namespaced keys.

const KEYS = {
  profile:   'mently:profile',
  labResults:'mently:labResults',
  weights:   'mently:weights',
  nutrition: 'mently:nutrition',
  sleep:     'mently:sleep',
  exercise:  'mently:exercise',
}

function get(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}
function getOne(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null } catch { return null }
}
function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── Profile ────────────────────────────────────────────────────────────────
// { name, birthDate, birthTime, sex, heightCm }
export const profileStore = {
  get: () => getOne(KEYS.profile),
  save: (data) => set(KEYS.profile, data),
}

// ─── Lab Results ─────────────────────────────────────────────────────────────
// { id, date, title, source ('manual'|'pdf'), markers: [{ name, value, unit, refMin, refMax }] }
export const labStore = {
  list: () => get(KEYS.labResults).sort((a, b) => b.date.localeCompare(a.date)),
  get: (id) => get(KEYS.labResults).find(r => r.id === id) ?? null,
  save: (result) => {
    const all = get(KEYS.labResults)
    const existing = all.findIndex(r => r.id === result.id)
    if (existing >= 0) { all[existing] = result } else { all.push({ ...result, id: result.id || genId() }) }
    set(KEYS.labResults, all)
  },
  delete: (id) => set(KEYS.labResults, get(KEYS.labResults).filter(r => r.id !== id)),
}

// ─── Weight Logs ─────────────────────────────────────────────────────────────
// { id, date, weightKg }
export const weightStore = {
  list: () => get(KEYS.weights).sort((a, b) => b.date.localeCompare(a.date)),
  save: (entry) => {
    const all = get(KEYS.weights)
    const existing = all.findIndex(w => w.id === entry.id)
    if (existing >= 0) { all[existing] = entry } else { all.push({ ...entry, id: entry.id || genId() }) }
    set(KEYS.weights, all)
  },
  delete: (id) => set(KEYS.weights, get(KEYS.weights).filter(w => w.id !== id)),
  byDate: (date) => get(KEYS.weights).find(w => w.date === date) ?? null,
}

// ─── Nutrition Logs ──────────────────────────────────────────────────────────
// { id, date, meals: [{ name, foods: [{name, amount, unit, kcal, protein, carbs, fat, fiber, ...micros}] }] }
export const nutritionStore = {
  list: () => get(KEYS.nutrition).sort((a, b) => b.date.localeCompare(a.date)),
  byDate: (date) => get(KEYS.nutrition).find(n => n.date === date) ?? null,
  save: (entry) => {
    const all = get(KEYS.nutrition)
    const existing = all.findIndex(n => n.id === entry.id)
    if (existing >= 0) { all[existing] = entry } else { all.push({ ...entry, id: entry.id || genId() }) }
    set(KEYS.nutrition, all)
  },
  delete: (id) => set(KEYS.nutrition, get(KEYS.nutrition).filter(n => n.id !== id)),
}

// ─── Sleep Logs ──────────────────────────────────────────────────────────────
// { id, date, bedtime, wakeTime, hoursSlept, notes }
export const sleepStore = {
  list: () => get(KEYS.sleep).sort((a, b) => b.date.localeCompare(a.date)),
  byDate: (date) => get(KEYS.sleep).find(s => s.date === date) ?? null,
  save: (entry) => {
    const all = get(KEYS.sleep)
    const existing = all.findIndex(s => s.id === entry.id)
    if (existing >= 0) { all[existing] = entry } else { all.push({ ...entry, id: entry.id || genId() }) }
    set(KEYS.sleep, all)
  },
  delete: (id) => set(KEYS.sleep, get(KEYS.sleep).filter(s => s.id !== id)),
}

// ─── Exercise Logs ───────────────────────────────────────────────────────────
// { id, date, steps, sessions: [{ type, durationMin, intensity, kcalBurned }] }
export const exerciseStore = {
  list: () => get(KEYS.exercise).sort((a, b) => b.date.localeCompare(a.date)),
  byDate: (date) => get(KEYS.exercise).find(e => e.date === date) ?? null,
  save: (entry) => {
    const all = get(KEYS.exercise)
    const existing = all.findIndex(e => e.id === entry.id)
    if (existing >= 0) { all[existing] = entry } else { all.push({ ...entry, id: entry.id || genId() }) }
    set(KEYS.exercise, all)
  },
  delete: (id) => set(KEYS.exercise, get(KEYS.exercise).filter(e => e.id !== id)),
}

export function genNewId() { return genId() }
