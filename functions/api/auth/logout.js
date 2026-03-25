// Delega logout ao byNuno Hub (que limpa o cookie Domain=.bynuno.com)
export async function onRequestPost({ request }) {
  const cookieHeader = request.headers.get('Cookie') || '';
  try {
    await fetch('https://bynuno.com/api/auth/logout', {
      method:  'POST',
      headers: { Cookie: cookieHeader },
    });
  } catch {}
  return new Response(null, { status: 302, headers: { Location: '/login' } });
}
