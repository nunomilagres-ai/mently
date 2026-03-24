// Callback OAuth — cria sessão e redireciona para a app
import { generateId, sessionCookie } from '../../_auth.js';

function getStateCookie(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [key, value] = part.trim().split('=');
    if (key === 'oauth_state') return value;
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const code   = url.searchParams.get('code');
  const state  = url.searchParams.get('state');
  const error  = url.searchParams.get('error');
  const appUrl = env.APP_URL || url.origin;

  if (error) return Response.redirect(`${appUrl}/login?error=acesso_negado`, 302);

  if (!state || state !== getStateCookie(request))
    return Response.redirect(`${appUrl}/login?error=estado_invalido`, 302);
  if (!code)
    return Response.redirect(`${appUrl}/login?error=sem_codigo`, 302);

  // Trocar code por token
  let tokenData;
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${appUrl}/api/auth/callback`,
        grant_type:    'authorization_code',
      }),
    });
    tokenData = await r.json();
  } catch { return Response.redirect(`${appUrl}/login?error=token_falhou`, 302); }

  if (tokenData.error) return Response.redirect(`${appUrl}/login?error=token_invalido`, 302);

  // Obter info do utilizador Google
  let userInfo;
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    userInfo = await r.json();
  } catch { return Response.redirect(`${appUrl}/login?error=userinfo_falhou`, 302); }

  if (!userInfo.sub || !userInfo.email)
    return Response.redirect(`${appUrl}/login?error=userinfo_invalido`, 302);

  // Opcional: restringir a um e-mail específico
  if (env.ALLOWED_EMAIL && userInfo.email !== env.ALLOWED_EMAIL)
    return Response.redirect(`${appUrl}/login?error=acesso_negado`, 302);

  const now = new Date().toISOString();

  // Criar ou actualizar utilizador
  let user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?')
    .bind(userInfo.sub).first();

  if (!user) {
    const userId = generateId();
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, google_id, avatar_url, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(userId, userInfo.email, userInfo.name, userInfo.sub, userInfo.picture || null, now, now).run();
    user = { id: userId };
  } else {
    await env.DB.prepare('UPDATE users SET name=?, avatar_url=?, updated_date=? WHERE id=?')
      .bind(userInfo.name, userInfo.picture || null, now, user.id).run();
  }

  // Criar sessão 30 dias
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_date) VALUES (?, ?, ?, ?)')
    .bind(sessionId, user.id, expiresAt, now).run();

  return new Response(null, {
    status:  302,
    headers: { Location: appUrl, 'Set-Cookie': sessionCookie(sessionId) },
  });
}
