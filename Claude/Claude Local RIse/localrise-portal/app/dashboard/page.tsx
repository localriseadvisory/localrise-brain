import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  IconMapPin, IconStar, IconGlobe, IconTrendingUp, IconBarChart,
  IconPhone, IconNavigation, IconCheck, IconActivity, IconSearch,
  IconEye, IconTarget, IconDollarSign, IconArrowRight
} from '@/components/icons'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients(*)')
    .eq('id', user!.id)
    .single()

  const clientId = profile?.client_id
  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()
  const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1
  const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual

  const [{ data: gbpAtual }, { data: gbpAnt }, { data: siteAtual }, { data: siteAnt }, { data: adsAtual }] = await Promise.all([
    supabase.from('metrics_gbp').select('*').eq('client_id', clientId).eq('mes', mesAtual).eq('ano', anoAtual).single(),
    supabase.from('metrics_gbp').select('*').eq('client_id', clientId).eq('mes', mesAnterior).eq('ano', anoAnterior).single(),
    supabase.from('metrics_site').select('*').eq('client_id', clientId).eq('mes', mesAtual).eq('ano', anoAtual).single(),
    supabase.from('metrics_site').select('*').eq('client_id', clientId).eq('mes', mesAnterior).eq('ano', anoAnterior).single(),
    supabase.from('metrics_ads').select('*').eq('client_id', clientId).eq('mes', mesAtual).eq('ano', anoAtual).single(),
  ])

  function pct(cur: number | null | undefined, prev: number | null | undefined) {
    if (!cur || !prev || prev === 0) return null
    return (((cur - prev) / prev) * 100).toFixed(1)
  }

  const totalVisualizacoes = (gbpAtual?.visualizacoes_maps ?? 0) + (gbpAtual?.visualizacoes_busca ?? 0)
  const totalVisAnt = (gbpAnt?.visualizacoes_maps ?? 0) + (gbpAnt?.visualizacoes_busca ?? 0)
  const hasData = gbpAtual || siteAtual || adsAtual

  function Delta({ d, invert = false }: { d: string | null; invert?: boolean }) {
    if (!d) return null
    const n = Number(d)
    const good = invert ? n <= 0 : n >= 0
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-lg"
        style={{
          background: good ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          color: good ? '#22C55E' : '#EF4444',
          border: `1px solid ${good ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
        }}
      >
        {n >= 0 ? '+' : ''}{d}%
      </span>
    )
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1140 }}>

      {/* Page header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#777', letterSpacing: '0.1em' }}>
            Visão Geral
          </p>
          <h1 className="font-black text-white" style={{ fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {profile?.clients?.name ?? 'Dashboard'}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#888' }}>
            Resultados de {MESES[mesAtual - 1]} de {anoAtual}
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl text-xs font-semibold"
          style={{
            padding: '8px 14px',
            background: 'rgba(227,27,35,0.07)',
            color: '#E31B23',
            border: '1px solid rgba(227,27,35,0.12)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E31B23', display: 'inline-block' }} />
          {MESES[mesAtual - 1]} {anoAtual}
        </div>
      </div>

      {hasData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              {
                href: '/dashboard/google',
                label: 'Visualizações Google',
                value: totalVisualizacoes > 0 ? totalVisualizacoes.toLocaleString('pt-BR') : '—',
                sub: 'Maps + Busca',
                delta: pct(totalVisualizacoes || null, totalVisAnt || null),
                Icon: IconMapPin,
                color: '#E31B23',
                accent: 'rgba(227,27,35,0.06)',
              },
              {
                href: '/dashboard/google',
                label: 'Nota Google',
                value: gbpAtual?.nota?.toFixed(1) ?? '—',
                sub: `${gbpAtual?.total_reviews ?? 0} avaliações`,
                delta: null,
                Icon: IconStar,
                color: '#F59E0B',
                accent: 'rgba(245,158,11,0.06)',
              },
              {
                href: '/dashboard/site',
                label: 'Sessões no Site',
                value: siteAtual?.sessoes?.toLocaleString('pt-BR') ?? '—',
                sub: `${siteAtual?.usuarios?.toLocaleString('pt-BR') ?? 0} únicos`,
                delta: pct(siteAtual?.sessoes, siteAnt?.sessoes),
                Icon: IconGlobe,
                color: '#3B82F6',
                accent: 'rgba(59,130,246,0.06)',
              },
              {
                href: '/dashboard/ads',
                label: 'Investimento Ads',
                value: adsAtual?.investimento
                  ? `R$ ${adsAtual.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : '—',
                sub: `${adsAtual?.conversoes ?? 0} conversões`,
                delta: null,
                Icon: IconTrendingUp,
                color: '#A855F7',
                accent: 'rgba(168,85,247,0.06)',
              },
            ].map(({ href, label, value, sub, delta, Icon, color, accent }) => (
              <Link
                key={label}
                href={href}
                className="block rounded-2xl transition-all group"
                style={{
                  background: '#0f0f0f',
                  border: '1px solid #1a1a1a',
                  padding: '20px 22px',
                }}
              >
                {/* Card top */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-medium" style={{ color: '#999', letterSpacing: '0.01em' }}>
                    {label}
                  </span>
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 32, height: 32, background: accent }}
                  >
                    <Icon size={14} color={color} />
                  </div>
                </div>

                {/* Value */}
                <div
                  className="font-black mb-2 leading-none"
                  style={{ fontSize: 30, color: color === '#F59E0B' ? color : 'white', letterSpacing: '-0.03em' }}
                >
                  {value}
                </div>

                {/* Sub */}
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#777' }}>{sub}</span>
                  <Delta d={delta} />
                </div>
              </Link>
            ))}
          </div>

          {/* Detail sections */}
          <div className="grid grid-cols-2 gap-3 mb-3">

            {gbpAtual && (
              <div className="rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', padding: '22px 24px' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#777', letterSpacing: '0.08em' }}>Google Business</p>
                    <h2 className="text-sm font-bold text-white">Interações do Mês</h2>
                  </div>
                  <Link href="/dashboard/google" className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#E31B23' }}>
                    Ver mais <IconArrowRight size={12} color="#E31B23" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { Icon: IconPhone, label: 'Ligações', value: gbpAtual.cliques_ligar, color: '#E31B23' },
                    { Icon: IconNavigation, label: 'Rotas', value: gbpAtual.cliques_rota, color: '#3B82F6' },
                    { Icon: IconGlobe, label: 'Cliques no Site', value: gbpAtual.cliques_site, color: '#A855F7' },
                    { Icon: IconStar, label: 'Novos Reviews', value: gbpAtual.novos_reviews, color: '#F59E0B' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl" style={{ padding: '14px 16px', background: '#0a0a0a', border: '1px solid #141414' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex items-center justify-center rounded-lg"
                          style={{ width: 26, height: 26, background: `${item.color}12` }}
                        >
                          <item.Icon size={12} color={item.color} />
                        </div>
                        <span className="text-xs" style={{ color: '#888' }}>{item.label}</span>
                      </div>
                      <div className="font-black text-white" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>
                        {item.value?.toLocaleString('pt-BR') ?? '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {siteAtual && (
              <div className="rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', padding: '22px 24px' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#777', letterSpacing: '0.08em' }}>Site & SEO</p>
                    <h2 className="text-sm font-bold text-white">Desempenho Orgânico</h2>
                  </div>
                  <Link href="/dashboard/site" className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#3B82F6' }}>
                    Ver mais <IconArrowRight size={12} color="#3B82F6" />
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { Icon: IconEye, label: 'Pageviews', value: siteAtual.pageviews?.toLocaleString('pt-BR') ?? '—' },
                    { Icon: IconSearch, label: 'Cliques Orgânicos', value: siteAtual.cliques_organicos?.toLocaleString('pt-BR') ?? '—' },
                    { Icon: IconActivity, label: 'Taxa de Rejeição', value: siteAtual.taxa_rejeicao ? `${siteAtual.taxa_rejeicao}%` : '—' },
                    { Icon: IconTarget, label: 'Posição Média SEO', value: siteAtual.posicao_media ? `#${siteAtual.posicao_media}` : '—' },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl"
                      style={{ padding: '12px 14px', background: '#0a0a0a', border: '1px solid #141414' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.Icon size={13} color="#777" />
                        <span className="text-sm" style={{ color: '#aaa' }}>{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {adsAtual && (
            <div className="rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', padding: '22px 24px' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#777', letterSpacing: '0.08em' }}>Google Ads</p>
                  <h2 className="text-sm font-bold text-white">Resumo do Mês</h2>
                </div>
                <Link href="/dashboard/ads" className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#A855F7' }}>
                  Ver detalhes <IconArrowRight size={12} color="#A855F7" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { Icon: IconEye, label: 'Impressões', value: adsAtual.impressoes?.toLocaleString('pt-BR') ?? '—', color: '#444' },
                  { Icon: IconActivity, label: 'Cliques', value: adsAtual.cliques?.toLocaleString('pt-BR') ?? '—', color: '#3B82F6' },
                  { Icon: IconCheck, label: 'Conversões', value: adsAtual.conversoes?.toLocaleString('pt-BR') ?? '—', color: '#22C55E' },
                  { Icon: IconDollarSign, label: 'Custo por Conversão', value: adsAtual.custo_por_conversao ? `R$ ${adsAtual.custo_por_conversao.toFixed(2)}` : '—', color: '#F59E0B' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl text-center"
                    style={{ padding: '18px 16px', background: '#0a0a0a', border: '1px solid #141414' }}
                  >
                    <div className="flex justify-center mb-3">
                      <div
                        className="flex items-center justify-center rounded-xl"
                        style={{ width: 34, height: 34, background: `${item.color}12` }}
                      >
                        <item.Icon size={15} color={item.color} />
                      </div>
                    </div>
                    <div className="font-black mb-1.5" style={{ fontSize: 22, color: item.color, letterSpacing: '-0.02em' }}>
                      {item.value}
                    </div>
                    <div className="text-xs" style={{ color: '#888' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          className="rounded-2xl text-center"
          style={{ padding: '80px 40px', background: '#0f0f0f', border: '1px solid #1a1a1a' }}
        >
          <div
            className="flex items-center justify-center rounded-2xl mx-auto mb-5"
            style={{ width: 56, height: 56, background: '#141414', border: '1px solid #1e1e1e' }}
          >
            <IconBarChart size={24} color="#555" />
          </div>
          <div className="text-white font-bold text-lg mb-2" style={{ letterSpacing: '-0.01em' }}>
            Métricas em preparação
          </div>
          <p className="text-sm max-w-xs mx-auto" style={{ color: '#888' }}>
            A equipe LocalRise está configurando seus dados. Em breve tudo aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  )
}
