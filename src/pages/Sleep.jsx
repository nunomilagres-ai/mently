import { useState, useEffect } from 'react'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Moon, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { sleepStore, genNewId } from '@/store'
import { cn } from '@/utils/cn'

function calcHours(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null
  // Parse as today's date for simple diff
  const base = new Date()
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const bed  = new Date(base.getFullYear(), base.getMonth(), base.getDate(), bh, bm)
  let wake = new Date(base.getFullYear(), base.getMonth(), base.getDate(), wh, wm)
  if (wake <= bed) wake.setDate(wake.getDate() + 1) // next day
  return parseFloat((differenceInMinutes(wake, bed) / 60).toFixed(2))
}

function SleepModal({ entry, onClose, onSaved }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate]         = useState(entry?.date ?? today)
  const [bedtime, setBedtime]   = useState(entry?.bedtime ?? '23:00')
  const [wakeTime, setWakeTime] = useState(entry?.wakeTime ?? '07:00')
  const [notes, setNotes]       = useState(entry?.notes ?? '')

  const hours = calcHours(bedtime, wakeTime)

  async function save() {
    if (!date || !bedtime || !wakeTime) return
    await sleepStore.save({ id: entry?.id ?? genNewId(), date, bedtime, wakeTime, hoursSlept: hours, notes })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Registar sono</h2>
          <button onClick={onClose} className="text-gray-400"><Moon size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Deitar</label>
              <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Acordar</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          {hours !== null && (
            <div className={cn(
              'rounded-xl p-3 text-center',
              hours >= 7 ? 'bg-green-50 text-green-700' : hours >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
            )}>
              <p className="text-2xl font-bold">{hours}h</p>
              <p className="text-xs">{hours >= 7 ? 'Bom descanso ✓' : hours >= 6 ? 'Sono curto' : 'Sono insuficiente'}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notas (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="ex: acordei a meio da noite..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
        </div>
        <button onClick={save} disabled={!date || !bedtime || !wakeTime}
          className="mt-6 w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3.5 font-semibold">
          Guardar
        </button>
      </div>
    </div>
  )
}

export default function Sleep() {
  const [entries, setEntries] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  async function reload() { setEntries(await sleepStore.list()) }
  useEffect(() => { reload() }, [])

  const chartData = [...entries].reverse().slice(-14).map(e => ({
    date: e.date,
    horas: e.hoursSlept,
  }))

  const avg = entries.length > 0
    ? (entries.slice(0, 7).reduce((s, e) => s + e.hoursSlept, 0) / Math.min(entries.length, 7)).toFixed(1)
    : null

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Sono</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-medium shadow-sm"
        >
          <Plus size={16} /> Registar
        </button>
      </div>

      {/* Avg card */}
      {avg && (
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 mb-4 text-white shadow-md">
          <p className="text-purple-200 text-sm mb-1">Média (últimos 7 dias)</p>
          <p className="text-4xl font-bold">{avg}<span className="text-purple-300 text-lg font-normal ml-1">h</span></p>
          <p className="text-purple-200 text-xs mt-1">Recomendado: 7–9 horas</p>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Últimas 2 semanas</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(new Date(d), 'dd/MM')} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={v => [`${v}h`, 'Sono']}
                labelFormatter={d => format(new Date(d), "d MMM", { locale: pt })}
              />
              <ReferenceLine y={7} stroke="#a855f7" strokeDasharray="4 4"
                label={{ value: 'min 7h', fontSize: 9, fill: '#a855f7' }} />
              <Bar dataKey="horas" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Moon size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ainda sem registos de sono.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <button
              key={e.id}
              onClick={() => { setEditing(e); setShowAdd(true) }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left"
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                e.hoursSlept >= 7 ? 'bg-green-50 text-green-600' : e.hoursSlept >= 6 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
              )}>
                <Moon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {e.hoursSlept}h · {e.bedtime} → {e.wakeTime}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {format(new Date(e.date), "EEEE, d MMM", { locale: pt })}
                </p>
                {e.notes && <p className="text-xs text-gray-400 truncate italic mt-0.5">{e.notes}</p>}
              </div>
              <button
                onClick={async ev => { ev.stopPropagation(); await sleepStore.delete(e.id); await reload() }}
                className="text-gray-200 hover:text-red-400 p-1"
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <SleepModal
          entry={editing}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSaved={() => { reload(); setShowAdd(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
