import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { DashboardData, DashboardDataSource, DashboardRequest, SourceItem } from '@/lib/dashboard/contracts'
import { donAurelioDemoData } from '@/lib/dashboard/mock-data'

type NumericMetricRow = {
  mes: number
  ano: number
  [key: string]: string | number | null | undefined
}

type ClientRecord = {
  id: string
  name: string
  cidade?: string | null
  nicho?: string | null
}

const DEFAULT_DEMO_SLUG = 'don-aurelio-prime-grill'

export type DashboardResult = {
  data: DashboardData
  /** true quando o cliente existe no banco mas ainda não tem métricas reais coletadas */
  isOnboarding: boolean
}

export interface DashboardSource {
  getRestaurantDashboard(request: DashboardRequest): Promise<DashboardResult>
}

class MockDashboardSource implements DashboardSource {
  async getRestaurantDashboard(): Promise<DashboardResult> {
    return { data: donAurelioDemoData, isOnboarding: false }
  }
}

class SupabaseDashboardSource implements DashboardSource {
  async getRestaurantDashboard(request: DashboardRequest): Promise<DashboardResult> {
    try {
      const authSupabase = await createClient()
      const dataSupabase = createAdminClient()
      const client = await resolveClientRecord(authSupabase, dataSupabase, request)

      // Sem cliente associado: admin vendo demo ou usuário sem perfil — não é onboarding
      if (!client) return { data: donAurelioDemoData, isOnboarding: false }

      const [{ data: gbp }, { data: site }, { data: ads }, { data: instagram }] = await Promise.all([
        dataSupabase
          .from('metrics_gbp')
          .select('*')
          .eq('client_id', client.id)
          .order('ano', { ascending: true })
          .order('mes', { ascending: true }),
        dataSupabase
          .from('metrics_site')
          .select('*')
          .eq('client_id', client.id)
          .order('ano', { ascending: true })
          .order('mes', { ascending: true }),
        dataSupabase
          .from('metrics_ads')
          .select('*')
          .eq('client_id', client.id)
          .order('ano', { ascending: true })
          .order('mes', { ascending: true }),
        dataSupabase
          .from('metrics_instagram')
          .select('*')
          .eq('client_id', client.id)
          .order('ano', { ascending: true })
          .order('mes', { ascending: true }),
      ])

      const metrics = {
        gbp: sanitizeRows(gbp ?? []),
        site: sanitizeRows(site ?? []),
        ads: sanitizeRows(ads ?? []),
        instagram: sanitizeRows(instagram ?? []),
      }

      // Cliente existe mas ainda não tem métricas → exibe checklist de onboarding
      if (!hasMeaningfulMetrics(metrics)) {
        return { data: donAurelioDemoData, isOnboarding: true }
      }

      return {
        data: buildDashboardFromMetrics({
          client,
          gbp: metrics.gbp,
          site: metrics.site,
          ads: metrics.ads,
          instagram: metrics.instagram,
        }),
        isOnboarding: false,
      }
    } catch {
      return { data: donAurelioDemoData, isOnboarding: false }
    }
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function resolveConfiguredDemoSlug() {
  return process.env.LOCALRISE_DEMO_RESTAURANT_SLUG || DEFAULT_DEMO_SLUG
}

async function findClientBySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
) {
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, cidade, nicho')
    .order('created_at', { ascending: false })

  return (clients as ClientRecord[] | null)?.find((client) => slugify(client.name) === slug) ?? null
}

async function resolveClientRecord(
  authSupabase: Awaited<ReturnType<typeof createClient>>,
  dataSupabase: ReturnType<typeof createAdminClient>,
  request: DashboardRequest
) {
  if (request.restaurantSlug) {
    return findClientBySlug(dataSupabase, request.restaurantSlug)
  }

  const { data: auth } = await authSupabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) return findClientBySlug(dataSupabase, resolveConfiguredDemoSlug())

  const { data: profile } = await authSupabase
    .from('profiles')
    .select('client_id, clients(id, name, cidade, nicho)')
    .eq('id', userId)
    .single()

  const client = profile?.clients as ClientRecord | null | undefined
  if (client?.id) return client

  if (profile?.client_id) {
    const { data: directClient } = await dataSupabase
      .from('clients')
      .select('id, name, cidade, nicho')
      .eq('id', profile.client_id)
      .single()
    if (directClient) return directClient as ClientRecord
  }

  if (auth.user?.user_metadata?.role === 'admin') {
    return findClientBySlug(dataSupabase, resolveConfiguredDemoSlug())
  }

  return null
}

function latest<T extends NumericMetricRow>(rows: T[]) {
  return rows.at(-1) ?? null
}

function previous<T extends NumericMetricRow>(rows: T[]) {
  return rows.at(-2) ?? null
}

function numberValue(value: string | number | null | undefined) {
  return typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0
}

function percentDelta(current: number, prior: number) {
  if (!current || !prior) return '0%'
  const delta = ((current - prior) / prior) * 100
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(1)}%`
}

function signedDelta(current: number, prior: number, digits = 1) {
  const delta = current - prior
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(digits)}`
}

function formatInThousands(value: number, decimals = 1) {
  return `${(value / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} mil`
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} mil`
}

function toCurrencyBRL(value: number, digits = 0) {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

function periodLabel(month: number, year: number) {
  const monthLabels = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  return `${monthLabels[month - 1] ?? `M${month}`} ${year}`
}

function sanitizeRows<T extends NumericMetricRow>(rows: T[]) {
  return rows
    .filter((row) => typeof row.mes === 'number' && typeof row.ano === 'number')
    .sort((left, right) => left.ano - right.ano || left.mes - right.mes)
}

function hasMeaningfulMetrics({
  gbp,
  site,
  ads,
  instagram,
}: {
  gbp: NumericMetricRow[]
  site: NumericMetricRow[]
  ads: NumericMetricRow[]
  instagram: NumericMetricRow[]
}) {
  const watchedFields = {
    gbp: ['visualizacoes_maps', 'visualizacoes_busca', 'cliques_ligar', 'cliques_rota', 'total_reviews'],
    site: ['sessoes', 'usuarios', 'pageviews', 'cliques_organicos', 'impressoes_organicas'],
    ads: ['impressoes', 'cliques', 'investimento', 'conversoes'],
    instagram: ['seguidores', 'alcance', 'impressoes', 'visitas_perfil'],
  } as const

  return [gbp, site, ads, instagram].some((rows, index) => {
    const fields = Object.values(watchedFields)[index]
    return rows.some((row) => fields.some((field) => numberValue(row[field]) > 0))
  })
}

function buildSourceMix(
  currentGbp: NumericMetricRow | null,
  currentSite: NumericMetricRow | null,
  currentAds: NumericMetricRow | null,
  currentInstagram: NumericMetricRow | null
): SourceItem[] {
  const googleOrganic =
    Math.round(numberValue(currentSite?.cliques_organicos) * 0.28) +
    Math.round(numberValue(currentGbp?.cliques_site) * 0.8) +
    Math.round(numberValue(currentGbp?.cliques_rota) * 1.2) +
    Math.round(numberValue(currentGbp?.cliques_ligar) * 1.6)
  const googleAds =
    Math.round(numberValue(currentAds?.cliques) * 0.18) +
    Math.round(numberValue(currentAds?.conversoes) * 3)
  const instagram =
    Math.round(numberValue(currentInstagram?.visitas_perfil) * 0.35) +
    Math.round(numberValue(currentInstagram?.alcance) * 0.01) +
    Math.round(numberValue(currentInstagram?.salvamentos) * 1.4)
  const directBase =
    Math.round(numberValue(currentGbp?.cliques_ligar) * 1.4) +
    Math.round(numberValue(currentGbp?.novos_reviews) * 1.8)
  const events = Math.max(120, Math.round(numberValue(currentAds?.conversoes) * 1.5))
  const total = googleOrganic + googleAds + instagram + directBase + events || 1

  return [
    { label: 'Google organico + Maps', value: Math.round((googleOrganic / total) * 100), color: '#E31B23' },
    { label: 'Google Ads', value: Math.round((googleAds / total) * 100), color: '#A855F7' },
    { label: 'Instagram', value: Math.round((instagram / total) * 100), color: '#3B82F6' },
    { label: 'WhatsApp base propria', value: Math.round((directBase / total) * 100), color: '#22C55E' },
    {
      label: 'Eventos e indicacoes',
      value: Math.max(
        1,
        100 -
          Math.round((googleOrganic / total) * 100) -
          Math.round((googleAds / total) * 100) -
          Math.round((instagram / total) * 100) -
          Math.round((directBase / total) * 100)
      ),
      color: '#F59E0B',
    },
  ]
}

function computeBookings(row: NumericMetricRow | null) {
  return numberValue(row?.conversoes)
}

function computeOrganicBookings(siteRow: NumericMetricRow | null) {
  return Math.round(numberValue(siteRow?.cliques_organicos) * 0.09)
}

function computeMapBookings(gbpRow: NumericMetricRow | null) {
  return Math.round(numberValue(gbpRow?.cliques_rota) * 0.15)
}

function computeAttributedRevenue(
  gbpRow: NumericMetricRow | null,
  siteRow: NumericMetricRow | null,
  adsRow: NumericMetricRow | null
) {
  const bookings = computeBookings(adsRow) + computeOrganicBookings(siteRow) + computeMapBookings(gbpRow)
  return Number((bookings * 0.42).toFixed(1))
}

function buildRevenueTrendFromSignals({
  gbp,
  site,
  ads,
}: {
  gbp: NumericMetricRow[]
  site: NumericMetricRow[]
  ads: NumericMetricRow[]
}) {
  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const lastSix = site.slice(-6)

  return lastSix.map((siteRow) => {
    const gbpRow = gbp.find((row) => row.ano === siteRow.ano && row.mes === siteRow.mes) ?? null
    const adsRow = ads.find((row) => row.ano === siteRow.ano && row.mes === siteRow.mes) ?? null
    return {
      label: monthLabels[siteRow.mes - 1] ?? `M${siteRow.mes}`,
      value: Math.round(computeAttributedRevenue(gbpRow, siteRow, adsRow) * 1000),
    }
  })
}

function buildReviewFeed(
  clientName: string,
  averageRating: number,
  totalReviews: number,
  newReviews: number,
  mapsViews: number
) {
  const displayRating = averageRating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return [
    {
      author: 'Marina K.',
      rating: displayRating,
      when: '03 Abr',
      channel: 'Google',
      sentiment: 'Positivo',
      text: `${clientName} foi muito elogiado por atendimento e ambiente. O volume de avaliações novas já chegou a ${newReviews.toLocaleString('pt-BR')} no período.`,
      response: 'Respondido em 24 min',
    },
    {
      author: 'Eduardo P.',
      rating: `${Math.max(4, averageRating - 0.6).toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}`,
      when: '01 Abr',
      channel: 'Google',
      sentiment: 'Neutro',
      text: `Cliente valorizou a qualidade do prato, mas pediu mais agilidade na recepção. Base total atual: ${totalReviews.toLocaleString('pt-BR')} reviews.`,
      response: 'Resposta sugerida por IA',
    },
    {
      author: 'Fernanda S.',
      rating: `${Math.max(3.8, averageRating - 1).toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}`,
      when: '29 Mar',
      channel: 'Google',
      sentiment: 'Critico',
      text: `Pico de visitas no Maps (${mapsViews.toLocaleString('pt-BR')}) aumentou pressão operacional nas noites de sexta. Caso precisa de resposta rápida.`,
      response: 'Escalado para operação',
    },
  ]
}

function buildActionPlan({
  organicClicks,
  paidConversions,
  averageRating,
  newReviews,
}: {
  organicClicks: number
  paidConversions: number
  averageRating: number
  newReviews: number
}) {
  return [
    {
      title: `Expandir SEO local para transformar ${organicClicks.toLocaleString('pt-BR')} cliques organicos em mais reservas de categoria.`,
      owner: 'SEO local',
      due: '7 dias',
      impact: 'Mais descoberta sem depender apenas de marca.',
    },
    {
      title: `Escalar a estrutura de Google Ads que hoje já entrega ${paidConversions.toLocaleString('pt-BR')} conversoes com leitura comercial.`,
      owner: 'Media paga',
      due: '10 dias',
      impact: 'Aumenta cobertura em demanda quente e horários ociosos.',
    },
    {
      title: `Blindar reputacao em torno de ${averageRating.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} com rotina de resposta e meta de +${newReviews.toLocaleString('pt-BR')} novas reviews.`,
      owner: 'Reputação + operação',
      due: '14 dias',
      impact: 'Melhora clique, rota e conversão final no Maps.',
    },
  ]
}

function buildDashboardFromMetrics({
  client,
  gbp,
  site,
  ads,
  instagram,
}: {
  client: ClientRecord
  gbp: NumericMetricRow[]
  site: NumericMetricRow[]
  ads: NumericMetricRow[]
  instagram: NumericMetricRow[]
}): DashboardData {
  const base = structuredClone(donAurelioDemoData)

  const currentGbp = latest(gbp)
  const previousGbp = previous(gbp)
  const currentSite = latest(site)
  const previousSite = previous(site)
  const currentAds = latest(ads)
  const previousAds = previous(ads)
  const currentInstagram = latest(instagram)
  const currentPeriod = currentSite ?? currentGbp ?? currentAds ?? currentInstagram

  const paidConversions = numberValue(currentAds?.conversoes)
  const paidInvestment = numberValue(currentAds?.investimento)
  const organicClicks = numberValue(currentSite?.cliques_organicos)
  const siteSessions = numberValue(currentSite?.sessoes)
  const totalReviews = numberValue(currentGbp?.total_reviews) || 1284
  const newReviews = numberValue(currentGbp?.novos_reviews) || 93
  const averageRating = numberValue(currentGbp?.nota) || 4.8
  const instagramProfileVisits = numberValue(currentInstagram?.visitas_perfil)
  const mapsViews = numberValue(currentGbp?.visualizacoes_maps)
  const searchViews = numberValue(currentGbp?.visualizacoes_busca)
  const bookings = paidConversions + computeOrganicBookings(currentSite) + computeMapBookings(currentGbp)
  const priorBookings =
    numberValue(previousAds?.conversoes) + computeOrganicBookings(previousSite) + computeMapBookings(previousGbp)
  const leads =
    paidConversions +
    Math.round(numberValue(currentGbp?.cliques_ligar) * 0.24) +
    Math.round(instagramProfileVisits * 0.04)
  const priorLeads =
    numberValue(previousAds?.conversoes) +
    Math.round(numberValue(previousGbp?.cliques_ligar) * 0.24) +
    Math.round(numberValue(previous(instagram)?.visitas_perfil) * 0.04)
  const reactivated = Math.max(18, Math.round(instagramProfileVisits * 0.015))
  const revenueEstimate = computeAttributedRevenue(currentGbp, currentSite, currentAds)
  const priorRevenueEstimate = computeAttributedRevenue(previousGbp, previousSite, previousAds)

  base.restaurant = {
    ...base.restaurant,
    slug: slugify(client.name),
    name: client.name,
    city: client.cidade ?? base.restaurant.city,
    segment: client.nicho
      ? `${client.nicho} | operacao demonstrativa LocalRise`
      : base.restaurant.segment,
    period: currentPeriod ? periodLabel(currentPeriod.mes, currentPeriod.ano) : base.restaurant.period,
    healthScore: Math.min(
      97,
      Math.max(64, Math.round(averageRating * 18 + paidConversions * 0.8 + organicClicks / 250))
    ),
    growthMessage: percentDelta(bookings || 1, Math.max(1, priorBookings)),
  }

  base.overview.kpis = [
    {
      label: 'Faturamento estimado atribuido',
      value: formatCurrency(revenueEstimate),
      delta: percentDelta(revenueEstimate, Math.max(1, priorRevenueEstimate)),
      tone: 'red',
      footnote: 'Estimativa calculada a partir de reservas, leads e conversoes registradas',
    },
    {
      label: 'Reservas geradas',
      value: bookings.toLocaleString('pt-BR'),
      delta: percentDelta(bookings, Math.max(1, priorBookings)),
      tone: 'green',
      footnote: 'Sinal combinado de Google, site, Maps e campanhas',
    },
    {
      label: 'Leads captados',
      value: leads.toLocaleString('pt-BR'),
      delta: percentDelta(leads, Math.max(1, priorLeads)),
      tone: 'blue',
      footnote: 'Contatos estimados via intencao comercial e canais de captura',
    },
    {
      label: 'Clientes reativados',
      value: reactivated.toLocaleString('pt-BR'),
      delta: `+${Math.max(3, Math.round(reactivated * 0.12))}%`,
      tone: 'purple',
      footnote: 'Campo ainda com logica derivada; integrar CRM real depois',
    },
    {
      label: 'Avaliacoes recebidas',
      value: newReviews.toLocaleString('pt-BR'),
      delta: percentDelta(newReviews, Math.max(1, numberValue(previousGbp?.novos_reviews))),
      tone: 'amber',
      footnote: 'Originadas do Google Business Profile',
    },
    {
      label: 'Nota media',
      value: averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      delta: signedDelta(averageRating, numberValue(previousGbp?.nota) || 4.6, 1),
      tone: 'amber',
      footnote: 'Media atual do perfil Google',
    },
    {
      label: 'Trafego organico estimado',
      value: formatInThousands(siteSessions),
      delta: percentDelta(siteSessions, Math.max(1, numberValue(previousSite?.sessoes))),
      tone: 'green',
      footnote: 'Baseado em sessoes e descoberta organica do periodo',
    },
    {
      label: 'Trafego pago estimado',
      value: formatInThousands(numberValue(currentAds?.cliques)),
      delta: percentDelta(numberValue(currentAds?.cliques), Math.max(1, numberValue(previousAds?.cliques))),
      tone: 'purple',
      footnote: 'Cliques de campanha com foco comercial',
    },
  ]

  if (site.length > 0) {
    base.overview.revenueTrend = buildRevenueTrendFromSignals({ gbp, site, ads })
  }
  base.overview.sourceMix = buildSourceMix(currentGbp, currentSite, currentAds, currentInstagram)

  base.acquisition.performance = [
    {
      label: 'Cliques organicos no Google',
      value: organicClicks.toLocaleString('pt-BR'),
      delta: percentDelta(organicClicks, Math.max(1, numberValue(previousSite?.cliques_organicos))),
    },
    {
      label: 'Buscas nao-branded capturadas',
      value: `${Math.max(35, Math.min(82, Math.round((organicClicks / Math.max(1, organicClicks + searchViews)) * 100)))}%`,
      delta: '+6 p.p.',
    },
    {
      label: 'Solicitacoes de rota no GBP',
      value: numberValue(currentGbp?.cliques_rota).toLocaleString('pt-BR'),
      delta: percentDelta(numberValue(currentGbp?.cliques_rota), Math.max(1, numberValue(previousGbp?.cliques_rota))),
    },
    {
      label: 'Ligacoes originadas do Maps',
      value: numberValue(currentGbp?.cliques_ligar).toLocaleString('pt-BR'),
      delta: percentDelta(
        numberValue(currentGbp?.cliques_ligar),
        Math.max(1, numberValue(previousGbp?.cliques_ligar))
      ),
    },
  ]

  base.acquisition.googleBusinessProfile = {
    rating: averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    reviews: totalReviews.toLocaleString('pt-BR'),
    newReviews: newReviews.toLocaleString('pt-BR'),
    photos: `${formatInThousands(mapsViews + searchViews)} visualizacoes`,
    mapsViews: formatInThousands(mapsViews),
    searchViews: formatInThousands(searchViews),
    highlights: [
      `Maps concentrou ${mapsViews.toLocaleString('pt-BR')} visualizacoes no periodo atual.`,
      `Cliques em rota e ligacoes somaram ${(
        numberValue(currentGbp?.cliques_rota) + numberValue(currentGbp?.cliques_ligar)
      ).toLocaleString('pt-BR')} interacoes de alta intencao.`,
      'O Search Console ainda pode enriquecer a leitura de categoria, mas a demo já mostra demanda real no ecossistema Google.',
    ],
  }

  base.paidTraffic.summary = [
    {
      label: 'Investimento total',
      value: toCurrencyBRL(paidInvestment, 2),
      delta: percentDelta(paidInvestment, Math.max(1, numberValue(previousAds?.investimento))),
    },
    {
      label: 'Leads estimados',
      value: paidConversions.toLocaleString('pt-BR'),
      delta: percentDelta(paidConversions, Math.max(1, numberValue(previousAds?.conversoes))),
    },
    {
      label: 'Custo por lead',
      value: toCurrencyBRL(numberValue(currentAds?.custo_por_conversao), 2),
      delta: percentDelta(
        numberValue(previousAds?.custo_por_conversao) || 1,
        Math.max(1, numberValue(currentAds?.custo_por_conversao))
      ),
    },
    {
      label: 'Oportunidade de escala',
      value: toCurrencyBRL(Math.round(paidConversions * 420), 0),
      delta: 'com dados reais',
    },
  ]

  if (ads.length > 0) {
    base.paidTraffic.funnel = [
      { label: 'Impressoes', value: Math.round(numberValue(currentAds?.impressoes)) },
      { label: 'Cliques', value: Math.round(numberValue(currentAds?.cliques)) },
      { label: 'Conversas no WhatsApp', value: Math.max(1, Math.round(numberValue(currentAds?.cliques) * 0.08)) },
      { label: 'Leads qualificados', value: Math.round(paidConversions) },
      { label: 'Reservas ou propostas', value: Math.max(1, Math.round(paidConversions * 0.53)) },
    ]
  }

  base.paidTraffic.scaleNotes = [
    `Investimento atual de ${toCurrencyBRL(paidInvestment, 2)} com ${paidConversions.toLocaleString('pt-BR')} conversoes registradas em Ads.`,
    'A estrutura de campanhas por intenção segue mockada na narrativa, mas agora é ancorada em performance real de demo via Supabase.',
    'A demo preserva o storytelling comercial sem depender de números estáticos no frontend.',
  ]

  base.crm.summary = [
    {
      label: 'Base captada no WhatsApp',
      value: `${Math.max(500, Math.round(leads * 12)).toLocaleString('pt-BR')} contatos`,
      delta: '+9%',
    },
    {
      label: 'Taxa de retorno',
      value: `${Math.max(18, Math.round((reactivated / Math.max(1, leads)) * 100))}%`,
      delta: '+4 p.p.',
    },
    {
      label: 'Campanhas disparadas',
      value: `${Math.max(6, Math.round(site.length * 1.5))}`,
      delta: 'estimado',
    },
    {
      label: 'Clientes recorrentes no periodo',
      value: `${Math.max(28, Math.round((reactivated / Math.max(1, bookings)) * 100))}%`,
      delta: '+5 p.p.',
    },
  ]

  base.crm.leadFunnel = [
    { label: 'Leads', value: Math.max(32, leads) },
    { label: 'Qualificados', value: Math.max(24, Math.round(leads * 0.58)) },
    { label: 'WhatsApp ativo', value: Math.max(18, Math.round(leads * 0.39)) },
    { label: 'Propostas', value: Math.max(8, Math.round(leads * 0.17)) },
    { label: 'Fechados', value: Math.max(4, Math.round(leads * 0.07)) },
  ]

  base.automations.summary = [
    {
      label: 'Automacoes ativas',
      value: `${Math.max(5, Math.round((paidConversions + leads) / 40))} fluxos`,
      delta: 'modelo hibrido',
    },
    {
      label: 'Respostas automaticas',
      value: `${Math.max(42, Math.round((numberValue(currentGbp?.cliques_ligar) / Math.max(1, leads)) * 100))}%`,
      delta: '+11 p.p.',
    },
    {
      label: 'Reviews filtradas com IA',
      value: `${newReviews.toLocaleString('pt-BR')} no mes`,
      delta: 'baseado em reviews reais',
    },
    {
      label: 'Recuperacao de inativos',
      value: toCurrencyBRL(reactivated * 180, 0),
      delta: '+12%',
    },
  ]

  base.reputation.metrics = [
    {
      label: 'Nota media',
      value: `${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`,
      delta: signedDelta(averageRating, numberValue(previousGbp?.nota) || averageRating, 1),
    },
    {
      label: 'Volume de reviews no mes',
      value: newReviews.toLocaleString('pt-BR'),
      delta: percentDelta(newReviews, Math.max(1, numberValue(previousGbp?.novos_reviews))),
    },
    {
      label: 'Alertas criticos',
      value: `${Math.max(1, Math.round(newReviews * 0.12))}`,
      delta: '-10%',
    },
    {
      label: 'Reviews com resposta IA sugerida',
      value: '100%',
      delta: 'copilot ativo',
    },
  ]

  base.reputation.alerts = [
    `Nota atual de ${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} com ${totalReviews.toLocaleString('pt-BR')} reviews totais.`,
    'As categorias de sentimento e temas ainda são derivadas por heurística comercial, mas já foram conectadas à leitura de volume do GBP.',
    'A próxima etapa natural é integrar reviews textuais reais sem trocar a UI da demo.',
  ]
  base.reputation.reviewFeed = buildReviewFeed(client.name, averageRating, totalReviews, newReviews, mapsViews)

  base.events.summary = [
    { label: 'Leads de eventos', value: `${Math.max(6, Math.round(leads * 0.18))}`, delta: '+24%' },
    { label: 'Orcamentos enviados', value: `${Math.max(4, Math.round(leads * 0.11))}`, delta: '+18%' },
    { label: 'Fechamentos', value: `${Math.max(2, Math.round(paidConversions * 0.08))}`, delta: '+1' },
    { label: 'Ticket medio estimado', value: toCurrencyBRL(Math.max(4800, Math.round(bookings * 38)), 0), delta: '+7%' },
  ]
  base.events.note = `A camada de eventos usa modelagem comercial derivada das métricas reais do Supabase para sustentar a narrativa de expansão de receita para ${client.name}.`

  base.actionPlan = buildActionPlan({
    organicClicks,
    paidConversions,
    averageRating,
    newReviews,
  })

  return base
}

export function resolveDashboardDataSource(source?: DashboardDataSource): DashboardSource {
  const selected = source ?? (process.env.LOCALRISE_DASHBOARD_SOURCE as DashboardDataSource | undefined) ?? 'mock'
  if (selected === 'supabase') return new SupabaseDashboardSource()
  return new MockDashboardSource()
}

export async function getRestaurantDashboard(request: DashboardRequest = {}): Promise<DashboardResult> {
  const source = resolveDashboardDataSource(request.source)
  return source.getRestaurantDashboard(request)
}
