// ─── Mently API Store — Cloudflare D1 via Pages Functions ────────────────────
// Interface idêntica ao store localStorage anterior, mas async.

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Não autenticado');
  }
  return res;
}

function createEntity(type) {
  const base = `/api/entities/${type}`;
  return {
    async list() {
      const res = await apiFetch(base);
      return res.json();
    },
    async get(id) {
      const res = await apiFetch(`${base}/${id}`);
      return res.ok ? res.json() : null;
    },
    async save(data) {
      if (data.id) {
        const res = await apiFetch(`${base}/${data.id}`, {
          method: 'PUT',
          body:   JSON.stringify(data),
        });
        return res.json();
      } else {
        const res = await apiFetch(base, {
          method: 'POST',
          body:   JSON.stringify(data),
        });
        return res.json();
      }
    },
    async delete(id) {
      await apiFetch(`${base}/${id}`, { method: 'DELETE' });
      return { id };
    },
    async byDate(date) {
      const all = await this.list();
      return all.find(item => item.date === date) ?? null;
    },
  };
}

// ─── Entidades ────────────────────────────────────────────────────────────────

const _labEntity       = createEntity('labResult');
const _weightEntity    = createEntity('weight');
const _nutritionEntity = createEntity('nutrition');
const _sleepEntity     = createEntity('sleep');
const _exerciseEntity  = createEntity('exercise');
const _profileEntity   = createEntity('profile');

// ─── Profile (singleton por utilizador) ──────────────────────────────────────
export const profileStore = {
  async get() {
    const all = await _profileEntity.list();
    return all[0] ?? null;
  },
  async save(data) {
    const existing = await this.get();
    return _profileEntity.save(existing ? { ...data, id: existing.id } : data);
  },
};

// ─── Lab Results ─────────────────────────────────────────────────────────────
export const labStore = {
  async list() {
    const all = await _labEntity.list();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async get(id)        { return _labEntity.get(id); },
  async save(result)   { return _labEntity.save(result); },
  async delete(id)     { return _labEntity.delete(id); },
};

// ─── Weight Logs ─────────────────────────────────────────────────────────────
export const weightStore = {
  async list() {
    const all = await _weightEntity.list();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async save(entry)    { return _weightEntity.save(entry); },
  async delete(id)     { return _weightEntity.delete(id); },
  async byDate(date)   { return _weightEntity.byDate(date); },
};

// ─── Nutrition Logs ───────────────────────────────────────────────────────────
export const nutritionStore = {
  async list() {
    const all = await _nutritionEntity.list();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async byDate(date)   { return _nutritionEntity.byDate(date); },
  async save(entry)    { return _nutritionEntity.save(entry); },
  async delete(id)     { return _nutritionEntity.delete(id); },
};

// ─── Sleep Logs ───────────────────────────────────────────────────────────────
export const sleepStore = {
  async list() {
    const all = await _sleepEntity.list();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async byDate(date)   { return _sleepEntity.byDate(date); },
  async save(entry)    { return _sleepEntity.save(entry); },
  async delete(id)     { return _sleepEntity.delete(id); },
};

// ─── Exercise Logs ────────────────────────────────────────────────────────────
export const exerciseStore = {
  async list() {
    const all = await _exerciseEntity.list();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async byDate(date)   { return _exerciseEntity.byDate(date); },
  async save(entry)    { return _exerciseEntity.save(entry); },
  async delete(id)     { return _exerciseEntity.delete(id); },
};

// ─── ID generator (local, não precisa de API) ─────────────────────────────────
export function genNewId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Horoscope cache (localStorage — é apenas cache de LLM, não dados do utilizador) ──
const HORO_KEY = 'mently:horoCache';
export const horoCache = {
  _all: () => { try { return JSON.parse(localStorage.getItem(HORO_KEY)) ?? {} } catch { return {} } },
  get:  (key) => horoCache._all()[key] ?? null,
  set:  (key, value) => {
    const all = horoCache._all(); all[key] = value;
    localStorage.setItem(HORO_KEY, JSON.stringify(all));
  },
  clear: () => localStorage.removeItem(HORO_KEY),
};

export function buildHoroCacheKey(westernSign, chineseSign, period) {
  const now = new Date();
  let dateKey;
  if (period === 'dia')    dateKey = now.toISOString().slice(0, 10);
  if (period === 'semana') {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - w) / 86400000 - 3 + ((w.getDay() + 6) % 7)) / 7);
    dateKey = `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  if (period === 'mes')    dateKey = now.toISOString().slice(0, 7);
  if (period === 'ano')    dateKey = String(now.getFullYear());
  return `${westernSign}-${chineseSign}-${period}-${dateKey}`;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}
