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

// ─── Generate horoscope via Claude ───────────────────────────────────────────
export async function generateHoroscope({ western, chinese, period, birthDate, age, sex }) {
  const periodPT = { dia: 'diário', semana: 'semanal', mes: 'mensal', ano: 'anual' }[period] ?? 'diário'
  const periodContext = {
    dia:    'para hoje, com foco no que o dia traz de concreto',
    semana: 'para esta semana, com a perspectiva dos próximos 7 dias',
    mes:    'para este mês, com os temas e oportunidades do período',
    ano:    'para este ano, com as grandes tendências e ciclos em curso',
  }[period] ?? 'para hoje'

  const system = `És um astrólogo experiente e reflexivo. Escreves em português europeu (não brasileiro), com um tom cuidado, inspirador e honesto — nunca vago nem excessivamente positivo. Conheces em profundidade a astrologia ocidental e o zodíaco chinês, e sabes integrar as duas tradições numa leitura coerente. Respondes sempre em JSON válido, sem texto fora do JSON.`

  const user = `Gera um horóscopo ${periodPT} ${periodContext} para esta pessoa:

- Signo ocidental: ${western.sign} (elemento ${western.element}, regido por ${western.ruling})
- Signo chinês: ${chinese.sign} (${chinese.emoji})
- Idade: ${age ?? 'desconhecida'} anos
- Sexo: ${sex === 'female' ? 'feminino' : 'masculino'}

A combinação ${western.sign} + ${chinese.sign} é única — integra os dois arquétipos na leitura de forma orgânica, sem os tratar separadamente.

Devolve exactamente este JSON (sem markdown, sem texto antes ou depois):
{
  "geral": "2-3 frases de energia e tema central do período",
  "amor": "2-3 frases sobre amor, relações e ligações afectivas",
  "saude": "2-3 frases sobre saúde física e mental, energia vital",
  "trabalho": "2-3 frases sobre trabalho, projectos, carreira e finanças",
  "energia": <número inteiro 1 a 5>,
  "cor": "<cor sortuda em português>",
  "numero": <número inteiro 1 a 9>,
  "frase": "<uma frase curta e memorável que resume o período>"
}`

  const raw = await callClaude({ system, user, maxTokens: 900 })

  // Parse JSON — robust (strip markdown fences if present)
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Resposta inválida da API. Tenta novamente.')
  }
}
