import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Ruler, Calendar, Clock, Sparkles, Star, Heart, Briefcase, Activity, RefreshCw, Key, Eye, EyeOff } from 'lucide-react'
import { profileStore, weightStore, horoCache, buildHoroCacheKey } from '@/store'
import { getZodiac, getChineseZodiac, getAge, getCombinationInsight } from '@/utils/horoscope'
import { generateHoroscope, getApiKey, saveApiKey } from '@/utils/llm'
import { cn } from '@/utils/cn'

const EMPTY = { name: '', birthDate: '', birthTime: '', sex: 'male', heightCm: '' }

const PERIODS = [
  { key: 'dia',    label: 'Hoje'   },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mês'    },
  { key: 'ano',    label: 'Ano'    },
]

// ─── Energy dots ─────────────────────────────────────────────────────────────
function EnergyDots({ level }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={cn(
          'w-2 h-2 rounded-full',
          i <= level ? 'bg-brand-500' : 'bg-gray-200'
        )} />
      ))}
    </div>
  )
}

// ─── Horoscope area card ──────────────────────────────────────────────────────
function HoroCard({ icon: Icon, label, text, color }) {
  const colorMap = {
    pink:   'bg-pink-50 text-pink-600',
    green:  'bg-green-50 text-green-600',
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('rounded-xl p-1.5', colorMap[color])}>
          <Icon size={14} />
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  )
}

// ─── Combination card ─────────────────────────────────────────────────────────
function CombinationCard({ western, chinese, insight }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-5 shadow-md text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-yellow-300" />
        <p className="text-sm font-semibold text-white/90">Combinação astral</p>
      </div>

      {/* Signs row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
          <p className="text-3xl">{western.symbol}</p>
          <p className="text-xs text-white/80 mt-1">{western.sign}</p>
          <p className="text-[10px] text-white/60">{western.element} · {western.ruling}</p>
        </div>
        <div className="text-white/40 text-2xl font-thin">×</div>
        <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
          <p className="text-3xl">{chinese.emoji}</p>
          <p className="text-xs text-white/80 mt-1">{chinese.sign}</p>
          <p className="text-[10px] text-white/60">{insight.chineseEl}</p>
        </div>
      </div>

      {/* Element harmony */}
      <div className="bg-white/10 rounded-xl p-3 mb-3">
        <p className="text-xs text-white/70 font-medium mb-1">
          {insight.westernEl} × {insight.chineseEl}
        </p>
        <p className="text-sm text-white/90 leading-relaxed">{insight.elementText}</p>
      </div>

      {/* Combined description (expandable) */}
      <p className={cn('text-sm text-white/85 leading-relaxed', !expanded && 'line-clamp-3')}>
        {insight.combined}
      </p>
      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-2 text-xs text-yellow-300 font-medium"
      >
        {expanded ? 'Ver menos' : 'Ver mais'}
      </button>

      {/* Individual sign descs when expanded */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-1">{western.symbol} {western.sign}</p>
            <p className="text-sm text-white/85 leading-relaxed">{western.desc}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-1">{chinese.emoji} {chinese.sign}</p>
            <p className="text-sm text-white/85 leading-relaxed">{chinese.desc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── API Key modal ────────────────────────────────────────────────────────────
function ApiKeySetup({ onSaved }) {
  const [key, setKey]       = useState(getApiKey())
  const [show, setShow]     = useState(false)
  const [saved, setSaved]   = useState(false)

  function save() {
    if (!key.trim()) return
    saveApiKey(key)
    setSaved(true)
    setTimeout(() => { setSaved(false); onSaved() }, 800)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Key size={16} className="text-brand-500" />
        <p className="text-sm font-semibold text-gray-800">Chave Anthropic API</p>
      </div>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Para gerar horóscopos com Claude precisas da tua chave da Anthropic. Fica guardada localmente no dispositivo e nunca é enviada para nenhum servidor externo além do proxy da app.
      </p>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
        />
        <button onClick={() => setShow(s => !s)}
          className="absolute right-3 top-3.5 text-gray-300 hover:text-gray-500">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <button
        onClick={save}
        disabled={!key.trim()}
        className={cn(
          'mt-3 w-full rounded-xl py-3 text-sm font-semibold transition-all',
          saved ? 'bg-green-500 text-white' : 'bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white'
        )}
      >
        {saved ? '✓ Guardado' : 'Guardar chave'}
      </button>
    </div>
  )
}

// ─── Horoscope section ────────────────────────────────────────────────────────
function HoroscopeSection({ western, chinese, profile }) {
  const [period, setPeriod]   = useState('dia')
  const [horo, setHoro]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [hasKey, setHasKey]   = useState(!!getApiKey())

  const periodLabel = { dia: 'de hoje', semana: 'desta semana', mes: 'deste mês', ano: 'deste ano' }

  async function load(p, force = false) {
    const cacheKey = buildHoroCacheKey(western.sign, chinese.sign, p)
    if (!force) {
      const cached = horoCache.get(cacheKey)
      if (cached) { setHoro(cached); return }
    }
    setLoading(true)
    setError(null)
    setHoro(null)
    try {
      const result = await generateHoroscope({
        western, chinese, period: p,
        birthDate: profile?.birthDate,
        age: getAge(profile?.birthDate),
        sex: profile?.sex,
      })
      horoCache.set(cacheKey, result)
      setHoro(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (hasKey) load(period) }, [period, hasKey])

  if (!hasKey) {
    return <ApiKeySetup onSaved={() => setHasKey(true)} />
  }

  return (
    <div className="space-y-3">
      {/* Period tabs */}
      <div className="flex bg-white rounded-2xl shadow-sm p-1 gap-1">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
              period === p.key ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-gray-600'
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw size={24} className="animate-spin text-brand-400" />
          <p className="text-sm">A gerar horóscopo com Claude…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <div className="flex gap-2">
            <button onClick={() => load(period, true)}
              className="text-xs text-red-500 font-medium border border-red-200 rounded-lg px-3 py-1.5">
              Tentar novamente
            </button>
            <button onClick={() => { saveApiKey(''); setHasKey(false) }}
              className="text-xs text-gray-400 font-medium border border-gray-200 rounded-lg px-3 py-1.5">
              Alterar chave
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {horo && !loading && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Horóscopo {periodLabel[period]}
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {western.symbol} {western.sign} × {chinese.emoji} {chinese.sign}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <EnergyDots level={horo.energia ?? 3} />
                  <p className="text-xs text-gray-400 mt-1">energia</p>
                </div>
                <button onClick={() => load(period, true)} title="Regenerar"
                  className="text-gray-300 hover:text-brand-500 p-1 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            {horo.frase && (
              <p className="text-sm font-medium text-brand-700 italic mb-2 border-l-2 border-brand-300 pl-3">
                "{horo.frase}"
              </p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{horo.geral}</p>
            <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                <Star size={12} className="text-amber-400" />
                <span className="text-xs text-gray-500">Número: <strong className="text-gray-700">{horo.numero}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-brand-400 opacity-70" />
                <span className="text-xs text-gray-500">Cor: <strong className="text-gray-700">{horo.cor}</strong></span>
              </div>
            </div>
          </div>

          <HoroCard icon={Heart}     label="Amor & Relações"     text={horo.amor}     color="pink"  />
          <HoroCard icon={Activity}  label="Saúde & Energia"     text={horo.saude}    color="green" />
          <HoroCard icon={Briefcase} label="Trabalho & Carreira" text={horo.trabalho} color="blue"  />

          {/* Source note */}
          <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <strong className="text-gray-500">Fonte:</strong> Horóscopo gerado pelo modelo Claude (Anthropic) com base nos teus signos e na data actual. As descrições dos signos seguem as tradições da astrologia ocidental e do zodíaco chinês clássico. Deve ser lido como reflexão pessoal, não como previsão.
            </p>
            <button onClick={() => { saveApiKey(''); setHasKey(false) }}
              className="mt-1.5 text-[11px] text-gray-400 underline underline-offset-2">
              Alterar chave API
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="bg-gray-50 rounded-xl p-2 text-gray-400"><Icon size={16} /></div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const [profile, setProfile]     = useState(EMPTY)
  const [saved, setSaved]         = useState(false)
  const [lastWeight, setLastWeight] = useState(null)
  const [tab, setTab]             = useState('perfil') // 'perfil' | 'horoscopo'

  useEffect(() => {
    const p = profileStore.get()
    if (p) setProfile({ ...EMPTY, ...p })
    const w = weightStore.list()
    if (w.length > 0) setLastWeight(w[0])
  }, [])

  function save() {
    profileStore.save({ ...profile, heightCm: profile.heightCm ? parseFloat(profile.heightCm) : null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const zodiac  = getZodiac(profile.birthDate)
  const chinese = getChineseZodiac(profile.birthDate)
  const age     = getAge(profile.birthDate)
  const insight = getCombinationInsight(zodiac, chinese)

  const bmi = lastWeight && profile.heightCm
    ? (lastWeight.weightKg / Math.pow(parseFloat(profile.heightCm) / 100, 2)).toFixed(1)
    : null
  const bmiLabel = bmi
    ? bmi < 18.5 ? 'Abaixo do peso' : bmi < 25 ? 'Peso normal' : bmi < 30 ? 'Pré-obesidade' : 'Obesidade'
    : null

  const hasHoroscope = !!(zodiac && chinese)

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Perfil</h1>

      {/* Top tabs — only show horóscopo tab if signs are computed */}
      {hasHoroscope && (
        <div className="flex bg-white rounded-2xl shadow-sm p-1 gap-1 mb-5">
          {[['perfil','Dados & Saúde'],['horoscopo','Horóscopo']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                tab === k ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-gray-600'
              )}>{l}</button>
          ))}
        </div>
      )}

      {tab === 'perfil' && (
        <>
          {/* Avatar / summary card */}
          {profile.name && (
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 mb-4 text-white shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.name}</p>
                  {age && <p className="text-brand-200 text-sm">{age} anos</p>}
                </div>
              </div>
              {bmi && (
                <div className="mt-4 bg-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-brand-200 text-xs">IMC</p>
                    <p className="text-white font-bold text-lg">{bmi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-100 text-sm font-medium">{bmiLabel}</p>
                    <p className="text-brand-200 text-xs">{lastWeight?.weightKg} kg · {profile.heightCm} cm</p>
                  </div>
                </div>
              )}
              {(zodiac || chinese) && (
                <div className="mt-3 flex gap-2">
                  {zodiac && (
                    <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
                      <p className="text-2xl">{zodiac.symbol}</p>
                      <p className="text-brand-100 text-xs mt-0.5">{zodiac.sign}</p>
                    </div>
                  )}
                  {chinese && (
                    <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
                      <p className="text-2xl">{chinese.emoji}</p>
                      <p className="text-brand-100 text-xs mt-0.5">{chinese.sign}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Dados pessoais</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Nome</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="O teu nome"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Data de nascimento</label>
                  <input type="date" value={profile.birthDate}
                    onChange={e => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Hora de nascimento</label>
                  <input type="time" value={profile.birthTime}
                    onChange={e => setProfile(p => ({ ...p, birthTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Sexo</label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    {[['male','Masc.'],['female','Fem.']].map(([val, label]) => (
                      <button key={val} onClick={() => setProfile(p => ({ ...p, sex: val }))}
                        className={cn(
                          'flex-1 py-3 text-sm font-medium transition-colors',
                          profile.sex === val ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                        )}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Altura (cm)</label>
                  <input type="number" value={profile.heightCm}
                    onChange={e => setProfile(p => ({ ...p, heightCm: e.target.value }))}
                    placeholder="ex: 175" min="100" max="250"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
            </div>
            <button onClick={save}
              className={cn(
                'mt-5 w-full rounded-xl py-3.5 font-semibold transition-all',
                saved ? 'bg-green-500 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'
              )}>
              {saved ? '✓ Guardado' : 'Guardar perfil'}
            </button>
          </div>

          {/* Summary */}
          {profile.birthDate && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Resumo</p>
              <InfoRow icon={Calendar} label="Data de nascimento"
                value={format(new Date(profile.birthDate), "d 'de' MMMM 'de' yyyy", { locale: pt })} />
              <InfoRow icon={Clock}    label="Hora de nascimento" value={profile.birthTime || null} />
              <InfoRow icon={Ruler}    label="Altura" value={profile.heightCm ? `${profile.heightCm} cm` : null} />
              {zodiac && (
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="bg-gray-50 rounded-xl p-2 text-2xl leading-none">{zodiac.symbol}</div>
                  <div>
                    <p className="text-xs text-gray-400">Horóscopo ocidental</p>
                    <p className="text-sm font-semibold text-gray-800">{zodiac.sign} · {zodiac.element}</p>
                  </div>
                </div>
              )}
              {chinese && (
                <div className="flex items-center gap-3 py-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-2xl leading-none">{chinese.emoji}</div>
                  <div>
                    <p className="text-xs text-gray-400">Horóscopo chinês</p>
                    <p className="text-sm font-semibold text-gray-800">Ano do {chinese.sign}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'horoscopo' && hasHoroscope && (
        <div className="space-y-4">
          {/* Combination card */}
          {insight && <CombinationCard western={zodiac} chinese={chinese} insight={insight} />}
          {/* Period horoscope */}
          <HoroscopeSection western={zodiac} chinese={chinese} profile={profile} />
        </div>
      )}

      {tab === 'horoscopo' && !hasHoroscope && (
        <div className="text-center py-16 text-gray-300">
          <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Preenche a data de nascimento no perfil para ver o horóscopo.</p>
        </div>
      )}
    </div>
  )
}
