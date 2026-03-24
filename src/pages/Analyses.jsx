import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import {
  Plus, FileUp, ChevronDown, ChevronUp, Trash2, FlaskConical,
  ArrowLeftRight, X,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { labStore, genNewId } from '@/store'
import { extractTextFromPDF, parseLabText, markerStatus } from '@/utils/pdfParser'
import { cn } from '@/utils/cn'

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    high:    'bg-red-50 text-red-600',
    low:     'bg-amber-50 text-amber-700',
    normal:  'bg-green-50 text-green-700',
    unknown: 'bg-gray-100 text-gray-500',
  }
  const label = { high: 'Alto', low: 'Baixo', normal: 'Normal', unknown: '—' }
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', map[status])}>
      {label[status]}
    </span>
  )
}

// ─── Marker row ───────────────────────────────────────────────────────────────
function MarkerRow({ marker, compareValue }) {
  const status = markerStatus(marker)
  const diff = compareValue !== null && compareValue !== undefined
    ? (marker.value - compareValue).toFixed(2)
    : null

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{marker.name}</p>
        <p className="text-xs text-gray-400">
          Ref: {marker.refMin ?? '?'} – {marker.refMax ?? '?'} {marker.unit}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {marker.value} <span className="text-gray-400 font-normal text-xs">{marker.unit}</span>
        </p>
        {diff !== null && (
          <p className={cn(
            'text-xs font-medium',
            parseFloat(diff) > 0 && 'text-red-400',
            parseFloat(diff) < 0 && 'text-green-500',
            parseFloat(diff) === 0 && 'text-gray-400',
          )}>
            {parseFloat(diff) > 0 ? '+' : ''}{diff}
          </p>
        )}
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

// ─── Lab Result Card ──────────────────────────────────────────────────────────
function LabCard({ result, onDelete, compareResult }) {
  const [expanded, setExpanded] = useState(false)
  const compareMap = compareResult
    ? Object.fromEntries(compareResult.markers.map(m => [m.name, m.value]))
    : {}

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{result.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(result.date), "d 'de' MMMM yyyy", { locale: pt })}
            {' · '}{result.markers.length} marcadores
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {['high','low','normal'].map(s => {
            const count = result.markers.filter(m => markerStatus(m) === s).length
            if (!count) return null
            return (
              <span key={s} className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                s === 'high'   && 'bg-red-50 text-red-500',
                s === 'low'    && 'bg-amber-50 text-amber-600',
                s === 'normal' && 'bg-green-50 text-green-600',
              )}>{count}</span>
            )
          })}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="mt-2">
            {result.markers.map((m, i) => (
              <MarkerRow key={i} marker={m} compareValue={compareMap[m.name] ?? null} />
            ))}
          </div>
          <button
            onClick={() => onDelete(result.id)}
            className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600"
          >
            <Trash2 size={13} /> Eliminar análise
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Evolution Chart Modal ────────────────────────────────────────────────────
function ChartModal({ markerName, results, onClose }) {
  const data = results
    .filter(r => r.markers.find(m => m.name === markerName))
    .map(r => {
      const m = r.markers.find(x => x.name === markerName)
      return { date: r.date, value: m.value, refMin: m.refMin, refMax: m.refMax, unit: m.unit }
    })
    .reverse()

  const refMin = data[0]?.refMin
  const refMax = data[0]?.refMax

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{markerName}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {data[0]?.unit} · Ref: {refMin ?? '?'} – {refMax ?? '?'}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={d => format(new Date(d), 'dd/MM', { locale: pt })}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={d => format(new Date(d), "d MMM yyyy", { locale: pt })}
              formatter={v => [`${v} ${data[0]?.unit ?? ''}`, markerName]}
            />
            {refMin !== null && (
              <ReferenceLine y={refMin} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: `Mín ${refMin}`, fontSize: 10, fill: '#f59e0b', position: 'insideTopLeft' }} />
            )}
            {refMax !== null && (
              <ReferenceLine y={refMax} stroke="#ef4444" strokeDasharray="4 4"
                label={{ value: `Máx ${refMax}`, fontSize: 10, fill: '#ef4444', position: 'insideBottomLeft' }} />
            )}
            <Line
              type="monotone" dataKey="value"
              stroke="#22c55e" strokeWidth={2.5}
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Data table */}
        <div className="mt-4 space-y-1">
          {[...data].reverse().map((d, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
              <span className="text-gray-500">{format(new Date(d.date), "d MMM yyyy", { locale: pt })}</span>
              <span className={cn(
                'font-semibold',
                d.refMax && d.value > d.refMax ? 'text-red-500'
                  : d.refMin && d.value < d.refMin ? 'text-amber-500'
                  : 'text-green-600'
              )}>
                {d.value} {d.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add Result Modal ─────────────────────────────────────────────────────────
function AddResultModal({ onClose, onSaved }) {
  const [step, setStep]       = useState('form') // 'form' | 'markers'
  const [title, setTitle]     = useState('')
  const [date, setDate]       = useState(format(new Date(), 'yyyy-MM-dd'))
  const [markers, setMarkers] = useState([{ name: '', value: '', unit: '', refMin: '', refMax: '' }])
  const [parsing, setParsing] = useState(false)
  const fileRef               = useRef()

  async function handlePDF(e) {
    const file = e.target.files[0]
    if (!file) return
    setParsing(true)
    try {
      const text = await extractTextFromPDF(file)
      const parsed = parseLabText(text)
      if (parsed.length > 0) {
        setMarkers(parsed.map(m => ({
          name:   m.name,
          value:  String(m.value),
          unit:   m.unit,
          refMin: m.refMin !== null ? String(m.refMin) : '',
          refMax: m.refMax !== null ? String(m.refMax) : '',
        })))
        if (!title) setTitle(file.name.replace(/\.pdf$/i, ''))
        setStep('markers')
      } else {
        alert('Não foi possível extrair marcadores do PDF. Insere manualmente.')
      }
    } catch (err) {
      alert('Erro ao ler o PDF: ' + err.message)
    } finally {
      setParsing(false)
    }
  }

  function addMarker() {
    setMarkers(m => [...m, { name: '', value: '', unit: '', refMin: '', refMax: '' }])
  }

  function updateMarker(i, field, val) {
    setMarkers(ms => ms.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }

  function removeMarker(i) {
    setMarkers(ms => ms.filter((_, idx) => idx !== i))
  }

  async function save() {
    const clean = markers
      .filter(m => m.name && m.value)
      .map(m => ({
        name:   m.name,
        value:  parseFloat(m.value),
        unit:   m.unit,
        refMin: m.refMin !== '' ? parseFloat(m.refMin) : null,
        refMax: m.refMax !== '' ? parseFloat(m.refMax) : null,
      }))
    if (!title || !date || clean.length === 0) return
    await labStore.save({ id: genNewId(), title, date, source: 'manual', markers: clean })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Nova análise</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4">
          {/* Basic info */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Título</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="ex: Hemograma Março 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* PDF import */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={parsing}
            className="w-full border-2 border-dashed border-brand-200 hover:border-brand-400 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-brand-600 font-medium transition-colors"
          >
            <FileUp size={16} />
            {parsing ? 'A ler PDF...' : 'Importar PDF de análises'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePDF} />

          {/* Markers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Marcadores</label>
              <button onClick={addMarker} className="text-xs text-brand-600 font-medium flex items-center gap-1">
                <Plus size={13} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {markers.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={m.name} onChange={e => updateMarker(i, 'name', e.target.value)}
                      placeholder="Nome (ex: Hemoglobina)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                    />
                    <button onClick={() => removeMarker(i)} className="text-gray-300 hover:text-red-400">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={m.value} onChange={e => updateMarker(i, 'value', e.target.value)}
                      type="number" placeholder="Valor"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                    />
                    <input
                      value={m.unit} onChange={e => updateMarker(i, 'unit', e.target.value)}
                      placeholder="Unidade"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                    />
                    <div className="flex gap-1">
                      <input
                        value={m.refMin} onChange={e => updateMarker(i, 'refMin', e.target.value)}
                        type="number" placeholder="Mín"
                        className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                      <input
                        value={m.refMax} onChange={e => updateMarker(i, 'refMax', e.target.value)}
                        type="number" placeholder="Máx"
                        className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className="mt-5 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-semibold transition-colors shrink-0"
        >
          Guardar análise
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Analyses() {
  const [results, setResults]       = useState([])
  const [showAdd, setShowAdd]       = useState(false)
  const [chartMarker, setChartMarker] = useState(null)
  const [compareA, setCompareA]     = useState('')
  const [compareB, setCompareB]     = useState('')
  const [showCompare, setShowCompare] = useState(false)

  async function reload() { setResults(await labStore.list()) }
  useEffect(() => { reload() }, [])

  const resultA = results.find(r => r.id === compareA)
  const resultB = results.find(r => r.id === compareB)

  // Collect all unique marker names across all results
  const allMarkers = [...new Set(results.flatMap(r => r.markers.map(m => m.name)))]

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Análises</h1>
        <div className="flex gap-2">
          {results.length >= 2 && (
            <button
              onClick={() => setShowCompare(s => !s)}
              className={cn(
                'p-2 rounded-xl transition-colors',
                showCompare ? 'bg-brand-100 text-brand-600' : 'bg-white text-gray-500 shadow-sm'
              )}
            >
              <ArrowLeftRight size={18} />
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="bg-brand-500 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-sm font-medium shadow-sm"
          >
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      {/* Compare selector */}
      {showCompare && results.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-xs text-gray-400 font-medium mb-3">Comparar duas análises</p>
          <div className="flex gap-2 items-center">
            <select
              value={compareA} onChange={e => setCompareA(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Análise A</option>
              {results.map(r => <option key={r.id} value={r.id}>{r.title} ({format(new Date(r.date),'dd/MM/yy')})</option>)}
            </select>
            <ArrowLeftRight size={14} className="text-gray-300 shrink-0" />
            <select
              value={compareB} onChange={e => setCompareB(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Análise B</option>
              {results.map(r => <option key={r.id} value={r.id}>{r.title} ({format(new Date(r.date),'dd/MM/yy')})</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Evolution charts shortcut */}
      {allMarkers.length > 0 && results.length >= 2 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium mb-2">Evolução por marcador</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {allMarkers.slice(0, 12).map(name => (
              <button
                key={name}
                onClick={() => setChartMarker(name)}
                className="shrink-0 bg-white rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm border border-gray-100 whitespace-nowrap"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results list */}
      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <FlaskConical size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ainda não tens análises registadas.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 bg-brand-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            Adicionar primeira análise
          </button>
        </div>
      ) : (
        results.map(r => (
          <LabCard
            key={r.id}
            result={r}
            onDelete={async id => { await labStore.delete(id); await reload() }}
            compareResult={
              showCompare && compareA && compareB
                ? (r.id === compareA ? resultB : r.id === compareB ? resultA : null)
                : null
            }
          />
        ))
      )}

      {showAdd && (
        <AddResultModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { reload(); setShowAdd(false) }}
        />
      )}
      {chartMarker && (
        <ChartModal
          markerName={chartMarker}
          results={results}
          onClose={() => setChartMarker(null)}
        />
      )}
    </div>
  )
}
