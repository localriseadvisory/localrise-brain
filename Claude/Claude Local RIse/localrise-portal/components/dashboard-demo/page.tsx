'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Bot,
  Calendar,
  CalendarHeart,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  Crown,
  Eye,
  Globe,
  HandCoins,
  Instagram,
  Landmark,
  MessageSquareText,
  MessagesSquare,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { DashboardData, DashboardSection } from '@/lib/dashboard/contracts'
import {
  BulletList,
  ChannelKpiCard,
  DataTable,
  FunnelBars,
  KpiCard,
  MiniBars,
  OnboardingChecklist,
  PageIntro,
  Panel,
  ProgressList,
  SectionTitle,
} from '@/components/dashboard-demo/ui'

// ─── Seletor de Período ───────────────────────────────────────────────────────
// Tipos e lógica de período
//
// PeriodOption representa uma opção do seletor.
// `badgeLabel` é o texto exibido no título e no badge (ex: "Março 2026").
// `key` identifica a opção — use-o como filtro ao conectar ao banco de dados:
//
//   this_month  → WHERE ano = X AND mes = Y (mês atual)
//   last_month  → WHERE ano = X AND mes = Y-1
//   last_30     → WHERE data >= NOW() - INTERVAL '30 days'
//   last_90     → WHERE data >= NOW() - INTERVAL '90 days'
//   custom      → WHERE data BETWEEN `from` AND `to`
// ─────────────────────────────────────────────────────────────────────────────
type PeriodOption =
  | { key: 'this_month' | 'last_month' | 'last_30' | 'last_90'; label: string; badgeLabel: string }
  | { key: 'custom'; label: string; badgeLabel: string; from?: string; to?: string }

function buildPeriodOptions(): PeriodOption[] {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return [
    { key: 'this_month', label: 'Este mês',       badgeLabel: `${months[now.getMonth()]}  ${now.getFullYear()}` },
    { key: 'last_month', label: 'Mês passado',    badgeLabel: `${months[prev.getMonth()]} ${prev.getFullYear()}` },
    { key: 'last_30',    label: 'Últimos 30 dias', badgeLabel: 'Últimos 30 dias' },
    { key: 'last_90',    label: 'Últimos 90 dias', badgeLabel: 'Últimos 90 dias' },
    { key: 'custom',     label: 'Personalizado',   badgeLabel: 'Período personalizado' },
  ]
}

// Calculado uma vez no módulo (client-side); sempre reflete a data atual
const PERIOD_OPTIONS = buildPeriodOptions()

function PeriodSelector({
  selected,
  onSelect,
}: {
  selected: PeriodOption
  onSelect: (p: PeriodOption) => void
}) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function selectOption(option: PeriodOption) {
    if (option.key !== 'custom') {
      onSelect(option)
      setOpen(false)
    }
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    const fmt = (iso: string) =>
      new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    onSelect({
      key: 'custom',
      label: 'Personalizado',
      badgeLabel: `${fmt(customFrom)} – ${fmt(customTo)}`,
      from: customFrom,
      to: customTo,
    })
    setOpen(false)
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      {/* Botão disparador */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all"
        style={{
          borderColor: open ? 'rgba(227,27,35,0.35)' : 'rgba(255,255,255,0.1)',
          background:   open ? 'rgba(227,27,35,0.08)' : 'rgba(255,255,255,0.04)',
          color: open ? '#ffffff' : '#a1a1aa',
        }}
      >
        <Calendar size={14} />
        <span>{selected.badgeLabel}</span>
        <ChevronDown
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-3xl border border-white/10 py-2 shadow-2xl"
          style={{ background: 'rgba(12,12,15,0.97)', backdropFilter: 'blur(18px)' }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.key === selected.key
            const isCustom = option.key === 'custom'
            return (
              <div key={option.key}>
                <button
                  onClick={() => selectOption(option)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                  style={{ color: isActive ? '#ffffff' : '#a1a1aa', fontWeight: isActive ? 600 : 400 }}
                >
                  {option.label}
                  {isActive && <Check size={13} style={{ color: '#E31B23' }} />}
                </button>

                {/* Date picker embutido para "Personalizado" */}
                {isCustom && (
                  <div className="mx-4 mb-3 mt-1 space-y-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                        De
                      </label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                        Até
                      </label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500/40"
                      />
                    </div>
                    <button
                      onClick={applyCustom}
                      disabled={!customFrom || !customTo}
                      className="w-full rounded-xl py-2 text-xs font-bold transition-all disabled:opacity-30"
                      style={{ background: 'linear-gradient(135deg, #E31B23, #8b1117)', color: '#fff' }}
                    >
                      Aplicar período
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const sectionMeta: Record<DashboardSection, { title: string; description: string }> = {
  overview: {
    title: 'Visao geral executiva do restaurante',
    description:
      'Um cockpit de crescimento que conecta receita, canais de aquisicao, CRM e operacao automatizada em linguagem de dono.',
  },
  aquisicao: {
    title: 'Aquisicao organica e demanda local',
    description:
      'Onde a marca aparece, quais buscas geram descoberta e onde ainda existe demanda local para capturar.',
  },
  'trafego-pago': {
    title: 'Google Ads por intencao',
    description:
      'Campanhas desenhadas para procura de marca, proximidade e ocasioes de alto ticket com leitura de eficiencia e escala.',
  },
  crm: {
    title: 'CRM, recorrencia e base propria',
    description:
      'Retencao, retorno e campanhas acionadas para aumentar frequencia, ticket e relacionamento com a base.',
  },
  automacoes: {
    title: 'Automacoes e IA operacional',
    description:
      'Fluxos, copilotos e respostas automaticas que reduzem friccao comercial e melhoram a experiencia do cliente.',
  },
  reputacao: {
    title: 'Reputacao digital com leitura acionavel',
    description:
      'Volume, sentimento, temas recorrentes e prioridades de resposta para proteger a marca e elevar conversao.',
  },
  eventos: {
    title: 'Pipeline de eventos e ticket incremental',
    description:
      'Acompanhamento da frente de eventos como unidade real de crescimento, nao apenas canal complementar.',
  },
  'sistema-localrise': {
    title: 'Como a LocalRise impulsiona seu restaurante',
    description:
      'A tese de produto por tras da demo: aquisicao, conversao, retencao, inteligencia e previsibilidade em uma operacao unica.',
  },
}

const sectionLinks: { key: DashboardSection; label: string }[] = [
  { key: 'overview', label: 'Visao Geral' },
  { key: 'aquisicao', label: 'Aquisicao' },
  { key: 'trafego-pago', label: 'Trafego Pago' },
  { key: 'crm', label: 'CRM' },
  { key: 'automacoes', label: 'Automacoes' },
  { key: 'reputacao', label: 'Reputacao' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'sistema-localrise', label: 'Sistema LocalRise' },
]

function strongestSourceLabel(data: DashboardData) {
  return [...data.overview.sourceMix].sort((left, right) => right.value - left.value)[0]?.label ?? 'Google + Maps'
}

function strongestOpportunityLabel(data: DashboardData) {
  return [...data.events.opportunities].sort((left, right) => right.value - left.value)[0]?.label ?? 'Eventos corporativos'
}

function ExecutiveStrip({ data }: { data: DashboardData }) {
  const { restaurant } = data
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
      <Panel className="lr-grid-bg overflow-hidden">
        <div className="relative">
          <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute right-20 top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <div className="lr-badge mb-4">
              <Store size={13} />
              Restaurante demo
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">{restaurant.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{restaurant.segment}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 px-3 py-1.5">{restaurant.city}</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">{restaurant.period}</span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                {restaurant.growthMessage}
              </span>
            </div>
          </div>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Health score LocalRise" description="Leitura consolidada de aquisicao, reputacao, CRM e automacoes." />
        <div className="flex items-end gap-4">
          <div className="text-6xl font-black tracking-tight text-white">{restaurant.healthScore}</div>
          <div className="pb-2 text-sm leading-6 text-zinc-400">
            de 100 pontos
            <div className="font-semibold text-emerald-300">Operacao pronta para escala com gargalos bem definidos.</div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function InsightRail({ data }: { data: DashboardData }) {
  return (
    <Panel>
      <SectionTitle
        title="Insights da LocalRise"
        description="Leitura automatica com foco em decisao comercial."
        badge="Prioridades do mes"
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {data.insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-red-300">
              <Sparkles size={15} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Insight</span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">{insight.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{insight.detail}</p>
            <div className="mt-4 rounded-2xl border border-emerald-500/12 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
              Impacto esperado: {insight.impact}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function ExecutiveSummaryPanel({ data }: { data: DashboardData }) {
  return (
    <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <Panel>
        <SectionTitle
          title="Resumo executivo"
          description="Leitura comercial pronta para apresentacao."
          badge="Demo profissional"
        />
        <p className="max-w-3xl text-sm leading-7 text-zinc-300">{data.overview.headline}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {data.actionPlan.map((action) => (
            <div key={action.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{action.owner}</div>
              <div className="mt-2 text-base font-bold tracking-tight text-white">{action.title}</div>
              <div className="mt-3 text-sm text-zinc-400">Prazo: {action.due}</div>
              <div className="mt-3 rounded-2xl border border-emerald-500/12 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
                Impacto esperado: {action.impact}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Alertas automaticos" description="Sinais que ajudam a conduzir a conversa com o cliente." />
        <BulletList items={data.reputation.alerts} />
      </Panel>
    </div>
  )
}

// ─── KPI strip do topo ────────────────────────────────────────────────────────
// TODO: quando as integrações com Google Business, Instagram, Analytics, Google
//       Search Console e Google Ads estiverem ativas, substituir os valores
//       abaixo por dados vindos do banco (ex: tabela metrics_snapshots ou via
//       API routes em /api/metrics). Cada objeto tem: value (string exibida),
//       change (variação textual) e positive (verde se true, âmbar se false).
// ──────────────────────────────────────────────────────────────────────────────
const TOP_KPIS = [
  {
    icon: Eye,
    label: 'Impressões no Google Business',
    value: '1.240',
    change: '+12% esse mês',
    positive: true,
    iconColor: '#60a5fa',
    iconBg: 'rgba(59,130,246,0.15)',
  },
  {
    icon: Instagram,
    label: 'Seguidores no Instagram',
    value: '847',
    change: '+8% esse mês',
    positive: true,
    iconColor: '#e879f9',
    iconBg: 'rgba(232,121,249,0.15)',
  },
  {
    icon: Globe,
    label: 'Visitas no Site',
    value: '312',
    change: '+5% esse mês',
    positive: true,
    iconColor: '#4ade80',
    iconBg: 'rgba(74,222,128,0.15)',
  },
  {
    icon: TrendingUp,
    label: 'Posição Média SEO',
    value: '4.2',
    change: '-0.3 vs mês anterior',
    positive: true,
    iconColor: '#fb923c',
    iconBg: 'rgba(251,146,60,0.15)',
  },
  {
    icon: MousePointerClick,
    label: 'Cliques no Google Ads',
    value: '98',
    change: '+21% esse mês',
    positive: true,
    iconColor: '#facc15',
    iconBg: 'rgba(250,204,21,0.15)',
  },
] as const

function TopKpiStrip() {
  return (
    <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      {TOP_KPIS.map((kpi) => (
        <ChannelKpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

function OverviewSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Cockpit executivo" title={sectionMeta.overview.title} description={sectionMeta.overview.description} ctaHref="/dashboard/sistema-localrise" ctaLabel="Ver narrativa comercial" />
      <TopKpiStrip />
      <ExecutiveStrip data={data} />
      <ExecutiveSummaryPanel data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.overview.kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionTitle title="Evolucao de faturamento atribuido" description="Curva demonstrativa da receita ligada a reservas, CRM e eventos." />
          <MiniBars points={data.overview.revenueTrend} color="#E31B23" />
        </Panel>
        <Panel>
          <SectionTitle title="Origem dos clientes" description="Composicao comercial da demanda do periodo." />
          <ProgressList items={data.overview.sourceMix} />
      </Panel>
      </div>
      <InsightRail data={data} />
    </>
  )
}

function AcquisitionSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Google, SEO local e Maps" title={sectionMeta.aquisicao.title} description={sectionMeta.aquisicao.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.acquisition.performance.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote={index % 2 === 0 ? 'Captura demanda existente e gera descoberta com menor custo.' : 'Sinal de ganho real de visibilidade local.'}
            tone={index % 4 === 0 ? 'red' : index % 4 === 1 ? 'green' : index % 4 === 2 ? 'blue' : 'amber'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel>
          <SectionTitle title="Palavras-chave prioritarias" description="Buscas de alta intencao que sustentam descoberta e visitas." />
          <DataTable
            headers={['Keyword', 'Intencao', 'Posicao', 'Cliques', 'Movimento']}
            rows={data.acquisition.keywordTable.map((row) => [
              <span key="k" className="font-semibold text-white">{row.keyword}</span>,
              row.intent,
              <span key="p" className="text-emerald-300">{row.position}</span>,
              row.clicks,
              <span key="m" className="text-zinc-100">{row.movement}</span>,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Marca vs nao-branded" description="A proxima alavanca esta em converter procura que ainda nao conhece o restaurante." />
          <ProgressList items={data.acquisition.brandedVsNonBranded} />
          <div className="mt-6 border-t border-white/8 pt-6">
            <SectionTitle title="Origem do trafego" />
            <ProgressList items={data.acquisition.trafficOrigins} />
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <SectionTitle title="Google Business Profile" description="O GBP nao aparece como anexo de SEO. Ele funciona como vitrine, prova social e ponto de captura local." badge="Ativo" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-300">
                <Star size={15} />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Reputacao</span>
              </div>
              <div className="text-5xl font-black tracking-tight text-white">{data.acquisition.googleBusinessProfile.rating}</div>
              <div className="mt-2 text-sm text-zinc-400">{data.acquisition.googleBusinessProfile.reviews} reviews totais</div>
              <div className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                +{data.acquisition.googleBusinessProfile.newReviews} novas avaliacoes no periodo
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['Visualizacoes em fotos', data.acquisition.googleBusinessProfile.photos],
                ['Visualizacoes no Maps', data.acquisition.googleBusinessProfile.mapsViews],
                ['Visualizacoes na Busca', data.acquisition.googleBusinessProfile.searchViews],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                  <div className="mt-2 text-xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Leituras estrategicas" description="O que o gestor deve enxergar rapidamente." />
          <BulletList items={data.acquisition.googleBusinessProfile.highlights} />
        </Panel>
      </div>
      <div className="mt-6">
        <Panel>
          <SectionTitle title="Painel de reviews" description="Amostra operacional para demonstrar contexto, tom e proxima acao." />
          <DataTable
            headers={['Cliente', 'Nota', 'Canal', 'Tom', 'Trecho', 'Acao']}
            rows={data.reputation.reviewFeed.map((item) => [
              <span key="author" className="font-semibold text-white">{item.author}</span>,
              <span key="rating" className="text-amber-300">{item.rating}</span>,
              item.channel,
              <span key="sentiment" className="text-zinc-100">{item.sentiment}</span>,
              <span key="text" className="text-zinc-300">{item.text}</span>,
              <span key="response" className="text-emerald-300">{item.response}</span>,
            ])}
          />
        </Panel>
      </div>
    </>
  )
}

function PaidTrafficSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Trafego pago com logica de receita" title={sectionMeta['trafego-pago'].title} description={sectionMeta['trafego-pago'].description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.paidTraffic.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Leitura de eficiencia por intencao, nao apenas volume."
            tone={index === 0 ? 'purple' : index === 1 ? 'green' : index === 2 ? 'amber' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel>
          <SectionTitle title="Campanhas Google Ads" description="Estrutura premium com campanhas por intencao comercial." />
          <DataTable
            headers={['Campanha', 'Intencao', 'Budget', 'Leads', 'CPL', 'ROAS', 'Status']}
            rows={data.paidTraffic.campaigns.map((item) => [
              <span key="n" className="font-semibold text-white">{item.name}</span>,
              item.intent,
              item.budget,
              <span key="l" className="text-emerald-300">{item.leads}</span>,
              item.cpl,
              <span key="r" className="text-zinc-100">{item.roas}</span>,
              <span key="s" className="lr-badge">{item.status}</span>,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Funil pago" description="Da demanda impressa ate a oportunidade real no WhatsApp." />
          <FunnelBars points={data.paidTraffic.funnel} />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Por que vale investir" description="A campanha certa reduz ociosiade, protege marca e abre novas ocasioes de compra." />
          <BulletList items={data.paidTraffic.scaleNotes} />
        </Panel>
        <Panel>
          <SectionTitle title="Tese de escala" description="Quando a operacao esta pronta, midia paga deixa de ser custo e vira acelerador de receita." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: <Landmark size={18} />, title: 'Marca', text: 'Capta demanda existente e impede perda para agregadores e concorrentes.' },
              { icon: <Compass size={18} />, title: 'Perto de mim', text: 'Explora descoberta local em horarios de decisao imediata.' },
              { icon: <CalendarHeart size={18} />, title: 'Eventos', text: 'Aumenta ticket e previsibilidade com uma esteira dedicada.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-3 text-red-300">{item.icon}</div>
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function CrmSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Retencao e base propria" title={sectionMeta.crm.title} description={sectionMeta.crm.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.crm.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Base propria reduz dependencia exclusiva de midia e plataformas."
            tone={index === 0 ? 'green' : index === 1 ? 'red' : index === 2 ? 'purple' : 'blue'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[0.8fr_1fr_1fr]">
        <Panel>
          <SectionTitle title="Novos vs recorrentes" description="A boa operacao de restaurante precisa equilibrar descoberta e retorno." />
          <ProgressList items={data.crm.customerMix} />
        </Panel>
        <Panel>
          <SectionTitle title="Jornadas automatizadas de CRM" description="Blocos que transformam base em visitas repetidas e reviews positivos." />
          <MiniBars points={data.crm.lifecycle} color="#22C55E" />
        </Panel>
        <Panel>
          <SectionTitle title="Funil de leads" description="Acompanhamento rapido da esteira comercial de captura e fechamento." />
          <FunnelBars points={data.crm.leadFunnel} />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Jogadas com maior impacto" description="Fluxos de CRM que fazem sentido para restaurante local premium." />
          <BulletList items={data.crm.plays} />
        </Panel>
        <Panel>
          <SectionTitle title="Leitura comercial" description="A LocalRise nao entrega apenas campanha; entrega frequencia, recorrencia e previsibilidade." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Aniversarios', icon: <CalendarHeart size={18} />, text: 'Transforma datas em mesas reservadas e upsell de experiencia.' },
              { title: 'Pos-visita', icon: <MessageSquareText size={18} />, text: 'Converte boa experiencia em review, lembranca de marca e retorno.' },
              { title: 'Reativacao', icon: <Users size={18} />, text: 'Recupera clientes frios antes que a marca saia do radar.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-3 text-emerald-300">{item.icon}</div>
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function AutomationsSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Operacao assistida por IA" title={sectionMeta.automacoes.title} description={sectionMeta.automacoes.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.automations.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Automacao bem desenhada protege SLA, reputacao e receita."
            tone={index === 0 ? 'purple' : index === 1 ? 'green' : index === 2 ? 'amber' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Panel>
          <SectionTitle title="Painel de fluxos ativos" description="Cada fluxo tem cobertura, papel claro e resultado mensuravel." />
          <DataTable
            headers={['Fluxo', 'Status', 'Cobertura', 'Resultado']}
            rows={data.automations.flows.map((flow) => [
              <span key="n" className="font-semibold text-white">{flow.name}</span>,
              <span key="s" className="lr-badge">{flow.status}</span>,
              flow.coverage,
              flow.result,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Distribuicao operacional com IA" description="O objetivo nao e so responder mais rapido, mas escalar sem perder contexto." />
          <ProgressList items={data.automations.aiOps} />
          <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-red-300">
              <Bot size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Copilot LocalRise</span>
            </div>
            <p className="text-sm leading-6 text-zinc-300">
              Reviews sensiveis, intencao de evento e sinais de churn sao priorizados automaticamente para acao humana imediata.
            </p>
          </div>
        </Panel>
      </div>
      <InsightRail data={data} />
    </>
  )
}

function ReputationSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Reputacao como motor de conversao" title={sectionMeta.reputacao.title} description={sectionMeta.reputacao.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.reputation.metrics.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Reputacao afeta clique, rota, reserva e decisao final."
            tone={index === 0 ? 'amber' : index === 1 ? 'green' : index === 2 ? 'red' : 'purple'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <SectionTitle title="Sentimento das avaliacoes" description="Visao sintetica do humor da base de reviews." />
          <ProgressList items={data.reputation.sentiment} />
        </Panel>
        <Panel>
          <SectionTitle title="Temas mais citados" description="O que aparece com mais frequencia nas avaliacoes." />
          <ProgressList items={data.reputation.themes} />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Alertas criticos" description="Pontos de atencao que pedem acao tatica." />
          <BulletList items={data.reputation.alerts} />
        </Panel>
        <Panel>
          <SectionTitle title="Oportunidade de resposta com IA" description="A IA organiza, sugere tom e acelera resposta sem comprometer a marca." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Filtro', text: 'Classifica positivo, neutro e negativo para priorizar fila.' },
              { title: 'Sugestao', text: 'Propoe resposta com contexto e tom compativel com a marca.' },
              { title: 'Escalada', text: 'Encaminha casos criticos para operacao ou lideranca.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="mt-6">
        <Panel>
          <SectionTitle title="Fila de reviews" description="Exemplos de contexto, sentimento e proxima resposta sugerida." />
          <DataTable
            headers={['Cliente', 'Quando', 'Nota', 'Canal', 'Tom', 'Proxima acao']}
            rows={data.reputation.reviewFeed.map((item) => [
              <span key="author" className="font-semibold text-white">{item.author}</span>,
              item.when,
              <span key="rating" className="text-amber-300">{item.rating}</span>,
              item.channel,
              <span key="sentiment" className="text-zinc-100">{item.sentiment}</span>,
              <span key="response" className="text-emerald-300">{item.response}</span>,
            ])}
          />
        </Panel>
      </div>
    </>
  )
}

function EventsSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Linha de receita de alto ticket" title={sectionMeta.eventos.title} description={sectionMeta.eventos.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.events.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Eventos trazem ticket alto e excelente previsibilidade de agenda."
            tone={index === 0 ? 'blue' : index === 1 ? 'amber' : index === 2 ? 'green' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel>
          <SectionTitle title="Pipeline de eventos" description="Do lead de briefing ao fechamento comercial." />
          <FunnelBars points={data.events.pipeline} />
        </Panel>
        <Panel>
          <SectionTitle title="Mix de oportunidade mensal" description="Onde a operacao de eventos deve concentrar discurso e oferta." />
          <ProgressList items={data.events.opportunities} />
        </Panel>
      </div>
      <Panel>
        <SectionTitle title="Leitura da oportunidade" description="Por que eventos merecem tratamento como produto dentro do restaurante." badge="High ticket" />
        <p className="max-w-4xl text-sm leading-7 text-zinc-300">{data.events.note}</p>
      </Panel>
    </>
  )
}

function SystemSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Narrativa comercial LocalRise" title={sectionMeta['sistema-localrise'].title} description={sectionMeta['sistema-localrise'].description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionTitle title="O que esta demo representa" description="Nao e um painel para impressionar superficialmente. E uma proposta de sistema." />
          <p className="max-w-3xl text-sm leading-7 text-zinc-300">
            A LocalRise posiciona o restaurante como uma operacao guiada por demanda, dados e recorrencia. Em vez de enxergar marketing como posts isolados ou midia sem contexto, o sistema organiza aquisicao, conversao, retencao e reputacao em uma unica camada de gestao.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.systemPillars.map((pillar) => (
              <div key={pillar.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-2 text-base font-bold text-white">{pillar.title}</div>
                <p className="text-sm leading-6 text-zinc-300">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Leitura executiva" description="Como vender o sistema para o decisor do restaurante." />
          <BulletList
            items={[
              'A LocalRise aumenta visibilidade e transforma procura em reservas e eventos.',
              'O CRM reduz dependencia de compra unica e aumenta frequencia de retorno.',
              'IA e automacao organizam atendimento, reviews e follow-up sem inflar equipe.',
              'O dashboard conecta tudo em uma linguagem de gestao, nao de vanity metrics.',
            ]}
          />
        </Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Aquisicao', icon: <Search size={18} />, text: 'Captura busca local, Maps e intencao imediata.' },
          { title: 'Conversao', icon: <MessagesSquare size={18} />, text: 'WhatsApp, paginas e follow-up com menos friccao.' },
          { title: 'Retencao', icon: <ShieldCheck size={18} />, text: 'Campanhas de retorno, aniversario e reativacao.' },
          { title: 'Previsibilidade', icon: <TrendingUp size={18} />, text: 'Dados integrados para entender o que move receita.' },
        ].map((item) => (
          <Panel key={item.title}>
            <div className="mb-3 text-red-300">{item.icon}</div>
            <div className="text-lg font-bold tracking-tight text-white">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
          </Panel>
        ))}
      </div>
    </>
  )
}

export function DemoDashboardPage({
  section,
  basePath = '/dashboard',
  data,
  isOnboarding = false,
}: {
  section: DashboardSection
  basePath?: string
  data: DashboardData
  /** Quando true, o cliente existe mas ainda não tem métricas reais — exibe o checklist */
  isOnboarding?: boolean
}) {
  if (isOnboarding) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6 xl:px-8">
        <div className="mx-auto max-w-[1400px]">
          <OnboardingChecklist />
        </div>
      </div>
    )
  }

  // ── Estado de período ─────────────────────────────────────────────────────
  // `period` controla o período exibido no badge, no título e nos cards de KPI.
  // Quando a integração real com o banco estiver ativa, passe `period` como
  // parâmetro nas chamadas de dados (ver TODO nos cards de KPI e sections).
  // ─────────────────────────────────────────────────────────────────────────
  const [period, setPeriod] = useState<PeriodOption>(PERIOD_OPTIONS[0])

  // Override do restaurant.period para refletir a seleção do usuário.
  // Todas as sections recebem `displayData` em vez de `data`, então o badge
  // dentro de ExecutiveStrip atualiza automaticamente sem mudar nenhuma section.
  const displayData: DashboardData = {
    ...data,
    restaurant: { ...data.restaurant, period: period.badgeLabel },
  }

  const topCards = [
    { label: 'Receita acompanhada', value: displayData.overview.kpis[0]?.value ?? 'R$ 0', icon: <CircleDollarSign size={18} /> },
    { label: 'Canal mais forte', value: strongestSourceLabel(displayData), icon: <Search size={18} /> },
    { label: 'Alavanca do mes', value: strongestOpportunityLabel(displayData), icon: <Crown size={18} /> },
    { label: 'Modo de operacao', value: 'Supabase + IA + midia', icon: <ClipboardCheck size={18} /> },
  ]

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 xl:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* Cabeçalho: título dinâmico + seletor de período */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
            <h1 className="text-xl font-black tracking-tight text-white">
              Resultados de {period.badgeLabel}
            </h1>
          </div>
          {/* TODO: ao conectar ao banco, passe `period` como parâmetro nas
              chamadas de fetchMetrics para filtrar os dados pelo intervalo.
              Ex: fetchMetrics({ from: period.from, to: period.to, key: period.key }) */}
          <PeriodSelector selected={period} onSelect={setPeriod} />
        </div>

        {/* Navegação entre seções */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {sectionLinks.map((item) => {
            const href = item.key === 'overview' ? basePath : `${basePath}/${item.key}`
            const active = item.key === section
            return (
              <Link
                key={item.key}
                href={href}
                className="whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
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

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topCards.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="mb-2 text-red-300">{item.icon}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
              <div className="mt-2 text-lg font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>

        {section === 'overview' && <OverviewSection data={displayData} />}
        {section === 'aquisicao' && <AcquisitionSection data={displayData} />}
        {section === 'trafego-pago' && <PaidTrafficSection data={displayData} />}
        {section === 'crm' && <CrmSection data={displayData} />}
        {section === 'automacoes' && <AutomationsSection data={displayData} />}
        {section === 'reputacao' && <ReputationSection data={displayData} />}
        {section === 'eventos' && <EventsSection data={displayData} />}
        {section === 'sistema-localrise' && <SystemSection data={displayData} />}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Produto demonstravel',
              text: 'A narrativa deixa de ser fazer marketing e passa a ser operar crescimento.',
              icon: <HandCoins size={18} />,
            },
            {
              title: 'Base preparada para integracao',
              text: 'Todos os blocos ja tem estrutura clara para receber dados de Supabase, GA4, Ads, WhatsApp e CRM.',
              icon: <Activity size={18} />,
            },
            {
              title: 'Clareza comercial',
              text: 'Cada pagina explica valor de negocio, nao apenas numero isolado.',
              icon: <Sparkles size={18} />,
            },
          ].map((item) => (
            <Panel key={item.title}>
              <div className="mb-3 text-red-300">{item.icon}</div>
              <div className="text-base font-bold text-white">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}


