// GET /api/horoscope?sign=aries&period=daily
// Proxy server-side para freehoroscopeapi.com (sem CORS no browser)

export async function onRequestGet({ request }) {
  const url    = new URL(request.url);
  const sign   = url.searchParams.get('sign');
  const period = url.searchParams.get('period') ?? 'daily';

  if (!sign) return Response.json({ error: 'sign obrigatório' }, { status: 400 });

  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/${period}?sign=${sign}&day=TODAY`
    );
    if (!res.ok) return Response.json({ error: 'API externa falhou' }, { status: 502 });
    const data = await res.json();
    const text = data?.data?.horoscope ?? null;
    if (!text) return Response.json({ error: 'Sem conteúdo' }, { status: 404 });
    return Response.json({ horoscope: text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}
