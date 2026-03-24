// ─── Western Zodiac ──────────────────────────────────────────────────────────
const ZODIAC = [
  { sign: 'Capricórnio', symbol: '♑', start: [12, 22], end: [1, 19],
    element: 'Terra', ruling: 'Saturno',
    traits: ['ambicioso', 'disciplinado', 'responsável', 'prudente', 'persistente'],
    desc: 'Capricórnio é o escalador do zodíaco — metódico, paciente e determinado a atingir o cume. Guiado por Saturno, aprende com cada obstáculo e transforma esforço em conquista duradoura. A sua força reside na capacidade de construir lentamente o que os outros desistem a meio do caminho.' },
  { sign: 'Aquário',     symbol: '♒', start: [1, 20],  end: [2, 18],
    element: 'Ar', ruling: 'Urano',
    traits: ['inovador', 'independente', 'humanista', 'excêntrico', 'visionário'],
    desc: 'Aquário é o visionário do zodíaco — vive à frente do seu tempo, pensa em sistemas e sonha com um mundo melhor. Guiado por Urano, quebra convenções com elegância intelectual. A sua maior força é a capacidade de ver o todo quando os outros apenas vêem a parte.' },
  { sign: 'Peixes',      symbol: '♓', start: [2, 19],  end: [3, 20],
    element: 'Água', ruling: 'Neptuno',
    traits: ['empático', 'intuitivo', 'criativo', 'sonhador', 'compassivo'],
    desc: 'Peixes é o místico do zodíaco — absorve as emoções do mundo como uma esponja e transforma-as em arte, cura ou sabedoria. Guiado por Neptuno, dissolve fronteiras e conecta o visível ao invisível. A sua força é a empatia profunda que poucos conseguem alcançar.' },
  { sign: 'Áries',       symbol: '♈', start: [3, 21],  end: [4, 19],
    element: 'Fogo', ruling: 'Marte',
    traits: ['corajoso', 'iniciador', 'entusiasta', 'impulsivo', 'líder nato'],
    desc: 'Áries é o pioneiro do zodíaco — age primeiro, pensa depois, e raramente se arrepende. Guiado por Marte, arde com uma energia contagiante que abre caminhos onde outros vêem muros. A sua força é a coragem inabalável de começar algo novo sem garantias.' },
  { sign: 'Touro',       symbol: '♉', start: [4, 20],  end: [5, 20],
    element: 'Terra', ruling: 'Vénus',
    traits: ['leal', 'paciente', 'sensorial', 'estável', 'determinado'],
    desc: 'Touro é o construtor do zodíaco — aprecia a beleza, valoriza a estabilidade e constrói com as próprias mãos o que deseja manter para sempre. Guiado por Vénus, combina sensualidade com solidez. A sua força é a lealdade inabalável e a capacidade de resistir às tempestades.' },
  { sign: 'Gémeos',      symbol: '♊', start: [5, 21],  end: [6, 20],
    element: 'Ar', ruling: 'Mercúrio',
    traits: ['curioso', 'adaptável', 'comunicativo', 'versátil', 'espirituoso'],
    desc: 'Gémeos é o mensageiro do zodíaco — a mente que nunca para, que recolhe ideias como outros recolhem memórias. Guiado por Mercúrio, navega entre mundos com leveza e humor. A sua força é a adaptabilidade que lhe permite prosperar em qualquer contexto.' },
  { sign: 'Caranguejo',  symbol: '♋', start: [6, 21],  end: [7, 22],
    element: 'Água', ruling: 'Lua',
    traits: ['intuitivo', 'protetor', 'emocional', 'criativo', 'tenaz'],
    desc: 'Caranguejo é o guardião do zodíaco — protege os seus com uma tenacidade que surpreende quem vê apenas a carapaça. Guiado pela Lua, oscila entre marés internas mas nunca perde o norte emocional. A sua força é a memória afetiva e a capacidade de criar um lar em qualquer lugar.' },
  { sign: 'Leão',        symbol: '♌', start: [7, 23],  end: [8, 22],
    element: 'Fogo', ruling: 'Sol',
    traits: ['generoso', 'criativo', 'carismático', 'orgulhoso', 'fiel'],
    desc: 'Leão é o soberano do zodíaco — não por imposição, mas por presença natural que ilumina qualquer sala. Guiado pelo Sol, irradia calor, criatividade e lealdade. A sua força é a generosidade genuína com quem ama e a coragem de se mostrar tal como é.' },
  { sign: 'Virgem',      symbol: '♍', start: [8, 23],  end: [9, 22],
    element: 'Terra', ruling: 'Mercúrio',
    traits: ['analítico', 'meticuloso', 'útil', 'humilde', 'dedicado'],
    desc: 'Virgem é o artesão do zodíaco — encontra beleza na perfeição dos detalhes e satisfação no serviço genuíno. Guiada por Mercúrio, une mente analítica a um coração que quer melhorar tudo o que toca. A sua força é a dedicação silenciosa que sustenta o que outros constroem.' },
  { sign: 'Balança',     symbol: '♎', start: [9, 23],  end: [10, 22],
    element: 'Ar', ruling: 'Vénus',
    traits: ['diplomático', 'justo', 'estético', 'social', 'indeciso'],
    desc: 'Balança é o diplomata do zodíaco — busca a harmonia como outros buscam o ar que respiram. Guiada por Vénus, equilibra beleza e justiça com graça natural. A sua força é a capacidade de ouvir todas as partes e encontrar o ponto de encontro onde todos cabem.' },
  { sign: 'Escorpião',   symbol: '♏', start: [10, 23], end: [11, 21],
    element: 'Água', ruling: 'Plutão',
    traits: ['intenso', 'perspicaz', 'transformador', 'determinado', 'misterioso'],
    desc: 'Escorpião é o alquimista do zodíaco — mergulha nas profundezas sem medo e regressa transformado. Guiado por Plutão, conhece os segredos da morte e do renascimento melhor do que qualquer outro. A sua força é a resiliência absoluta face ao que seria destruidor para outros.' },
  { sign: 'Sagitário',   symbol: '♐', start: [11, 22], end: [12, 21],
    element: 'Fogo', ruling: 'Júpiter',
    traits: ['aventureiro', 'filosófico', 'otimista', 'honesto', 'livre'],
    desc: 'Sagitário é o explorador do zodíaco — persegue o horizonte não por fuga, mas por sede genuína de verdade e expansão. Guiado por Júpiter, transforma cada viagem em sabedoria. A sua força é o otimismo inabalável que encontra oportunidade onde outros vêem fim.' },
]

export function getZodiac(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  const month = d.getMonth() + 1
  const day   = d.getDate()
  for (const z of ZODIAC) {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z
    }
  }
  return null
}

// ─── Chinese Zodiac ──────────────────────────────────────────────────────────
const CHINESE = [
  { sign: 'Rato',     emoji: '🐭',
    traits: ['inteligente', 'encantador', 'perspicaz', 'oportunista', 'versátil'],
    desc: 'O Rato é o estrategista silencioso — recolhe informação, avalia riscos e age no momento certo. Encantador e adaptável, consegue prosperar em qualquer ambiente. A sua inteligência aguçada é a sua maior arma.' },
  { sign: 'Boi',      emoji: '🐂',
    traits: ['trabalhador', 'fiável', 'metódico', 'paciente', 'honesto'],
    desc: 'O Boi é a âncora inabalável — trabalha sem parar, cumpre o que promete e resiste onde outros cedem. A sua força não vem da agilidade mas da persistência: lento mas imparável, constrói legados que duram.' },
  { sign: 'Tigre',    emoji: '🐯',
    traits: ['corajoso', 'carismático', 'impulsivo', 'independente', 'magnético'],
    desc: 'O Tigre é a força da natureza que não pede licença para entrar. Magnético, corajoso e intensamente vivo, atrai olhares e desafia limites. A sua energia contagiante inspira lealdade profunda em quem o rodeia.' },
  { sign: 'Coelho',   emoji: '🐰',
    traits: ['elegante', 'diplomático', 'cauteloso', 'empático', 'refinado'],
    desc: 'O Coelho é o artista da harmonia — navega conflitos com elegância, cria beleza à sua volta e cuida dos seus com discrição genuína. A sua sensibilidade apurada transforma o quotidiano em experiência estética.' },
  { sign: 'Dragão',   emoji: '🐲',
    traits: ['visionário', 'carismático', 'ambicioso', 'perfeccionista', 'impetuoso'],
    desc: 'O Dragão é a força mítica do zodíaco chinês — não segue caminhos, cria-os. Imponente e magnético, inspira reverência natural. A sua ambição não tem tecto e a sua energia é praticamente inesgotável.' },
  { sign: 'Serpente', emoji: '🐍',
    traits: ['intuitivo', 'misterioso', 'sábio', 'determinado', 'filosófico'],
    desc: 'A Serpente é a guardiã da sabedoria oculta — observa mais do que fala, sente mais do que mostra e compreende mais do que revela. A sua intuição é quase profética e a sua determinação, silenciosa e irresistível.' },
  { sign: 'Cavalo',   emoji: '🐴',
    traits: ['livre', 'enérgico', 'carismático', 'impaciente', 'aventureiro'],
    desc: 'O Cavalo é o espírito livre do zodíaco — não tolera jaulas, floresce em movimento e inspira todos os que conseguem acompanhar o seu ritmo. Entusiasta e sociável, vive o presente com uma intensidade rara.' },
  { sign: 'Cabra',    emoji: '🐐',
    traits: ['criativo', 'gentil', 'sensível', 'artístico', 'intuitivo'],
    desc: 'A Cabra é a alma criativa que vive entre o sonho e a realidade com graça peculiar. Profundamente empática e artisticamente dotada, encontra beleza onde outros passam sem ver. Prospera quando rodeada de afeto e liberdade.' },
  { sign: 'Macaco',   emoji: '🐵',
    traits: ['engenhoso', 'curioso', 'divertido', 'adaptável', 'hábil'],
    desc: 'O Macaco é o génio travesso do zodíaco — a mente mais ágil, o humor mais afiado, a criatividade mais irreverente. Resolve problemas com brilhantismo e raramente leva a vida demasiado a sério, o que paradoxalmente lhe permite ir mais longe.' },
  { sign: 'Galo',     emoji: '🐓',
    traits: ['organizado', 'honesto', 'perfeccionista', 'observador', 'corajoso'],
    desc: 'O Galo é o farol da ordem e da honestidade — diz o que pensa, faz o que diz e espera o mesmo de todos. A sua observação meticulosa raro deixa escapar um pormenor. Exigente consigo e com os outros, mas generoso na lealdade.' },
  { sign: 'Cão',      emoji: '🐶',
    traits: ['leal', 'honesto', 'protetor', 'justo', 'diligente'],
    desc: 'O Cão é a consciência viva do zodíaco — incapaz de tolerar injustiça, defende os seus com uma lealdade que não conhece condições. A sua honestidade pode ser brutal mas nunca cruel: vem sempre do coração.' },
  { sign: 'Porco',    emoji: '🐷',
    traits: ['generoso', 'sincero', 'diligente', 'complacente', 'otimista'],
    desc: 'O Porco é a abundância personificada — generoso até à inconveniência, otimista por natureza e profundamente sincero. Trabalha com afinco e partilha com prazer. A sua bondade genuína é um bálsamo em qualquer relação.' },
]

const CNY_DATES = {
  1960:[1,28], 1961:[2,15], 1962:[2,5],  1963:[1,25], 1964:[2,13],
  1965:[2,2],  1966:[1,21], 1967:[2,9],  1968:[1,30], 1969:[2,17],
  1970:[2,6],  1971:[1,27], 1972:[2,15], 1973:[2,3],  1974:[1,23],
  1975:[2,11], 1976:[1,31], 1977:[2,18], 1978:[2,7],  1979:[1,28],
  1980:[2,16], 1981:[2,5],  1982:[1,25], 1983:[2,13], 1984:[2,2],
  1985:[2,20], 1986:[2,9],  1987:[1,29], 1988:[2,17], 1989:[2,6],
  1990:[1,27], 1991:[2,15], 1992:[2,4],  1993:[1,23], 1994:[2,10],
  1995:[1,31], 1996:[2,19], 1997:[2,7],  1998:[1,28], 1999:[2,16],
  2000:[2,5],  2001:[1,24], 2002:[2,12], 2003:[2,1],  2004:[1,22],
  2005:[2,9],  2006:[1,29], 2007:[2,18], 2008:[2,7],  2009:[1,26],
  2010:[2,14], 2011:[2,3],  2012:[1,23], 2013:[2,10], 2014:[1,31],
  2015:[2,19], 2016:[2,8],  2017:[1,28], 2018:[2,16], 2019:[2,5],
  2020:[1,25], 2021:[2,12], 2022:[2,1],  2023:[1,22], 2024:[2,10],
  2025:[1,29], 2026:[2,17],
}

export function getChineseZodiac(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day   = d.getDate()
  const cny = CNY_DATES[year]
  let chineseYear = year
  if (cny) {
    if (month < cny[0] || (month === cny[0] && day < cny[1])) chineseYear = year - 1
  }
  const idx = ((chineseYear - 2020) % 12 + 12) % 12
  return CHINESE[idx]
}

// ─── Age ─────────────────────────────────────────────────────────────────────
export function getAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ─── Combination insight ──────────────────────────────────────────────────────
// Generates a personalised paragraph combining Western + Chinese energies.
const ELEMENT_HARMONY = {
  'Fogo+Fogo':   'Esta dupla de fogo cria uma personalidade de energia quase solar — intensa, criativa e magnética. O risco é o excesso; a virtude, a capacidade de iluminar tudo à volta.',
  'Fogo+Terra':  'O fogo dá a visão, a terra dá a persistência para a concretizar. Uma combinação rara que une inspiração e disciplina numa só pessoa.',
  'Fogo+Metal':  'O fogo molda o metal, tornando-o mais resistente e afiado. Esta energia une coragem com precisão — age com força mas raramente sem estratégia.',
  'Fogo+Água':   'Fogo e água em tensão criativa — apaixonado mas capaz de sentir profundamente, impulsivo mas com intuição aguçada. O equilíbrio entre os dois é a grande obra de vida.',
  'Fogo+Madeira':'Uma combinação expansiva e vibrante. A madeira alimenta o fogo e o fogo impulsiona o crescimento. Energia contagiante, optimismo raro e uma capacidade natural de inspirar.',
  'Terra+Terra': 'Dupla de terra: profunda estabilidade, construção lenta e sólida, valores inabaláveis. A paciência é a superpotência desta combinação. O que constrói, dura.',
  'Terra+Metal': 'Terra e metal: disciplina sobre disciplina, mas com um propósito elevado. Trabalha com método, mantém padrões altos e raramente desiste. A tenacidade é o seu traço mais marcante.',
  'Terra+Água':  'A terra estrutura as emoções da água, criando uma pessoa sensível mas com os pés bem assentes no chão. Alia intuição a pragmatismo de forma invulgar.',
  'Terra+Madeira':'A madeira cresce da terra. Esta combinação une estabilidade com crescimento — paciente para plantar, determinado para colher.',
  'Ar+Fogo':     'O ar aviva o fogo. Aqui a inteligência alimenta a paixão — ideias brilhantes executadas com entusiasmo genuíno. Uma mente que inspira e move.',
  'Ar+Terra':    'A mente aérea aterra na realidade sem perder altitude. Une pensamento estratégico com execução prática — raro e valioso.',
  'Ar+Metal':    'Precisão intelectual levada ao limite. Esta combinação analisa, aperfeiçoa e comunica com uma clareza que poucos atingem.',
  'Ar+Água':     'Uma das combinações mais intuitivas e criativas. Pensa em sistemas e sente em profundidade — o artista-filósofo do zodíaco.',
  'Ar+Madeira':  'Expansão em todas as frentes — mental, emocional, social. Esta energia quer crescer, aprender e partilhar em simultâneo.',
  'Água+Fogo':   'Intensidade emocional com força de acção. Sente com a profundidade da água e age com a urgência do fogo — raramente indiferente a qualquer coisa.',
  'Água+Terra':  'Emoção com raízes. Intuitivo mas estável, sensível mas não frágil. Cria laços profundos e sabe como sustentá-los ao longo do tempo.',
  'Água+Metal':  'A intuição afiada pelo rigor. Esta combinação sente o que os outros não percebem e analisa o que os outros não vêem.',
  'Água+Água':   'Uma sensibilidade oceânica — profunda, criativa, quase psíquica. O desafio é não se perder nas próprias profundezas; a virtude, a empatia absoluta.',
  'Água+Madeira':'A água alimenta a madeira. Uma combinação de crescimento emocional constante — aprende com cada experiência e transforma-a em sabedoria.',
}

// Chinese sign elements (approx. 5-element system mapped to nature)
const CHINESE_ELEMENT = {
  'Rato': 'Água', 'Boi': 'Terra', 'Tigre': 'Madeira', 'Coelho': 'Madeira',
  'Dragão': 'Terra', 'Serpente': 'Fogo', 'Cavalo': 'Fogo', 'Cabra': 'Terra',
  'Macaco': 'Metal', 'Galo': 'Metal', 'Cão': 'Terra', 'Porco': 'Água',
}

export function getCombinationInsight(western, chinese) {
  if (!western || !chinese) return null
  const westernEl  = western.element
  const chineseEl  = CHINESE_ELEMENT[chinese.sign] ?? 'Terra'
  const harmonyKey = `${westernEl}+${chineseEl}`
  const elementText = ELEMENT_HARMONY[harmonyKey] ?? ELEMENT_HARMONY[`${chineseEl}+${westernEl}`] ?? ''

  return {
    elementText,
    westernEl,
    chineseEl,
    summary: `${western.sign} (${westernEl}) × ${chinese.sign} (${chineseEl})`,
    combined: `Como ${western.sign} guiado pela energia do ${chinese.sign}, carregas em ti a dualidade de ${western.traits.slice(0,2).join(' e ')} com o temperamento ${chinese.traits.slice(0,2).join(' e ')} do zodíaco oriental. ${elementText} Os teus pontos fortes naturais são ${[...western.traits.slice(0,2), ...chinese.traits.slice(0,2)].join(', ')}.`,
  }
}

// ─── Deterministic pseudo-random horoscope generator ─────────────────────────
// Uses a seeded hash so the same sign + period = same text consistently.

function seedHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

function pick(arr, seed, offset = 0) {
  return arr[(seedHash(String(seed)) + offset) % arr.length]
}

// Text pools per theme
const POOLS = {
  geral: [
    'A energia que te rodeia convida à reflexão antes da acção. Toma o tempo de que precisas — a clareza chegará.',
    'Um ciclo de consolidação está em curso. O que semeste recentemente começa a mostrar os primeiros frutos.',
    'A tua intuição está particularmente afiada. Confia nos sinais subtis que o ambiente te envia.',
    'Momento favorável para iniciar o que adiaste. A janela de oportunidade está aberta — entra com intenção.',
    'A tua resiliência é testada, mas este desafio tem um propósito. Do outro lado encontras uma versão mais forte de ti.',
    'Uma energia de renovação percorre o teu campo energético. O que já não serve está a soltar-se naturalmente.',
    'O universo conspira a teu favor, mas pede que tu também te movimentas. Acção e fé em equilíbrio.',
    'Período de síntese: o passado e o presente convergem para te mostrar o caminho mais autêntico.',
    'A tua presença tem mais impacto do que imaginas. Sê intencional com o que transmites.',
    'Um momento de quietude interior precede uma expansão significativa. Não confundas pausa com estagnação.',
    'As sincronicidades multiplicam-se. Presta atenção às coincidências — raramente o são de facto.',
    'Energia de colheita: o esforço acumulado começa a manifestar-se de formas tangíveis e inesperadas.',
  ],
  amor: [
    'As relações pedem autenticidade acima de tudo. Sê quem és e atrai quem te merece.',
    'Uma conversa honesta pode transformar uma tensão que já dura há demasiado tempo.',
    'O amor que dás regressa amplificado. Generosidade emocional é a tua moeda mais valiosa agora.',
    'Cuida primeiro da relação que tens contigo. É ela que define o padrão de todas as outras.',
    'Uma ligação do passado pode surgir no teu campo — observa com sabedoria antes de agir.',
    'Momento favorável para expressar o que sentes. As palavras certas chegam mais facilmente do que o habitual.',
    'A vulnerabilidade não é fraqueza — é a porta de entrada para a intimidade que procuras.',
    'Pequenos gestos de afeto têm hoje mais peso do que grandes declarações. A consistência fala mais alto.',
    'Dá espaço às tuas relações para respirarem. O afeto que não sufoca, perdura.',
    'A energia romântica está elevada. Se estás em relação, aprofunda; se estás livre, abre-te.',
    'Uma pessoa próxima precisa de ti de formas que ainda não verbalizou. A tua atenção é um presente.',
    'Cuida dos limites sem fechar o coração. Fronteiras saudáveis fortalecem, não afastam.',
  ],
  saude: [
    'O teu corpo fala antes da mente admitir o cansaço. Escuta os sinais físicos com atenção.',
    'Momento favorável para estabelecer ou reforçar rotinas de bem-estar. O que inicias agora cria hábito.',
    'A qualidade do sono é a tua prioridade número um. Tudo o mais melhora quando descanso é honrado.',
    'O movimento físico é hoje mais do que exercício — é processamento emocional em ação.',
    'Alimenta-te com intenção. O que colocas no corpo reflecte e influencia o estado mental.',
    'Um período de recuperação activa serve melhor do que esforço intenso. Respeita o ritmo natural.',
    'A tua energia nervosa está elevada. Técnicas de respiração ou meditação trazem equilíbrio rápido.',
    'Presta atenção à zona do plexo solar — é onde acumulas tensão sem perceber.',
    'Hidratação e exposição à luz natural fazem hoje uma diferença significativa no teu estado geral.',
    'O corpo pede menos intensidade e mais consistência. Trinta minutos todos os dias superam duas horas ocasionais.',
    'Momento ideal para reavaliar hábitos que já não servem o teu nível de energia actual.',
    'A saúde mental e física estão particularmente interligadas agora. O que trabalhas num, ressoa no outro.',
  ],
  trabalho: [
    'A tua criatividade está num pico — regista as ideias que surgem antes que o quotidiano as engula.',
    'Uma oportunidade que parece pequena pode ser o início de algo significativo. Não subestimes os detalhes.',
    'Colaboração supera esforço solo neste período. Procura os aliados certos para o que tens em mãos.',
    'Momento de consolidar antes de expandir. Revê o que já construíste — há mais valor lá do que vês.',
    'A tua capacidade de análise está aguçada. Toma as decisões importantes que tens adiado.',
    'Um projeto que parecia estagnado encontra agora novo impulso. Dá-lhe a atenção que merece.',
    'A tua reputação é o teu capital mais valioso. Cada compromisso honrado é um investimento a longo prazo.',
    'Evita dispersão: foco numa só coisa bem feita supera várias a meio do caminho.',
    'Comunica com clareza e directeza. A ambiguidade custa mais do que qualquer conversa difícil.',
    'Período favorável para negociar, propor ou apresentar. A tua argumentação está particularmente sólida.',
    'O que fazes com disciplina agora, colhes com abundância depois. Confia no processo mesmo sem ver resultados imediatos.',
    'Uma mudança na dinâmica profissional aproxima-se. Posiciona-te com integridade e clareza de intenção.',
  ],
}

function periodSeed(signName, period) {
  const now = new Date()
  let key
  if (period === 'dia')  key = `${signName}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  if (period === 'semana') {
    // ISO week number
    const d = new Date(now)
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
    const w = new Date(d.getFullYear(), 0, 4)
    const week = 1 + Math.round(((d - w) / 86400000 - 3 + ((w.getDay() + 6) % 7)) / 7)
    key = `${signName}-${now.getFullYear()}-w${week}`
  }
  if (period === 'mes')  key = `${signName}-${now.getFullYear()}-${now.getMonth()}`
  if (period === 'ano')  key = `${signName}-${now.getFullYear()}`
  return key ?? `${signName}-default`
}

export function getHoroscope(western, chinese, period = 'dia') {
  if (!western) return null
  const signKey = `${western.sign}-${chinese?.sign ?? ''}`
  const seed = periodSeed(signKey, period)

  // Energy level 1-5 (deterministic)
  const energy = (seedHash(seed + 'energy') % 5) + 1

  // Lucky number & colour
  const COLOURS = ['Verde', 'Azul', 'Dourado', 'Violeta', 'Branco', 'Vermelho', 'Turquesa', 'Laranja', 'Rosa', 'Cinzento', 'Índigo', 'Âmbar']
  const luckyColour = pick(COLOURS, seed + 'colour')
  const luckyNumber = (seedHash(seed + 'number') % 9) + 1

  return {
    period,
    energy,
    luckyColour,
    luckyNumber,
    geral:    pick(POOLS.geral,    seed, 0),
    amor:     pick(POOLS.amor,     seed, 1),
    saude:    pick(POOLS.saude,    seed, 2),
    trabalho: pick(POOLS.trabalho, seed, 3),
  }
}

// ─── Recommended daily nutrition ──────────────────────────────────────────────
export function getRecommendedNutrition(profile) {
  const age      = getAge(profile?.birthDate) ?? 30
  const sex      = profile?.sex ?? 'male'
  const heightCm = profile?.heightCm ?? 170
  const weight   = profile?.latestWeightKg ?? 70
  const bmr = sex === 'female'
    ? 10 * weight + 6.25 * heightCm - 5 * age - 161
    : 10 * weight + 6.25 * heightCm - 5 * age + 5
  const kcal = Math.round(bmr * 1.4)
  return {
    kcal,
    protein:    Math.round(weight * 0.8),
    carbs:      Math.round(kcal * 0.50 / 4),
    fat:        Math.round(kcal * 0.30 / 9),
    fiber:      sex === 'female' ? 25 : 38,
    calcium:    1000,
    iron:       sex === 'female' && age < 51 ? 18 : 8,
    magnesium:  sex === 'female' ? (age > 30 ? 320 : 310) : (age > 30 ? 420 : 400),
    zinc:       sex === 'female' ? 8 : 11,
    vitaminC:   sex === 'female' ? 75 : 90,
    vitaminD:   15,
    vitaminB12: 2.4,
    folate:     400,
    sodium:     2300,
    potassium:  sex === 'female' ? 2600 : 3400,
    phosphorus: 700,
    selenium:   55,
    omega3:     sex === 'female' ? 1.1 : 1.6,
  }
}
