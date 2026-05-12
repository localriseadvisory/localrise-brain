'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Factory, Bell,
  Truck, Settings, ChevronRight, Zap
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/financeiro', label: 'Financeiro',  icon: TrendingUp       },
  { href: '/operacao',   label: 'Operação',    icon: Factory          },
  { href: '/logistica',  label: 'Logística',   icon: Truck            },
  { href: '/alertas',    label: 'Alertas',     icon: Bell             },
  { href: '/insights',   label: 'Insights',    icon: Zap              },
]

interface SidebarProps {
  criticalAlerts?: number
}

export default function Sidebar({ criticalAlerts = 0 }: SidebarProps) {
  const path = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-brand-900 flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">LocalRise</div>
            <div className="text-white/40 text-xs">Gestão Inteligente</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
          Menu principal
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          const isAlertas = href === '/alertas'
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-white/50 group-hover:text-white'} />
              <span className="flex-1">{label}</span>
              {isAlertas && criticalAlerts > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {criticalAlerts > 9 ? '9+' : criticalAlerts}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">CL</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">Cliente Demo</div>
            <div className="text-white/40 text-[11px]">Plano Pro</div>
          </div>
          <Settings size={14} className="text-white/30 flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
