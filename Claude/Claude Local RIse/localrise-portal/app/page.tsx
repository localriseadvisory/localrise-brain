import Link from 'next/link'
import { IconMapPin, IconGlobe, IconTrendingUp, IconFileText, IconCheck, IconBarChart, IconArrowRight } from '@/components/icons'

function Brand({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: '#111',
          border: '1px solid #1e1e1e',
          padding: size * 0.1,
        }}
      >
        <img src="/logo-icon.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div>
        <div className="font-black text-white leading-none" style={{ fontSize: size * 0.38, letterSpacing: '-0.03em' }}>
          LocalRise
        </div>
        <div
          className="font-semibold leading-none mt-0.5"
          style={{ fontSize: size * 0.23, color: '#E31B23', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Advisory
        </div>
      </div>
    </div>
  )
}

const features = [
  { Icon: IconMapPin, label: 'Google Business Profile', sub: 'Visualizações, cliques e avaliações', color: '#E31B23' },
  { Icon: IconBarChart, label: 'Instagram Analytics', sub: 'Seguidores, alcance e engajamento', color: '#E1306C' },
  { Icon: IconGlobe, label: 'Tráfego Orgânico & SEO', sub: 'Sessões, posição média e orgânico', color: '#3B82F6' },
  { Icon: IconTrendingUp, label: 'Google Ads & ROI', sub: 'Conversões, CPA e performance', color: '#A855F7' },
  { Icon: IconFileText, label: 'Relatórios Mensais', sub: 'Elaborados pela equipe LocalRise', color: '#F59E0B' },
]

export default function Home() {
  return (
    <main className="min-h-screen flex" style={{ background: '#080808' }}>

      {/* Left — Brand */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1"
        style={{
          padding: '52px 60px',
          borderRight: '1px solid #141414',
          background: '#0a0a0a',
        }}
      >
        <Brand size={42} />

        <div style={{ maxWidth: 460 }}>
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
            style={{ fontSize: 52, letterSpacing: '-0.04em' }}
          >
            Seus resultados,<br />
            <span style={{ color: '#E31B23' }}>em tempo real.</span>
          </h1>

          <p className="text-base leading-relaxed mb-10" style={{ color: '#e0e0e0', maxWidth: 360 }}>
            Acompanhe o desempenho completo do seu negócio com dados atualizados mensalmente pela equipe LocalRise.
          </p>

          <div className="flex flex-col gap-2.5">
            {features.map(({ Icon, label, sub, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl"
                style={{ padding: '13px 16px', background: '#0f0f0f', border: '1px solid #161616' }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-xl"
                  style={{ width: 34, height: 34, background: `${color}12` }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#bbb' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#aaa' }}>
          © {new Date().getFullYear()} LocalRise Advisory. Todos os direitos reservados.
        </p>
      </div>

      {/* Right — CTA */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ padding: '52px 40px', maxWidth: 520 }}
      >
        <div className="mb-10 w-full lg:hidden">
          <Brand size={36} />
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div
            className="font-semibold uppercase mb-2"
            style={{ fontSize: 10, color: '#ccc', letterSpacing: '0.12em' }}
          >
            Acesso exclusivo
          </div>
          <h2
            className="font-black text-white mb-3"
            style={{ fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Acesse seu painel
          </h2>
          <p className="text-sm mb-8" style={{ color: '#e0e0e0' }}>
            Métricas atualizadas mensalmente pela equipe LocalRise.
          </p>

          <Link
            href="/login"
            className="flex items-center justify-between w-full rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: '#E31B23', padding: '16px 20px', marginBottom: 24, letterSpacing: '-0.01em' }}
          >
            <span>Entrar no portal</span>
            <IconArrowRight size={16} color="white" />
          </Link>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {[
              { Icon: IconMapPin, label: 'Google Business', color: '#E31B23' },
              { Icon: IconGlobe, label: 'Site & SEO', color: '#3B82F6' },
              { Icon: IconTrendingUp, label: 'Google Ads', color: '#A855F7' },
            ].map(({ Icon, label, color }) => (
              <div
                key={label}
                className="rounded-xl text-center"
                style={{ padding: '16px 10px', background: '#0f0f0f', border: '1px solid #161616' }}
              >
                <div className="flex justify-center mb-2.5">
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
              'Dados atualizados mensalmente pela equipe',
              'Acesso seguro e exclusivo por empresa',
              'Suporte direto com a equipe LocalRise',
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-full"
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
