import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, UtensilsCrossed,
  Moon, Dumbbell, User,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/',          icon: LayoutDashboard,  label: 'Início'    },
  { to: '/analyses',  icon: FlaskConical,      label: 'Análises'  },
  { to: '/nutrition', icon: UtensilsCrossed,   label: 'Nutrição'  },
  { to: '/sleep',     icon: Moon,              label: 'Sono'      },
  { to: '/exercise',  icon: Dumbbell,          label: 'Exercício' },
  { to: '/profile',   icon: User,              label: 'Perfil'    },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand-600' : 'text-gray-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
