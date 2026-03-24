import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import {
  Scale, Moon, Footprints, FlaskConical,
  TrendingUp, TrendingDown, Minus, ChevronRight, Plus,
} from 'lucide-react'
import { weightStore, sleepStore, exerciseStore, labStore, profileStore } from '@/store'
import { cn } from '@/utils/cn'
import WeightModal from '@/components/weight/WeightModal'

function StatCard({ icon: Icon, label, value, unit, sub, color = 'brand', to }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    blue:  'bg-blue-50 text-blue-600',
    purple:'bg-purple-50 text-purple-600',
    orange:'bg-orange-50 text-orange-600',
    red:   'bg-red-50 text-red-600',
  }
  const inner = (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className={cn('rounded-xl p-2.5', colorMap[color])}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {value ?? <span className="text-gray-300">—</span>}
          {value && unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {to && <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function WeightTrend({ weights }) {
  if (weights.length < 2) return null
  const diff = weights[0].weightKg - weights[1].weightKg
  const abs = Math.abs(diff).toFixed(1)
  if (diff < -0.05) return <span className="text-green-500 text-xs flex items-center gap-0.5"><TrendingDown size={12} />−{abs} kg</span>
  if (diff > 0.05)  return <span className="text-red-400 text-xs flex items-center gap-0.5"><TrendingUp size={12} />+{abs} kg</span>
  return <span className="text-gray-400 text-xs flex items-center gap-0.5"><Minus size={12} />estável</span>
}

export default function Dashboard() {
  const [weights,   setWeights]   = useState([])
  const [sleep,     setSleep]     = useState(null)
  const [exercise,  setExercise]  = useState(null)
  const [labs,      setLabs]      = useState([])
  const [profile,   setProfile]   = useState(null)
  const [showWeight, setShowWeight] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')

  function reload() {
    setWeights(weightStore.list().slice(0, 7))
    setSleep(sleepStore.byDate(today))
    setExercise(exerciseStore.byDate(today))
    setLabs(labStore.list().slice(0, 1))
    setProfile(profileStore.get())
  }

  useEffect(() => { reload() }, [])

  const lastWeight  = weights[0]
  const lastLab     = labs[0]
  const todaySleep  = sleep
  const todayEx     = exercise

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 19) return 'Boa tarde'
    return 'Boa noite'
  }

  const dateLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt })

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 capitalize">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
        </h1>
      </div>

      {/* Weight card — prominent */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 mb-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-brand-100 text-sm font-medium flex items-center gap-1.5">
            <Scale size={15} /> Peso corporal
          </span>
          <button
            onClick={() => setShowWeight(true)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-4xl font-bold">
            {lastWeight ? lastWeight.weightKg : '—'}
          </span>
          {lastWeight && <span className="text-brand-200 mb-1">kg</span>}
          {lastWeight && (
            <div className="mb-1 text-brand-100">
              <WeightTrend weights={weights} />
            </div>
          )}
        </div>
        {lastWeight && (
          <p className="text-brand-200 text-xs mt-1">
            {format(new Date(lastWeight.date), "d MMM yyyy", { locale: pt })}
          </p>
        )}
        {!lastWeight && (
          <p className="text-brand-200 text-sm mt-1">Regista o teu primeiro peso</p>
        )}
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={Moon}
          label="Sono hoje"
          value={todaySleep ? todaySleep.hoursSlept : null}
          unit={todaySleep ? 'h' : null}
          sub={todaySleep ? `${todaySleep.bedtime} → ${todaySleep.wakeTime}` : 'Sem registo'}
          color="purple"
          to="/sleep"
        />
        <StatCard
          icon={Footprints}
          label="Passos hoje"
          value={todayEx?.steps?.toLocaleString('pt') ?? null}
          sub={todayEx ? null : 'Sem registo'}
          color="orange"
          to="/exercise"
        />
      </div>

      {/* Last lab */}
      {lastLab ? (
        <Link to="/analyses" className="block bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5">
                <FlaskConical size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Última análise</p>
                <p className="text-sm font-semibold text-gray-800">{lastLab.title}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {lastLab.markers.slice(0, 4).map((m) => {
              const status = m.refMin !== null || m.refMax !== null
                ? (m.value < (m.refMin ?? -Infinity) ? 'low' : m.value > (m.refMax ?? Infinity) ? 'high' : 'ok')
                : 'unknown'
              return (
                <span
                  key={m.name}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    status === 'ok'      && 'bg-green-50 text-green-700',
                    status === 'high'    && 'bg-red-50 text-red-600',
                    status === 'low'     && 'bg-amber-50 text-amber-600',
                    status === 'unknown' && 'bg-gray-100 text-gray-500',
                  )}
                >
                  {m.name} {m.value} {m.unit}
                </span>
              )
            })}
            {lastLab.markers.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                +{lastLab.markers.length - 4}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <Link to="/analyses" className="block bg-white rounded-2xl p-4 shadow-sm mb-4 border-2 border-dashed border-gray-100">
          <div className="flex items-center gap-3 text-gray-400">
            <FlaskConical size={20} />
            <span className="text-sm">Adicionar análises</span>
            <ChevronRight size={16} className="ml-auto" />
          </div>
        </Link>
      )}

      {/* Weight modal */}
      {showWeight && (
        <WeightModal
          onClose={() => setShowWeight(false)}
          onSaved={() => { reload(); setShowWeight(false) }}
        />
      )}
    </div>
  )
}
