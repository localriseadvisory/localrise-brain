import Link from 'next/link'
import { IconMapPin, IconGlobe, IconTrendingUp, IconFileText, IconCheck, IconBarChart, IconArrowRight } from '@/components/icons'
import { BrandLockup } from '@/components/BrandLockup'

const features = [
  { Icon: IconMapPin, label: 'Google Business Profile', sub: 'Visibilidade local, cliques e reviews', color: '#E31B23' },
  { Icon: IconBarChart, label: 'Instagram Analytics', sub: 'Seguidores, alcance e engajamento', color: '#E1306C' },
  { Icon: IconGlobe, label: 'SEO e Trafego Organico', sub: 'Sessoes, demanda local e descoberta', color: '#3B82F6' },
  { Icon: IconTrendingUp, label: 'Google Ads e ROI', sub: 'Leads, CPL e campanhas por intencao', color: '#A855F7' },
  { Icon: IconFileText, label: 'Insights Executivos', sub: 'Leitura de negocio para o restaurante', color: '#F59E0B' },
]

export default function Home() {
  return (
    <main className="min-h-screen flex" style={{ background: '#080808' }}>
      <div
        className="hidden lg:flex flex-1 flex-col justify-between"
        style={{
          padding: '52px 60px',
          borderRight: '1px solid #141414',
          background: '#0a0a0a',
        }}
      >
        <BrandLockup size={42} />

        <div style={{ maxWidth: 480 }}>
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
            SaaS para restaurantes
          </div>

          <h1 className="mb-5 font-black leading-none text-white" style={{ fontSize: 52, letterSpacing: '-0.04em' }}>
            Crescimento local,
            <br />
            <span style={{ color: '#E31B23' }}>visivel em produto.</span>
          </h1>

          <p className="mb-10 max-w-[390px] text-base leading-relaxed" style={{ color: '#e0e0e0' }}>
            A LocalRise transforma marketing, CRM, IA e dados em um sistema de crescimento demonstravel para restaurantes.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#E31B23', borderColor: 'rgba(227,27,35,0.25)' }}
            >
              Ver demo SaaS
              <IconArrowRight size={16} color="white" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all hover:border-white/20 hover:text-white"
              style={{ borderColor: '#1e1e1e', color: '#d4d4d8', background: '#0f0f0f' }}
            >
              Entrar no portal
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {features.map(({ Icon, label, sub, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl"
                style={{ padding: '13px 16px', background: '#0f0f0f', border: '1px solid #161616' }}
              >
                <div
                  className="flex flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ width: 34, height: 34, background: `${color}12` }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#bbb' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#aaa' }}>
          © {new Date().getFullYear()} LocalRise Advisory. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex max-w-[520px] flex-1 flex-col items-center justify-center" style={{ padding: '52px 40px' }}>
        <div className="mb-10 w-full lg:hidden">
          <BrandLockup size={36} />
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div className="mb-2 font-semibold uppercase" style={{ fontSize: 10, color: '#ccc', letterSpacing: '0.12em' }}>
            Acesso e demonstracao
          </div>
          <h2 className="mb-3 font-black text-white" style={{ fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Entre no portal
            <br />
            ou explore a demo
          </h2>
          <p className="mb-8 text-sm" style={{ color: '#e0e0e0' }}>
            O projeto agora tem uma rota publica de venda e um dashboard autenticado para uso interno.
          </p>

          <Link
            href="/demo"
            className="mb-4 flex w-full items-center justify-between rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: '#E31B23', padding: '16px 20px', letterSpacing: '-0.01em' }}
          >
            <span>Explorar demo comercial</span>
            <IconArrowRight size={16} color="white" />
          </Link>

          <Link
            href="/login"
            className="mb-6 flex w-full items-center justify-between rounded-xl border font-semibold text-sm transition-all hover:border-white/20 hover:text-white"
            style={{ background: '#0f0f0f', borderColor: '#1e1e1e', color: '#d4d4d8', padding: '16px 20px', letterSpacing: '-0.01em' }}
          >
            <span>Entrar no portal</span>
            <IconArrowRight size={16} color="#E31B23" />
          </Link>

          <div className="mb-8 grid grid-cols-3 gap-2">
            {[
              { Icon: IconMapPin, label: 'Google Business', color: '#E31B23' },
              { Icon: IconGlobe, label: 'SEO e Site', color: '#3B82F6' },
              { Icon: IconTrendingUp, label: 'Google Ads', color: '#A855F7' },
            ].map(({ Icon, label, color }) => (
              <div
                key={label}
                className="rounded-xl text-center"
                style={{ padding: '16px 10px', background: '#0f0f0f', border: '1px solid #161616' }}
              >
                <div className="mb-2.5 flex justify-center">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ width: 32, height: 32, background: `${color}10` }}
                  >
                    <Icon size={14} color={color} />
                  </div>
                </div>
                <div className="text-xs font-medium leading-tight" style={{ color: '#fff' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              'Narrativa comercial pronta para apresentacao',
              'Navegacao clara entre produto e operacao',
              'Base preparada para integracao real com dados',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="flex flex-shrink-0 items-center justify-center rounded-full"
                  style={{ width: 18, height: 18, background: 'rgba(34,197,94,0.08)' }}
                >
                  <IconCheck size={10} color="#22C55E" />
                </div>
                <span className="text-xs" style={{ color: '#e0e0e0' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
