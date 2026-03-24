import { useState } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { weightStore, genNewId } from '@/store'

export default function WeightModal({ entry, onClose, onSaved }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate]         = useState(entry?.date ?? today)
  const [weight, setWeight]     = useState(entry?.weightKg ?? '')

  function save() {
    if (!weight || !date) return
    weightStore.save({ id: entry?.id ?? genNewId(), date, weightKg: parseFloat(weight) })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Registar peso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="ex: 72.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={!weight || !date}
          className="mt-6 w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3.5 font-semibold transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
