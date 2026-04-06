import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (user.user_metadata?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f' }}>
      <aside className="w-60 flex-shrink-0 border-r flex flex-col"
        style={{ background: '#111118', borderColor: '#2a2a3a' }}>
        <div className="p-5 border-b" style={{ borderColor: '#2a2a3a' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4aa)' }}>LR</div>
            <div>
              <div className="text-sm font-bold text-white">LocalRise</div>
              <div className="text-xs" style={{ color: '#ff6b6b' }}>Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {[
            { href: '/admin', label: 'Clientes', icon: '👥' },
            { href: '/admin/metricas', label: 'Inserir Métricas', icon: '✏️' },
            { href: '/dashboard', label: 'Ver como Cliente', icon: '👁️' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors hover:bg-white/5"
              style={{ color: '#7a7a9a' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: '#2a2a3a' }}>
          <div className="text-xs mb-3" style={{ color: '#3a3a5a' }}>{user.email}</div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
