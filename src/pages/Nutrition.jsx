import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Plus, ChevronLeft, ChevronRight, X, Trash2, UtensilsCrossed, Camera } from 'lucide-react'
import { nutritionStore, profileStore, genNewId } from '@/store'
import { getRecommendedNutrition } from '@/utils/horoscope'
import { cn } from '@/utils/cn'
import FoodPhotoRecognition from '@/components/nutrition/FoodPhotoRecognition'

// ─── Progress bar ─────────────────────────────────────────────────────────────
function NutrBar({ label, value, target, unit, color = 'brand' }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 120) : 0
  const over = pct > 100
  const colorMap = {
    brand:  ['bg-brand-500',  'text-brand-700'],
    blue:   ['bg-blue-400',   'text-blue-700'],
    amber:  ['bg-amber-400',  'text-amber-700'],
    purple: ['bg-purple-400', 'text-purple-700'],
    red:    ['bg-red-400',    'text-red-700'],
  }
  const [bar, txt] = colorMap[color]

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={cn('text-xs font-semibold', over ? 'text-red-500' : txt)}>
          {value.toFixed(1)}<span className="text-gray-400 font-normal">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', over ? 'bg-red-400' : bar)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Micro badge ──────────────────────────────────────────────────────────────
function MicroBadge({ label, value, target, unit }) {
  const pct = target > 0 ? (value / target) * 100 : 0
  const ok = pct >= 80
  return (
    <div className={cn(
      'rounded-xl p-2.5 text-center',
      ok ? 'bg-green-50' : 'bg-amber-50'
    )}>
      <p className="text-xs text-gray-500 truncate">{label}</p>
      <p className={cn('text-sm font-bold mt-0.5', ok ? 'text-green-700' : 'text-amber-600')}>
        {value.toFixed(1)}
      </p>
      <p className="text-[10px] text-gray-400">/{target}{unit}</p>
    </div>
  )
}

// ─── Add food modal ───────────────────────────────────────────────────────────
const EMPTY_FOOD = {
  name: '', amount: '', unit: 'g',
  kcal: '', protein: '', carbs: '', fat: '', fiber: '',
  calcium: '', iron: '', magnesium: '', zinc: '',
  vitaminC: '', vitaminD: '', vitaminB12: '', folate: '',
  sodium: '', potassium: '', omega3: '',
}

function AddFoodModal({ mealName, onAdd, onClose }) {
  const [food, setFood] = useState(EMPTY_FOOD)
  const [showPhotoRecognition, setShowPhotoRecognition] = useState(false)
  const f = (k, v) => setFood(p => ({ ...p, [k]: v }))

  // Callback quando alimentos são detectados pela IA
  function handleFoodDetected(foods) {
    setShowPhotoRecognition(false)
    
    // Se apenas um alimento foi detectado, preencher o formulário
    if (foods.length === 1) {
      setFood(foods[0])
    }
    // Se múltiplos alimentos, adicionar todos automaticamente
    else if (foods.length > 1) {
      foods.forEach(detectedFood => onAdd(detectedFood))
      onClose()
    }
  }

  const field = (label, key, placeholder = '', type = 'number') => (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-0.5">{label}</label>
      <input
        type={type} value={food[key]}
        onChange={e => f(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
    </div>
  )

  function submit() {
    if (!food.name || !food.kcal) return
    onAdd({
      ...Object.fromEntries(
        Object.entries(food).map(([k, v]) => [k, typeof v === 'string' && k !== 'name' && k !== 'unit' ? parseFloat(v) || 0 : v])
      )
    })
  }

  return (
    <>
      {showPhotoRecognition && (
        <FoodPhotoRecognition
          onFoodDetected={handleFoodDetected}
          onClose={() => setShowPhotoRecognition(false)}
        />
      )}
      
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
        <div className="bg-white w-full rounded-t-3xl p-5 pb-8 max-h-[92vh] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-bold text-gray-900">Adicionar alimento — {mealName}</h3>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
          </div>

          {/* Botão de reconhecimento por foto */}
          <button
            onClick={() => setShowPhotoRecognition(true)}
            className="w-full bg-brand-50 border-2 border-brand-200 rounded-xl p-3 mb-4 flex items-center justify-center gap-2 text-brand-600 hover:bg-brand-100 transition-colors"
          >
            <Camera size={18} />
            <span className="font-semibold text-sm">Reconhecer com Foto</span>
          </button>
        <div className="overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {field('Nome', 'name', 'ex: Arroz cozido', 'text')}
            <div className="flex gap-2">
              <div className="flex-1">{field('Qtd', 'amount', '100')}</div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-0.5">Un.</label>
                <select
                  value={food.unit} onChange={e => f('unit', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none"
                >
                  {['g','ml','unid','colher','chávena'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Macros</p>
          <div className="grid grid-cols-2 gap-3">
            {field('Calorias (kcal)', 'kcal', '130')}
            {field('Proteína (g)', 'protein', '3')}
            {field('Hidratos (g)', 'carbs', '28')}
            {field('Gordura (g)', 'fat', '0.3')}
            {field('Fibra (g)', 'fiber', '0.4')}
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Micros (opcional)</p>
          <div className="grid grid-cols-2 gap-3">
            {field('Cálcio (mg)', 'calcium')}
            {field('Ferro (mg)', 'iron')}
            {field('Magnésio (mg)', 'magnesium')}
            {field('Zinco (mg)', 'zinc')}
            {field('Vit. C (mg)', 'vitaminC')}
            {field('Vit. D (mcg)', 'vitaminD')}
            {field('Vit. B12 (mcg)', 'vitaminB12')}
            {field('Folato (mcg)', 'folate')}
            {field('Sódio (mg)', 'sodium')}
            {field('Potássio (mg)', 'potassium')}
            {field('Ómega-3 (g)', 'omega3')}
          </div>
        </div>
        <button
          onClick={submit}
          disabled={!food.name || !food.kcal}
          className="mt-5 w-full bg-brand-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3.5 font-semibold shrink-0"
        >
          Adicionar
        </button>
        </div>
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const NUTRIENT_KEYS = ['kcal','protein','carbs','fat','fiber','calcium','iron','magnesium','zinc','vitaminC','vitaminD','vitaminB12','folate','sodium','potassium','omega3']

function sumNutrients(meals) {
  const totals = Object.fromEntries(NUTRIENT_KEYS.map(k => [k, 0]))
  for (const meal of meals) {
    for (const food of meal.foods) {
      for (const k of NUTRIENT_KEYS) { totals[k] += food[k] ?? 0 }
    }
  }
  return totals
}

const DEFAULT_MEALS = ['Pequeno-almoço', 'Almoço', 'Lanche', 'Jantar', 'Ceia']

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Nutrition() {
  const [date, setDate]       = useState(format(new Date(), 'yyyy-MM-dd'))
  const [entry, setEntry]     = useState(null)
  const [addMeal, setAddMeal] = useState(null) // meal name string
  const [profile, setProfile] = useState(null)
  const rec                   = getRecommendedNutrition(profile)

  async function load(d) {
    const [e, p] = await Promise.all([nutritionStore.byDate(d), profileStore.get()])
    setProfile(p)
    setEntry(e ?? {
      id: genNewId(), date: d,
      meals: DEFAULT_MEALS.map(name => ({ name, foods: [] }))
    })
  }

  useEffect(() => { load(date) }, [date])

  function addFood(mealName, food) {
    setEntry(prev => {
      const meals = prev.meals.map(m =>
        m.name === mealName ? { ...m, foods: [...m.foods, food] } : m
      )
      const updated = { ...prev, meals }
      nutritionStore.save(updated)
      return updated
    })
    setAddMeal(null)
  }

  function removeFood(mealName, fi) {
    setEntry(prev => {
      const meals = prev.meals.map(m =>
        m.name === mealName ? { ...m, foods: m.foods.filter((_, i) => i !== fi) } : m
      )
      const updated = { ...prev, meals }
      nutritionStore.save(updated)
      return updated
    })
  }

  const totals = entry ? sumNutrients(entry.meals) : null

  function changeDate(delta) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(format(d, 'yyyy-MM-dd'))
  }

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header + date nav */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Nutrição</h1>
        <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm px-1">
          <button onClick={() => changeDate(-1)} className="p-2 text-gray-400"><ChevronLeft size={16} /></button>
          <span className="text-xs font-medium text-gray-600 px-1 capitalize">
            {format(new Date(date), "d MMM", { locale: pt })}
          </span>
          <button onClick={() => changeDate(1)} className="p-2 text-gray-400"><ChevronRight size={16} /></button>
        </div>
      </div>

      {totals && (
        <>
          {/* Macros summary card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-gray-700">Resumo do dia</p>
              <p className={cn(
                'text-sm font-bold',
                totals.kcal > rec.kcal ? 'text-red-500' : 'text-brand-600'
              )}>
                {Math.round(totals.kcal)} <span className="text-xs text-gray-400 font-normal">/ {rec.kcal} kcal</span>
              </p>
            </div>
            <NutrBar label="Proteína" value={totals.protein} target={rec.protein} unit="g" color="blue" />
            <NutrBar label="Hidratos" value={totals.carbs}   target={rec.carbs}   unit="g" color="amber" />
            <NutrBar label="Gordura"  value={totals.fat}     target={rec.fat}     unit="g" color="purple" />
            <NutrBar label="Fibra"    value={totals.fiber}   target={rec.fiber}   unit="g" color="brand" />
          </div>

          {/* Micros grid */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Micronutrientes</p>
            <div className="grid grid-cols-4 gap-2">
              <MicroBadge label="Cálcio"  value={totals.calcium}    target={rec.calcium}    unit="mg" />
              <MicroBadge label="Ferro"   value={totals.iron}       target={rec.iron}       unit="mg" />
              <MicroBadge label="Magnésio" value={totals.magnesium} target={rec.magnesium}  unit="mg" />
              <MicroBadge label="Zinco"   value={totals.zinc}       target={rec.zinc}       unit="mg" />
              <MicroBadge label="Vit. C"  value={totals.vitaminC}   target={rec.vitaminC}   unit="mg" />
              <MicroBadge label="Vit. D"  value={totals.vitaminD}   target={rec.vitaminD}   unit="mcg" />
              <MicroBadge label="B12"     value={totals.vitaminB12} target={rec.vitaminB12} unit="mcg" />
              <MicroBadge label="Folato"  value={totals.folate}     target={rec.folate}     unit="mcg" />
              <MicroBadge label="Sódio"   value={totals.sodium}     target={rec.sodium}     unit="mg" />
              <MicroBadge label="Potássio" value={totals.potassium} target={rec.potassium}  unit="mg" />
              <MicroBadge label="Ómega-3" value={totals.omega3}     target={rec.omega3}     unit="g" />
            </div>
          </div>
        </>
      )}

      {/* Meals */}
      {entry?.meals.map(meal => (
        <div key={meal.name} className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="font-semibold text-gray-800 text-sm">{meal.name}</p>
            <button
              onClick={() => setAddMeal(meal.name)}
              className="text-brand-500 hover:text-brand-700 flex items-center gap-1 text-xs font-medium"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {meal.foods.length === 0 ? (
            <p className="text-xs text-gray-300 px-4 py-3 italic">Sem alimentos registados</p>
          ) : (
            <div className="px-4">
              {meal.foods.map((food, fi) => (
                <div key={fi} className="flex items-center gap-2 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{food.name}</p>
                    <p className="text-xs text-gray-400">
                      {food.amount}{food.unit} · {Math.round(food.kcal)} kcal ·{' '}
                      P{food.protein.toFixed(0)}g C{food.carbs.toFixed(0)}g G{food.fat.toFixed(0)}g
                    </p>
                  </div>
                  <button onClick={() => removeFood(meal.name, fi)} className="text-gray-200 hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {!entry && (
        <div className="text-center py-16 text-gray-300">
          <UtensilsCrossed size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sem registos para este dia.</p>
        </div>
      )}

      {addMeal && (
        <AddFoodModal
          mealName={addMeal}
          onAdd={(food) => addFood(addMeal, food)}
          onClose={() => setAddMeal(null)}
        />
      )}
    </div>
  )
}
