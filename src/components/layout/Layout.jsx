import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import { Info } from 'lucide-react'

const MENTLY_NOTES = [
  {
    version: '1.1',
    date: '2026-03-24',
    title: 'Autenticação centralizada',
    items: [
      'Login unificado via bynuno.com (Google OAuth)',
      'Sessão partilhada entre todas as aplicações bynuno',
      'Perfil gerido centralmente em bynuno.com',
    ],
  },
  {
    version: '1.0',
    date: '2025-01-01',
    title: 'Lançamento',
    items: [
      'Painel de saúde pessoal',
      'Análises laboratoriais',
      'Rastreamento nutricional',
      'Registo de sono e exercício',
      'Perfil de utilizador',
    ],
  },
];

function InfoModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[75vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Novidades</h2>
            <p className="text-xs text-gray-400 mt-0.5">Mently</p>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">
            ✕
          </button>
        </div>
        <div className="space-y-7">
          {MENTLY_NOTES.map(n => (
            <div key={n.version} className="relative pl-4 border-l-2 border-emerald-100">
              <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-emerald-600">v{n.version}</span>
                <span className="text-[11px] text-gray-400">{n.date}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">{n.title}</p>
              <ul className="space-y-1">
                {n.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-500 flex gap-2">
                    <span className="text-emerald-300 flex-shrink-0 mt-0.5">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pb-nav overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      {/* Info button */}
      <button onClick={() => setInfoOpen(true)} title="Novidades"
        className="fixed bottom-20 right-4 z-40 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center">
        <Info size={16} />
      </button>
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
