// Inicia o fluxo OAuth com Google
import { generateId } from '../../_auth.js';

export async function onRequestGet({ request, env }) {
  const appUrl = env.APP_URL || new URL(request.url).origin;
  if (!env.GOOGLE_CLIENT_ID)
    return Response.json({ error: 'GOOGLE_CLIENT_ID não configurado' }, { status: 500 });

  const state  = generateId();
  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${appUrl}/api/auth/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
    prompt:        'select_account',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location:     `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
    },
  });
}
