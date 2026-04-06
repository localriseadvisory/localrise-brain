import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import SidebarNav from '@/components/SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = user.user_metadata?.role === 'admin'

  let clientName = isAdmin ? 'LocalRise Advisory' : 'Minha Empresa'

  if (!isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('clients(name)')
      .eq('id', user.id)
      .single()
    const c = data?.clients as { name?: string } | null
    clientName = c?.name || 'Minha Empresa'
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080808' }}>

      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 252,
          background: '#080808',
          borderRight: '1px solid #141414',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
        }}
      >
        {/* Brand header */}
        <div
          className="flex items-center gap-3 px-5"
          style={{ height: 68, borderBottom: '1px solid #141414' }}
        >
          {/* Icon mark — Oficial PNG em vermelho, legível em qualquer tamanho */}
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden"
            style={{
              width: 36,
              height: 36,
              background: '#0f0f0f',
              border: '1px solid #1e1e1e',
              padding: 4,
            }}
          >
            <img
              src="/logo-icon.png"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Wordmark */}
          <div>
            <div
              className="font-black text-white leading-none"
              style={{ fontSize: 14, letterSpacing: '-0.02em' }}
            >
              LocalRise
            </div>
            <div
              className="font-medium leading-none mt-0.5"
              style={{ fontSize: 10, color: '#E31B23', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Advisory
            </div>
          </div>
        </div>

        {/* Client badge */}
        <div className="mx-4 mt-4">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: '#0f0f0f', border: '1px solid #161616' }}
          >
            <div
              className="font-semibold uppercase mb-1"
              style={{ fontSize: 9, color: '#666', letterSpacing: '0.1em' }}
            >
              Empresa
            </div>
            <div
              className="font-bold text-white truncate"
              style={{ fontSize: 13, letterSpacing: '-0.01em' }}
            >
              {clientName}
            </div>
          </div>
        </div>

        {/* Nav */}
        <SidebarNav isAdmin={isAdmin} />

        {/* Bottom */}
        <div className="px-4 pb-5 pt-3 mt-auto" style={{ borderTop: '1px solid #141414' }}>
          <div className="text-xs mb-3 truncate" style={{ color: '#777' }}>{user.email}</div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ marginLeft: 252, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
