// Callback OAuth já não é usado — o login é gerido pelo byNuno Hub
export async function onRequestGet({ request, env }) {
  const appUrl = env.APP_URL || new URL(request.url).origin;
  return Response.redirect(appUrl, 302);
}
