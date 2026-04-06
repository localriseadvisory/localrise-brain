'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconMapPin, IconGlobe, IconTrendingUp, IconFileText, IconBarChart } from '@/components/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const features = [
    { Icon: IconMapPin, label: 'Google Business Profile', sub: 'Visualizações, interações e avaliações', color: '#E31B23' },
    { Icon: IconBarChart, label: 'Instagram Analytics', sub: 'Seguidores, alcance e engajamento', color: '#E1306C' },
    { Icon: IconGlobe, label: 'Tráfego Orgânico & SEO', sub: 'Sessões, posição média e orgânico', color: '#3B82F6' },
    { Icon: IconTrendingUp, label: 'Google Ads & ROI', sub: 'Conversões, CPA e performance', color: '#A855F7' },
    { Icon: IconFileText, label: 'Relatórios Mensais', sub: 'Elaborados pela equipe LocalRise', color: '#F59E0B' },
  ]

  /* Marca reutilizável (ícone + wordmark) */
  function Brand({ iconSize = 36 }: { iconSize?: number }) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0"
          style={{
            width: iconSize,
            height: iconSize,
            background: '#111',
            border: '1px solid #222',
            padding: iconSize * 0.1,
          }}
        >
          <img src="/logo-icon.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div className="font-black text-white leading-none" style={{ fontSize: iconSize * 0.39, letterSpacing: '-0.02em' }}>
            LocalRise
          </div>
          <div className="font-semibold leading-none mt-0.5" style={{ fontSize: iconSize * 0.25, color: '#E31B23', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Advisory
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex" style={{ background: '#080808' }}>

      {/* Left panel */}
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
        <Brand iconSize={38} />

        {/* Hero */}
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-7 font-semibold"
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

          <h1
            className="font-black text-white leading-none mb-5"
            style={{ fontSize: 40, letterSpacing: '-0.04em' }}
          >
            Seus resultados,<br />
            <span style={{ color: '#E31B23' }}>em tempo real.</span>
          </h1>

          <p className="text-sm leading-relaxed mb-10" style={{ color: '#333', maxWidth: 340 }}>
            Acompanhe o desempenho completo do seu negócio — Google Business, Instagram, site e campanhas.
          </p>

          <div className="flex flex-col gap-2.5">
            {features.map(({ Icon, label, sub, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl"
                style={{ padding: '13px 16px', background: '#0f0f0f', border: '1px solid #181818' }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-xl"
                  style={{ width: 34, height: 34, background: `${color}12` }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#2a2a2a' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#181818' }}>
          © {new Date().getFullYear()} LocalRise Advisory. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile brand */}
          <div className="mb-10 lg:hidden">
            <Brand iconSize={34} />
          </div>

          <div className="mb-8">
            <h2
              className="font-black text-white mb-2"
              style={{ fontSize: 28, letterSpacing: '-0.03em' }}
            >
              Entrar no portal
            </h2>
            <p className="text-sm" style={{ color: '#333' }}>
              Use o acesso enviado pela equipe LocalRise.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label
                className="block font-semibold uppercase mb-2.5"
                style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: '0.1em' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-xl border text-white text-sm outline-none transition-all"
                style={{ background: '#0f0f0f', borderColor: '#1e1e1e', padding: '13px 16px' }}
                onFocus={e => { e.target.style.borderColor = '#E31B23'; e.target.style.boxShadow = '0 0 0 3px rgba(227,27,35,0.07)' }}
                onBlur={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label
                className="block font-semibold uppercase mb-2.5"
                style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: '0.1em' }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border text-white text-sm outline-none transition-all"
                style={{ background: '#0f0f0f', borderColor: '#1e1e1e', padding: '13px 16px' }}
                onFocus={e => { e.target.style.borderColor = '#E31B23'; e.target.style.boxShadow = '0 0 0 3px rgba(227,27,35,0.07)' }}
                onBlur={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.1)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: '#E31B23', padding: '14px 24px', marginTop: 4, letterSpacing: '-0.01em' }}
            >
              {loading ? 'Entrando...' : 'Entrar no portal'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: '#1e1e1e' }}>
            Problemas para acessar?{' '}
            <a href="https://wa.me/55" className="transition-colors hover:text-white" style={{ color: '#333' }}>
              Fale com a LocalRise
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
