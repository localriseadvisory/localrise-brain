'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconBarChart, IconFileText, IconGlobe, IconMapPin, IconTrendingUp } from '@/components/icons'
import { BrandLockup } from '@/components/BrandLockup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const features = [
    { Icon: IconMapPin, label: 'Google Business Profile', sub: 'Visibilidade local, interacoes e reviews', color: '#E31B23' },
    { Icon: IconBarChart, label: 'Instagram Analytics', sub: 'Seguidores, alcance e engajamento', color: '#E1306C' },
    { Icon: IconGlobe, label: 'SEO e Trafego Organico', sub: 'Sessoes, posicao media e descoberta', color: '#3B82F6' },
    { Icon: IconTrendingUp, label: 'Google Ads e ROI', sub: 'Conversoes, CPL e performance', color: '#A855F7' },
    { Icon: IconFileText, label: 'Insights Executivos', sub: 'Leitura clara para dono e gestao', color: '#F59E0B' },
  ]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex" style={{ background: '#080808' }}>
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: 520,
          flexShrink: 0,
          background: '#0a0a0a',
          borderRight: '1px solid #141414',
          padding: '48px 52px',
        }}
      >
        <BrandLockup size={38} />

        <div>
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full font-semibold"
            style={{
              padding: '6px 14px',
              background: 'rgba(227,27,35,0.08)',
              color: '#E31B23',
              border: '1px solid rgba(227,27,35,0.15)',
              fontSize: 11,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E31B23', display: 'inline-block' }} />
            Portal do Cliente
          </div>

          <h1 className="mb-5 font-black leading-none text-white" style={{ fontSize: 40, letterSpacing: '-0.04em' }}>
            Seus resultados,
            <br />
            <span style={{ color: '#E31B23' }}>em tempo real.</span>
          </h1>

          <p className="mb-10 max-w-[340px] text-sm leading-relaxed" style={{ color: '#8c8c8c' }}>
            Acompanhe aquisicao, CRM, reputacao, eventos e performance comercial em um unico sistema.
          </p>

          <div className="flex flex-col gap-2.5">
            {features.map(({ Icon, label, sub, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl"
                style={{ padding: '13px 16px', background: '#0f0f0f', border: '1px solid #181818' }}
              >
                <div
                  className="flex flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ width: 34, height: 34, background: `${color}12` }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#6f6f6f' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#4b4b4b' }}>
          © {new Date().getFullYear()} LocalRise Advisory. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center" style={{ padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="mb-10 lg:hidden">
            <BrandLockup size={34} />
          </div>

          <div className="mb-8">
            <h2 className="mb-2 font-black text-white" style={{ fontSize: 28, letterSpacing: '-0.03em' }}>
              Entrar no portal
            </h2>
            <p className="text-sm" style={{ color: '#888' }}>
              Use o acesso enviado pela equipe LocalRise.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Demo comercial</div>
            <div className="mt-2 text-sm font-semibold text-white">Quer apresentar o produto sem login?</div>
            <Link href="/demo" className="mt-3 inline-flex text-sm font-semibold text-red-300">
              Abrir demo publica
            </Link>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="mb-2.5 block font-semibold uppercase" style={{ fontSize: 10, color: '#777', letterSpacing: '0.1em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-xl border text-sm text-white outline-none transition-all"
                style={{ background: '#0f0f0f', borderColor: '#1e1e1e', padding: '13px 16px' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E31B23'
                  e.target.style.boxShadow = '0 0 0 3px rgba(227,27,35,0.07)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1e1e1e'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label className="mb-2.5 block font-semibold uppercase" style={{ fontSize: 10, color: '#777', letterSpacing: '0.1em' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full rounded-xl border text-sm text-white outline-none transition-all"
                style={{ background: '#0f0f0f', borderColor: '#1e1e1e', padding: '13px 16px' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E31B23'
                  e.target.style.boxShadow = '0 0 0 3px rgba(227,27,35,0.07)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1e1e1e'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error ? (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.1)' }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: '#E31B23', padding: '14px 24px', marginTop: 4, letterSpacing: '-0.01em' }}
            >
              {loading ? 'Entrando...' : 'Entrar no portal'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: '#555' }}>
            Problemas para acessar?{' '}
            <a href="https://wa.me/55" className="transition-colors hover:text-white" style={{ color: '#888' }}>
              Fale com a LocalRise
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
