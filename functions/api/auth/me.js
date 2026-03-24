import { getAuthUser, unauthorized } from '../../_auth.js';

export async function onRequestGet({ request, env }) {
  const user = await getAuthUser(request, env);
  if (!user) return unauthorized();
  return Response.json(user);
}
