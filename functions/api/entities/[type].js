// GET  /api/entities/:type  — listar
// POST /api/entities/:type  — criar
import { getAuthUser, unauthorized, json } from '../../_auth.js';

function now() { return new Date().toISOString(); }
function gid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ request, env, params }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();

  const type = params.type;
  const { results } = await env.DB.prepare(
    'SELECT id, data, created_date, updated_date FROM entities WHERE type = ? AND user_id = ? ORDER BY created_date DESC'
  ).bind(type, user.id).all();

  return json(results.map(r => ({
    ...JSON.parse(r.data),
    id:           r.id,
    created_date: r.created_date,
    updated_date: r.updated_date,
  })));
}

export async function onRequestPost({ request, env, params }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, 400); }

  const type = params.type;
  const id   = body.id || gid();
  const ts   = now();
  const row  = { ...body, id };

  await env.DB.prepare(
    'INSERT OR REPLACE INTO entities (id, type, data, user_id, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, type, JSON.stringify(row), user.id, body.created_date || ts, ts).run();

  return json({ ...row, created_date: body.created_date || ts, updated_date: ts }, 201);
}
