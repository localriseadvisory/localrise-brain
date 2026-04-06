'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string; d: string }

const metrics: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Visão Geral',
    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    href: '/dashboard/google',
    label: 'Google Business',
    d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    href: '/dashboard/instagram',
    label: 'Instagram',
    d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    href: '/dashboard/site',
    label: 'Site & SEO',
    d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  {
    href: '/dashboard/ads',
    label: 'Google Ads',
    d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
  {
    href: '/dashboard/relatorios',
    label: 'Relatórios',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

const adminItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Clientes',
    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    href: '/admin/metricas',
    label: 'Inserir Métricas',
    d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="14" height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-xl text-sm transition-all"
      style={{
        padding: '9px 12px',
        marginBottom: 2,
        color: active ? '#ffffff' : '#aaa',
        background: active ? 'rgba(227,27,35,0.08)' : 'transparent',
        fontWeight: active ? 600 : 400,
        letterSpacing: active ? '-0.01em' : 'normal',
      }}
    >
      <span style={{ color: active ? '#E31B23' : '#777' }}>
        <NavIcon d={item.d} />
      </span>
      {item.label}
    </Link>
  )
}

export default function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <p
        className="px-3 mb-2 font-semibold uppercase"
        style={{ color: '#666', fontSize: 10, letterSpacing: '0.1em' }}
      >
        Métricas
      </p>
      {metrics.map(item => {
        const active = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
        return <NavLink key={item.href} item={item} active={active} />
      })}

      {isAdmin && (
        <>
          <div style={{ height: 1, background: '#141414', margin: '16px 0 14px' }} />
          <p
            className="px-3 mb-2 font-semibold uppercase"
            style={{ color: '#666', fontSize: 10, letterSpacing: '0.1em' }}
          >
            Admin
          </p>
          {adminItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return <NavLink key={item.href} item={item} active={active} />
          })}
        </>
      )}
    </nav>
  )
}
