// Redireciona para o login centralizado no byNuno Hub
export async function onRequestGet({ request, env }) {
  const appUrl = env.APP_URL || new URL(request.url).origin;
  // Limpar cookie session_id local antigo (sem Domain) que pode colidir com o do Hub
  const headers = new Headers({
    Location: `https://bynuno.com/api/auth/google?next=${encodeURIComponent(appUrl)}`,
  });
  headers.append('Set-Cookie', 'session_id=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');
  return new Response(null, { status: 302, headers });
}
