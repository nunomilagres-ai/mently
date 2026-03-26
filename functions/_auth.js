// functions/_auth.js — Mently auth delegado ao byNuno Hub

export async function getAuthUser(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';

  // Extrair todos os valores de session_id (pode haver duplicados: cookie local antigo
  // do mently sem Domain= e o cookie partilhado Domain=.bynuno.com)
  const sessionIds = [];
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx < 0) continue;
    const key = part.substring(0, eqIdx).trim();
    const val = part.substring(eqIdx + 1).trim();
    if (key === 'session_id' && val) sessionIds.push(val);
  }
  if (sessionIds.length === 0) return null;

  // Tentar cada session_id até um ser aceite pelo byNuno Hub
  let hubUser;
  for (const sid of sessionIds) {
    try {
      const r = await fetch('https://bynuno.com/api/auth/me', {
        headers: { Cookie: `session_id=${sid}` },
      });
      if (r.ok) { hubUser = await r.json(); break; }
    } catch {}
  }
  if (!hubUser) return null;

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
