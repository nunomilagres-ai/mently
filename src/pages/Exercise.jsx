import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Dumbbell, Footprints, Plus, Trash2, X, Flame } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { exerciseStore, genNewId } from '@/store'
import { cn } from '@/utils/cn'

const TYPES = [
  'Corrida', 'Caminhada', 'Ciclismo', 'Natação', 'Ginásio',
  'HIIT', 'Yoga', 'Futebol', 'Basquetebol', 'Ténis', 'Outro',
]
const INTENSITY = ['Leve', 'Moderada', 'Intensa']

function ExerciseModal({ entry, onClose, onSaved }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate]         = useState(entry?.date ?? today)
  const [steps, setSteps]       = useState(entry?.steps ?? '')
  const [sessions, setSessions] = useState(
    entry?.sessions ?? [{ type: 'Caminhada', durationMin: '', intensity: 'Moderada', kcalBurned: '' }]
  )

  function addSession() {
    setSessions(s => [...s, { type: 'Caminhada', durationMin: '', intensity: 'Moderada', kcalBurned: '' }])
  }
  function removeSession(i) { setSessions(s => s.filter((_, idx) => idx !== i)) }
  function updateSession(i, key, val) {
    setSessions(s => s.map((sess, idx) => idx === i ? { ...sess, [key]: val } : sess))
  }

  function save() {
    exerciseStore.save({
      id: entry?.id ?? genNewId(),
      date,
      steps: steps ? parseInt(steps) : 0,
      sessions: sessions
        .filter(s => s.durationMin)
        .map(s => ({ ...s, durationMin: parseInt(s.durationMin), kcalBurned: parseInt(s.kcalBurned) || 0 })),
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 pb-8 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Registar exercício</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Passos</label>
            <div className="relative">
              <Footprints size={16} className="absolute left-3 top-3.5 text-gray-300" />
              <input type="number" value={steps} onChange={e => setSteps(e.target.value)}
                placeholder="ex: 8500"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Sessões de treino</label>
              <button onClick={addSession} className="text-xs text-brand-600 font-medium flex items-center gap-1">
                <Plus size={13} /> Adicionar
              </button>
            </div>
            {sessions.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex gap-2">
                  <select value={s.type} onChange={e => updateSession(i, 'type', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button onClick={() => removeSession(i)} className="text-gray-300 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Duração (min)</label>
                    <input type="number" value={s.durationMin}
                      onChange={e => updateSession(i, 'durationMin', e.target.value)}
                      placeholder="30"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Intensidade</label>
                    <select value={s.intensity} onChange={e => updateSession(i, 'intensity', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none">
                      {INTENSITY.map(x => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Cal. queimadas</label>
                    <input type="number" value={s.kcalBurned}
                      onChange={e => updateSession(i, 'kcalBurned', e.target.value)}
                      placeholder="250"
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={save}
          className="mt-5 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-semibold shrink-0">
          Guardar
        </button>
      </div>
    </div>
  )
}

const INTENSITY_COLOR = { Leve: 'bg-green-100 text-green-700', Moderada: 'bg-amber-100 text-amber-700', Intensa: 'bg-red-100 text-red-600' }

export default function Exercise() {
  const [entries, setEntries] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  function reload() { setEntries(exerciseStore.list()) }
  useEffect(reload, [])

  const stepsData = [...entries].reverse().slice(-14).map(e => ({
    date: e.date, passos: e.steps ?? 0,
  }))

  const totalKcal7 = entries.slice(0, 7)
    .reduce((s, e) => s + (e.sessions?.reduce((ss, se) => ss + (se.kcalBurned || 0), 0) ?? 0), 0)

  const avgSteps7 = entries.slice(0, 7).length > 0
    ? Math.round(entries.slice(0, 7).reduce((s, e) => s + (e.steps || 0), 0) / Math.min(entries.length, 7))
    : null

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Exercício</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-medium shadow-sm"
        >
          <Plus size={16} /> Registar
        </button>
      </div>

      {/* Summary cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 rounded-2xl p-4">
            <Footprints size={20} className="text-orange-400 mb-1" />
            <p className="text-2xl font-bold text-orange-700">{avgSteps7?.toLocaleString('pt') ?? '—'}</p>
            <p className="text-xs text-orange-400">média passos / dia</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <Flame size={20} className="text-red-400 mb-1" />
            <p className="text-2xl font-bold text-red-600">{totalKcal7.toLocaleString('pt')}</p>
            <p className="text-xs text-red-400">kcal queimadas (7d)</p>
          </div>
        </div>
      )}

      {/* Steps chart */}
      {stepsData.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Passos — últimas 2 semanas</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stepsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(new Date(d), 'dd/MM')} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={v => [v.toLocaleString('pt'), 'Passos']}
                labelFormatter={d => format(new Date(d), "d MMM", { locale: pt })}
              />
              <Bar dataKey="passos" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Dumbbell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ainda sem registos de exercício.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <button
              key={e.id}
              onClick={() => { setEditing(e); setShowAdd(true) }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {format(new Date(e.date), "EEEE, d MMM", { locale: pt })}
                </p>
                <div className="flex items-center gap-2">
                  {e.steps > 0 && (
                    <span className="text-xs text-orange-500 flex items-center gap-0.5">
                      <Footprints size={12} /> {e.steps.toLocaleString('pt')}
                    </span>
                  )}
                  <button
                    onClick={ev => { ev.stopPropagation(); exerciseStore.delete(e.id); reload() }}
                    className="text-gray-200 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {e.sessions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {e.sessions.map((s, i) => (
                    <span key={i} className={cn('text-xs px-2 py-0.5 rounded-full font-medium', INTENSITY_COLOR[s.intensity] ?? 'bg-gray-100 text-gray-600')}>
                      {s.type} {s.durationMin}min
                      {s.kcalBurned > 0 && ` · ${s.kcalBurned}kcal`}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <ExerciseModal
          entry={editing}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSaved={() => { reload(); setShowAdd(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
