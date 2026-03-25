// functions/_auth.js — Mently auth delegado ao byNuno Hub

export async function getAuthUser(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  if (!cookieHeader.includes('session_id')) return null;

  // Validar sessão via bynuno.com (cookie partilhado Domain=.bynuno.com)
  let hubUser;
  try {
    const r = await fetch('https://bynuno.com/api/auth/me', {
      headers: { Cookie: cookieHeader },
    });
    if (!r.ok) return null;
    hubUser = await r.json();
  } catch {
    return null;
  }

  // Garantir que o utilizador existe localmente (FK em entities)
  // Usa o user.id local existente para preservar dados já criados
  const now = new Date().toISOString();
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(hubUser.email).first();

  if (!user) {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, google_id, avatar_url, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(hubUser.id, hubUser.email, hubUser.name, null, hubUser.avatar_url, now, now).run();
    user = { id: hubUser.id };
  } else if (user.name !== hubUser.name || user.avatar_url !== hubUser.avatar_url) {
    await env.DB.prepare('UPDATE users SET name=?, avatar_url=?, updated_date=? WHERE id=?')
      .bind(hubUser.name, hubUser.avatar_url, now, user.id).run();
  }

  return { id: user.id, email: hubUser.email, name: hubUser.name, avatar_url: hubUser.avatar_url };
}

export function unauthorized(msg = 'Não autenticado') {
  return Response.json({ error: msg }, { status: 401 });
}

export function json(data, status = 200) {
  return Response.json(data, { status });
}
