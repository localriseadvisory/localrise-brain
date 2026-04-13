import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrandLockup } from '@/components/BrandLockup'
import { CheckoutButton } from './checkout-button'

// URL do WhatsApp da equipe LocalRise — altere conforme necessário
const WHATSAPP_URL = process.env.WHATSAPP_URL ?? 'https://wa.me/5500000000000'

export default async function PagamentoPendentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Não autenticado → login
  if (!user) redirect('/login')

  // Admin nunca cai aqui
  if (user.user_metadata?.role === 'admin') redirect('/admin')

  // Buscar client_id do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', user.id)
    .single()

  // Se já está ativo, redirecionar ao dashboard
  if (profile?.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('status_assinatura')
      .eq('id', profile.client_id)
      .single()

    if (client?.status_assinatura === 'ativa' || client?.status_assinatura === 'trial') {
      redirect('/dashboard')
    }
  }

  const clienteId = profile?.client_id ?? ''

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#080808', padding: '40px 24px' }}
    >
      {/* Logo */}
      <div className="mb-12">
        <BrandLockup size={34} />
      </div>

      {/* Card central */}
      <div
        className="w-full max-w-md rounded-3xl text-center"
        style={{
          background: '#0f0f0f',
          border: '1px solid #1e1e1e',
          padding: '48px 40px',
        }}
      >
        {/* Ícone de aviso */}
        <div
          className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
          style={{ width: 64, height: 64, background: 'rgba(227,27,35,0.08)', border: '1px solid rgba(227,27,35,0.12)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E31B23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Título */}
        <h1
          className="mb-3 font-black text-white"
          style={{ fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1.15 }}
        >
          Sua assinatura está pausada
        </h1>

        {/* Subtítulo */}
        <p className="mb-10 text-sm leading-relaxed" style={{ color: '#888', maxWidth: 320, margin: '0 auto 40px' }}>
          Renove agora para continuar acessando seu painel de marketing e todos os relatórios da LocalRise.
        </p>

        {/* Botão principal — Stripe Checkout */}
        {clienteId ? (
          <CheckoutButton clienteId={clienteId} />
        ) : (
          <p className="text-xs" style={{ color: '#555' }}>
            Conta não configurada. Entre em contato com a equipe.
          </p>
        )}

        {/* Divisor */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1" style={{ height: 1, background: '#1e1e1e' }} />
          <span className="text-xs" style={{ color: '#444' }}>ou</span>
          <div className="flex-1" style={{ height: 1, background: '#1e1e1e' }} />
        </div>

        {/* Botão secundário — WhatsApp */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full max-w-xs items-center justify-center gap-2.5 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: '#181818',
            border: '1px solid #222',
            color: '#22C55E',
            padding: '14px 24px',
          }}
        >
          {/* WhatsApp icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar com a LocalRise
        </a>
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs" style={{ color: '#3a3a3a' }}>
        © {new Date().getFullYear()} LocalRise Advisory
      </p>
    </main>
  )
}
