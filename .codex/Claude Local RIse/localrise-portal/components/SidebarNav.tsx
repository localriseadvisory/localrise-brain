'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string; d: string; group: 'produto' | 'admin' }

export const sidebarItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Visao Geral',
    d: 'M3 13h8V3H3v10zm10 8h8V3h-8v18zm-10 0h8v-6H3v6z',
    group: 'produto',
  },
  {
    href: '/dashboard/aquisicao',
    label: 'Aquisicao',
    d: 'M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z',
    group: 'produto',
  },
  {
    href: '/dashboard/trafego-pago',
    label: 'Trafego Pago',
    d: 'M4 17l6-6 4 4 6-8M20 7h-6V1',
    group: 'produto',
  },
  {
    href: '/dashboard/crm',
    label: 'CRM e Retencao',
    d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm11 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    group: 'produto',
  },
  {
    href: '/dashboard/automacoes',
    label: 'Automacoes e IA',
    d: 'M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7l3-7z',
    group: 'produto',
  },
  {
    href: '/dashboard/reputacao',
    label: 'Reputacao',
    d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    group: 'produto',
  },
  {
    href: '/dashboard/eventos',
    label: 'Eventos',
    d: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
    group: 'produto',
  },
  {
    href: '/dashboard/sistema-localrise',
    label: 'Sistema LocalRise',
    d: 'M12 3l7 4v5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V7l7-4zm0 5v4m0 4h.01',
    group: 'produto',
  },
  {
    href: '/admin',
    label: 'Clientes',
    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    group: 'admin',
  },
  {
    href: '/admin/metricas',
    label: 'Inserir Metricas',
    d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    group: 'admin',
  },
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all"
      style={{
        color: active ? '#fff' : '#a1a1aa',
        background: active ? 'linear-gradient(90deg, rgba(227,27,35,0.14), rgba(227,27,35,0.05))' : 'transparent',
        border: active ? '1px solid rgba(227,27,35,0.16)' : '1px solid transparent',
        fontWeight: active ? 600 : 500,
      }}
    >
      <span style={{ color: active ? '#E31B23' : '#71717a' }}>
        <NavIcon d={item.d} />
      </span>
      {item.label}
    </Link>
  )
}

export default function SidebarNav({ isAdmin, basePath = '/dashboard' }: { isAdmin: boolean; basePath?: string }) {
  const pathname = usePathname()
  const productItems = sidebarItems
    .filter((item) => item.group === 'produto')
    .map((item) => ({
      ...item,
      href: item.href === '/dashboard' ? basePath : `${basePath}${item.href.replace('/dashboard', '')}`,
    }))
  const adminItems = sidebarItems.filter((item) => item.group === 'admin')

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href)
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <div className="mb-6">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#71717a' }}>
          Produto
        </p>
        <div className="space-y-1">
          {productItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </div>

      {isAdmin && (
        <div>
          <div style={{ height: 1, background: '#18181b', margin: '0 12px 14px' }} />
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#71717a' }}>
            Admin
          </p>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export function MobileProductNav({ basePath = '/dashboard' }: { basePath?: string }) {
  const pathname = usePathname()
  const productItems = sidebarItems
    .filter((item) => item.group === 'produto')
    .map((item) => ({
      ...item,
      href: item.href === '/dashboard' ? basePath : `${basePath}${item.href.replace('/dashboard', '')}`,
    }))

  return (
    <div className="border-b border-white/6 bg-black/20 px-4 py-3 backdrop-blur xl:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {productItems.map((item) => {
          const active = item.href === basePath ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all"
              style={{
                borderColor: active ? 'rgba(227,27,35,0.24)' : 'rgba(255,255,255,0.08)',
                background: active ? 'rgba(227,27,35,0.12)' : 'rgba(255,255,255,0.03)',
                color: active ? '#fff' : '#a1a1aa',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
