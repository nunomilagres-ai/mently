// ─── Anthropic LLM via Cloudflare Worker proxy ───────────────────────────────
const PROXY_URL = 'https://unifiedpim-proxy.nm-ai.workers.dev/v1/messages'

export function getApiKey() {
  return localStorage.getItem('mently:anthropicKey') ?? ''
}

export function saveApiKey(key) {
  localStorage.setItem('mently:anthropicKey', key.trim())
}

export async function callClaude({ system, user, maxTokens = 800 }) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key não configurada.')

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Erro da API: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

// ─── Mapeamento signo PT → EN para API externa ────────────────────────────────
const SIGN_EN = {
  'Áries':       'aries',
  'Touro':       'taurus',
  'Gémeos':      'gemini',
  'Caranguejo':  'cancer',
  'Leão':        'leo',
  'Virgem':      'virgo',
  'Balança':     'libra',
  'Escorpião':   'scorpio',
  'Sagitário':   'sagittarius',
  'Capricórnio': 'capricorn',
  'Aquário':     'aquarius',
  'Peixes':      'pisces',
}

const PERIOD_EN = {
  dia:    'daily',
  semana: 'weekly',
  mes:    'monthly',
}

// ─── Buscar horóscopo ocidental de fonte externa ──────────────────────────────
async function fetchWesternHoroscope(signPT, period) {
  const signEN   = SIGN_EN[signPT]
  const periodEN = PERIOD_EN[period]

  // Horóscopo anual: API não suporta — Claude gera directamente
  if (!signEN || !periodEN) return null

  try {
    const res = await fetch(
      `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/${periodEN}?sign=${signEN}&day=TODAY`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.data?.horoscope ?? data?.data?.horoscope_data ?? null
  } catch {
    return null // falha silenciosa — Claude gera sem fonte externa
  }
}

// ─── Generate horoscope via Claude (com fonte ocidental externa) ──────────────
export async function generateHoroscope({ western, chinese, period, birthDate, age, sex }) {
  const periodPT = { dia: 'diário', semana: 'semanal', mes: 'mensal', ano: 'anual' }[period] ?? 'diário'
  const periodContext = {
    dia:    'para hoje, com foco no que o dia traz de concreto',
    semana: 'para esta semana, com a perspectiva dos próximos 7 dias',
    mes:    'para este mês, com os temas e oportunidades do período',
    ano:    'para este ano, com as grandes tendências e ciclos em curso',
  }[period] ?? 'para hoje'

  // Tentar obter horóscopo ocidental de fonte externa
  const westernExternal = await fetchWesternHoroscope(western.sign, period)

  const system = `És um astrólogo experiente que domina tanto a astrologia ocidental como o zodíaco chinês. Escreves em português europeu, com um tom reflexivo, concreto e honesto — nunca vago nem excessivamente positivo. O teu papel é reconciliar e sintetizar as duas tradições numa leitura única e coerente. Respondes sempre em JSON válido, sem texto fora do JSON.`

  const westernSource = westernExternal
    ? `Horóscopo ocidental de fonte externa para ${western.sign} (${periodPT}):\n"${westernExternal}"`
    : `Signo ocidental: ${western.sign} (elemento ${western.element}, regido por ${western.ruling})`

  const user = `Gera um horóscopo ${periodPT} ${periodContext} para esta pessoa:

${westernSource}

Signo chinês: ${chinese.sign} ${chinese.emoji}
Idade: ${age ?? 'desconhecida'} anos
Sexo: ${sex === 'female' ? 'feminino' : 'masculino'}

${westernExternal
  ? `A tua tarefa: com base no horóscopo ocidental acima (fonte externa), adiciona a perspectiva do zodíaco chinês para o ${chinese.sign} e reconcilia as duas tradições numa leitura unificada e personalizada. Não copies o texto original — sintetiza e enriquece.`
  : `A tua tarefa: integra as duas tradições astrológicas numa leitura coerente e personalizada para ${western.sign} + ${chinese.sign}.`
}

Devolve exactamente este JSON (sem markdown, sem texto antes ou depois):
{
  "geral": "2-3 frases de energia e tema central do período",
  "amor": "2-3 frases sobre amor, relações e ligações afectivas",
  "saude": "2-3 frases sobre saúde física e mental, energia vital",
  "trabalho": "2-3 frases sobre trabalho, projectos, carreira e finanças",
  "energia": <número inteiro 1 a 5>,
  "cor": "<cor sortuda em português>",
  "numero": <número inteiro 1 a 9>,
  "frase": "<uma frase curta e memorável que resume o período>",
  "fonte": ${westernExternal ? '"Horóscopo ocidental: horoscope-app-api.vercel.app · Perspectiva chinesa e síntese: Claude (Anthropic)"' : '"Gerado por Claude (Anthropic) com base nas duas tradições astrológicas"'}
}`

  const raw = await callClaude({ system, user, maxTokens: 1000 })

  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Resposta inválida da API. Tenta novamente.')
  }
}
