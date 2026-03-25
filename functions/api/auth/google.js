// Redireciona para o login centralizado no byNuno Hub
export async function onRequestGet({ request, env }) {
  const appUrl = env.APP_URL || new URL(request.url).origin;
  return Response.redirect(
    `https://bynuno.com/api/auth/google?next=${encodeURIComponent(appUrl)}`,
    302
  );
}
