import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { User, Ruler, Calendar, Clock, Sparkles, Star, Heart, Briefcase, Activity, Zap } from 'lucide-react'
import { profileStore, weightStore } from '@/store'
import { getZodiac, getChineseZodiac, getAge, getCombinationInsight, getHoroscope } from '@/utils/horoscope'
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

// ─── Horoscope section ────────────────────────────────────────────────────────
function HoroscopeSection({ western, chinese }) {
  const [period, setPeriod] = useState('dia')
  const horo = getHoroscope(western, chinese, period)

  if (!horo) return null

  const periodLabel = { dia: 'de hoje', semana: 'desta semana', mes: 'deste mês', ano: 'deste ano' }

  return (
    <div className="space-y-3">
      {/* Period tabs */}
      <div className="flex bg-white rounded-2xl shadow-sm p-1 gap-1">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
              period === p.key
                ? 'bg-brand-500 text-white'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Horóscopo {periodLabel[period]}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {western.symbol} {western.sign} × {chinese.emoji} {chinese.sign}
            </p>
          </div>
          <div className="text-right">
            <EnergyDots level={horo.energy} />
            <p className="text-xs text-gray-400 mt-1">energia</p>
          </div>
        </div>
        {/* General */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{horo.geral}</p>
        <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-400" />
            <span className="text-xs text-gray-500">Número: <strong className="text-gray-700">{horo.luckyNumber}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-brand-400 opacity-70" />
            <span className="text-xs text-gray-500">Cor: <strong className="text-gray-700">{horo.luckyColour}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 area cards */}
      <HoroCard icon={Heart}     label="Amor & Relações"  text={horo.amor}     color="pink"   />
      <HoroCard icon={Activity}  label="Saúde & Energia"  text={horo.saude}    color="green"  />
      <HoroCard icon={Briefcase} label="Trabalho & Carreira" text={horo.trabalho} color="blue" />
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
          <HoroscopeSection western={zodiac} chinese={chinese} />
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
