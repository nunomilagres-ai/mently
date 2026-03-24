// GET    /api/entities/:type/:id  — obter um
// PUT    /api/entities/:type/:id  — actualizar
// DELETE /api/entities/:type/:id  — eliminar
import { getAuthUser, unauthorized, json } from '../../../_auth.js';

function now() { return new Date().toISOString(); }

async function getRow(env, type, id, userId) {
  return env.DB.prepare(
    'SELECT id, data, created_date, updated_date FROM entities WHERE id = ? AND type = ? AND user_id = ?'
  ).bind(id, type, userId).first();
}

export async function onRequestGet({ request, env, params }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();
  const row = await getRow(env, params.type, params.id, user.id);
  if (!row) return json({ error: 'Não encontrado' }, 404);
  return json({ ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date });
}

export async function onRequestPut({ request, env, params }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido' }, 400); }

  const row = await getRow(env, params.type, params.id, user.id);
  if (!row) return json({ error: 'Não encontrado' }, 404);

  const ts      = now();
  const updated = { ...JSON.parse(row.data), ...body, id: params.id };

  await env.DB.prepare(
    'UPDATE entities SET data = ?, updated_date = ? WHERE id = ? AND user_id = ?'
  ).bind(JSON.stringify(updated), ts, params.id, user.id).run();

  return json({ ...updated, created_date: row.created_date, updated_date: ts });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();
  await env.DB.prepare('DELETE FROM entities WHERE id = ? AND user_id = ?')
    .bind(params.id, user.id).run();
  return json({ id: params.id });
}
