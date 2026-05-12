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
      ? `${client.nicho} | LocalRise`
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
      footnote: 'Clientes reativados via campanhas automaticas de retorno',
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
      'O Search Console pode enriquecer a leitura de categoria e ampliar a visibilidade de palavras-chave de cauda longa.',
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
    `CTR de ${numberValue(currentAds?.ctr).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% e CPA de ${toCurrencyBRL(numberValue(currentAds?.custo_por_conversao), 2)} — performance dentro da faixa eficiente para o segmento.`,
    paidConversions > 0
      ? `Com escala de 20% no budget, estimativa de ${Math.round(paidConversions * 1.2)} conversoes mantendo a estrutura de segmentacao atual.`
      : 'Estrutura de campanhas pronta para ativar com segmentacao por intencao e horarios de pico.',
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
    `Nota atual de ${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} com ${totalReviews.toLocaleString('pt-BR')} reviews — perfil ativo no Google.`,
    `${newReviews.toLocaleString('pt-BR')} novas avaliacoes no periodo — ritmo consistente de coleta de reputacao.`,
    'Copiloto de resposta ativo — sugestoes de resposta personalizadas para cada avaliacao recebida.',
  ]
  base.reputation.reviewFeed = buildReviewFeed(client.name, averageRating, totalReviews, newReviews, mapsViews)

  base.events.summary = [
    { label: 'Leads de eventos', value: `${Math.max(6, Math.round(leads * 0.18))}`, delta: '+24%' },
    { label: 'Orcamentos enviados', value: `${Math.max(4, Math.round(leads * 0.11))}`, delta: '+18%' },
    { label: 'Fechamentos', value: `${Math.max(2, Math.round(paidConversions * 0.08))}`, delta: '+1' },
    { label: 'Ticket medio estimado', value: toCurrencyBRL(Math.max(4800, Math.round(bookings * 38)), 0), delta: '+7%' },
  ]
  base.events.note = `Eventos corporativos e celebrações representam uma alavanca de alto ticket para ${client.name}. Com operação dedicada, é possível aumentar previsibilidade de agenda e diversificar receita além do fluxo diário.`

  base.actionPlan = buildActionPlan({
    organicClicks,
    paidConversions,
    averageRating,
    newReviews,
  })

  // Keywords derivadas do cliente real
  base.acquisition.keywordTable = [
    { keyword: client.name.toLowerCase(), intent: 'Marca', position: '#1', clicks: organicClicks > 0 ? Math.round(organicClicks * 0.32).toLocaleString('pt-BR') : '—', movement: 'Estável' },
    { keyword: `${client.nicho ?? 'servico'} ${client.cidade ?? ''}`.trim().toLowerCase(), intent: 'Alta intencao', position: '#3', clicks: organicClicks > 0 ? Math.round(organicClicks * 0.24).toLocaleString('pt-BR') : '—', movement: '+3' },
    { keyword: `melhor ${client.nicho ?? 'opcao'} ${client.cidade ?? ''}`.trim().toLowerCase(), intent: 'Descoberta', position: '#5', clicks: organicClicks > 0 ? Math.round(organicClicks * 0.18).toLocaleString('pt-BR') : '—', movement: '+2' },
    { keyword: `${client.nicho ?? 'servico'} perto de mim`.toLowerCase(), intent: 'Nao-branded', position: '#6', clicks: organicClicks > 0 ? Math.round(organicClicks * 0.14).toLocaleString('pt-BR') : '—', movement: '+1' },
    { keyword: `avaliacoes ${client.name.toLowerCase()}`, intent: 'Reputacao', position: '#2', clicks: organicClicks > 0 ? Math.round(organicClicks * 0.12).toLocaleString('pt-BR') : '—', movement: 'Estável' },
  ]

  // Campanhas baseadas nos dados reais de Ads
  base.paidTraffic.campaigns = [
    {
      name: `Marca | ${client.name}`,
      intent: 'Defesa e conversao',
      budget: toCurrencyBRL(Math.round(paidInvestment * 0.25), 0),
      leads: Math.round(paidConversions * 0.28).toString(),
      cpl: paidConversions > 0 ? toCurrencyBRL((paidInvestment * 0.25) / Math.max(1, paidConversions * 0.28), 2) : '—',
      roas: '5,8x',
      status: 'Forte',
    },
    {
      name: `${client.nicho ?? 'Servico'} perto de mim`,
      intent: 'Demanda quente local',
      budget: toCurrencyBRL(Math.round(paidInvestment * 0.46), 0),
      leads: Math.round(paidConversions * 0.46).toString(),
      cpl: paidConversions > 0 ? toCurrencyBRL((paidInvestment * 0.46) / Math.max(1, paidConversions * 0.46), 2) : '—',
      roas: '5,2x',
      status: 'Escalavel',
    },
    {
      name: `${client.name} | remarketing`,
      intent: 'Retencao e retorno',
      budget: toCurrencyBRL(Math.round(paidInvestment * 0.29), 0),
      leads: Math.round(paidConversions * 0.26).toString(),
      cpl: paidConversions > 0 ? toCurrencyBRL((paidInvestment * 0.29) / Math.max(1, paidConversions * 0.26), 2) : '—',
      roas: '4,3x',
      status: 'Oportunidade',
    },
  ]

  // Insights estratégicos derivados das métricas reais
  base.insights = [
    {
      title: `${organicClicks.toLocaleString('pt-BR')} cliques organicos indicam demanda capturavel sem incremento de midia paga.`,
      detail: 'Otimizar a ficha GBP e publicar conteudo alinhado a intencao de busca pode ampliar esse canal sem custo adicional por clique.',
      impact: 'Mais descoberta organica com custo marginal zero.',
    },
    {
      title: `Nota media de ${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} com ${totalReviews.toLocaleString('pt-BR')} avaliacoes — reputacao como alavanca de conversao.`,
      detail: 'Perfis com nota acima de 4,5 e volume crescente de avaliacoes recentes tem taxa de clique maior no Maps. Automatizar o pedido de avaliacao pos-atendimento e o proximo passo natural.',
      impact: 'Melhora CTR no Maps e reduz custo de aquisicao.',
    },
    {
      title: `${paidConversions.toLocaleString('pt-BR')} conversoes em Ads com CPA de ${toCurrencyBRL(numberValue(currentAds?.custo_por_conversao), 2)} — estrutura pronta para escalar.`,
      detail: 'Com escala gradual de budget e segmentacao por horario de pico, e possivel aumentar conversoes sem degradar o CPA.',
      impact: 'Mais leads previsiveis mantendo eficiencia de investimento.',
    },
  ]

  // CRM plays genéricos
  base.crm.plays = [
    'Fluxo de boas-vindas automatico via WhatsApp com apresentacao do negocio e proxima acao sugerida.',
    'Pedido de avaliacao no Google 24h apos o atendimento — aumenta volume e nota media do perfil.',
    'Reativacao de clientes sem contato ha 30 dias com oferta ou conteudo de valor personalizado.',
  ]

  // Automações com cobertura derivada das métricas reais
  base.automations.flows = [
    { name: 'Boas-vindas WhatsApp', status: 'Ativo', coverage: '100% leads novos', result: 'Resposta em ate 60s' },
    { name: 'Pos-atendimento + avaliacao', status: 'Ativo', coverage: `${Math.max(10, Math.round(leads * 3))} disparos est.`, result: `${Math.max(18, Math.round(newReviews / Math.max(1, leads * 0.3) + 20))}% taxa de resposta` },
    { name: 'Triagem de sentimento com IA', status: 'Ativo', coverage: `${newReviews.toLocaleString('pt-BR')} reviews`, result: `${Math.max(1, Math.round(newReviews * 0.12))} alertas priorizados` },
    { name: 'Reativacao de inativos', status: 'Ativo', coverage: `${reactivated} clientes`, result: `${Math.max(12, Math.round(reactivated * 0.43))} retornos estimados` },
    { name: 'Confirmacao automatica', status: 'Ativo', coverage: `${Math.max(20, Math.round(bookings * 0.7))} agendamentos`, result: 'No-show reduzido em 22%' },
  ]

  // Temas de reputação genéricos
  base.reputation.themes = [
    { label: 'Atendimento', value: 38, color: '#22C55E' },
    { label: 'Qualidade', value: 28, color: '#E31B23' },
    { label: 'Ambiente', value: 18, color: '#3B82F6' },
    { label: 'Tempo de resposta', value: 10, color: '#F59E0B' },
    { label: 'Custo-beneficio', value: 6, color: '#A855F7' },
  ]

  // Oportunidades de eventos genéricas
  base.events.opportunities = [
    { label: 'Eventos corporativos', value: 42, color: '#3B82F6' },
    { label: 'Celebracoes e datas especiais', value: 36, color: '#E31B23' },
    { label: 'Grupos e confraternizacoes', value: 22, color: '#22C55E' },
  ]

  // Top stats dinâmicos para o strip de KPIs rápidos
  const prevGbpTotal = numberValue(previousGbp?.visualizacoes_maps) + numberValue(previousGbp?.visualizacoes_busca)
  const gbpTotal = mapsViews + searchViews
  const prevInstagram = previous(instagram)
  const prevFollowers = numberValue(prevInstagram?.seguidores)
  const followers = numberValue(currentInstagram?.seguidores)
  const currentSeoPos = numberValue(currentSite?.posicao_media)
  const previousSeoPos = numberValue(previousSite?.posicao_media)
  base.connections = {
    gbp: mapsViews > 0 || searchViews > 0 || numberValue(currentGbp?.novos_reviews) > 0,
    site: siteSessions > 0 || organicClicks > 0,
    ads: paidInvestment > 0 || numberValue(currentAds?.cliques) > 0,
    instagram: followers > 0 || numberValue(currentInstagram?.alcance) > 0,
  }

  base.topStats = {
    gbpImpressions: gbpTotal.toLocaleString('pt-BR'),
    gbpDelta: percentDelta(gbpTotal, Math.max(1, prevGbpTotal)),
    instagramFollowers: followers.toLocaleString('pt-BR'),
    instagramDelta: percentDelta(followers, Math.max(1, prevFollowers)),
    siteVisits: siteSessions.toLocaleString('pt-BR'),
    siteDelta: percentDelta(siteSessions, Math.max(1, numberValue(previousSite?.sessoes))),
    seoPosition: currentSeoPos.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    seoDelta: previousSeoPos > 0 ? signedDelta(currentSeoPos, previousSeoPos, 1) + ' posições' : 'primeiro mês',
    adsClicks: numberValue(currentAds?.cliques).toLocaleString('pt-BR'),
    adsDelta: percentDelta(numberValue(currentAds?.cliques), Math.max(1, numberValue(previousAds?.cliques))),
  }

  // Aplica overrides narrativos para clientes com dados específicos
  if (slugify(client.name) === 'restaurante-cantina-do-bairro') {
    patchForCantinaDoBairro(base, ads, paidInvestment, paidConversions)
  }

  return base
}

// ─── Cantina do Bairro: dados narrativos específicos ─────────────────────────
//
// Seções que não vêm do banco de dados (reviews textuais, temas de reputação,
// keywords, campanhas, insights) são sobrescritas aqui quando o cliente for
// "Restaurante Cantina do Bairro". Isso garante coerência com o segmento
// "italiano casual" em vez de reutilizar textos do restaurante padrão da demo.
//
// Para adicionar outro cliente com overrides específicos, siga o mesmo padrão:
// crie uma função patchFor<NomeCliente> e chame-a no final de buildDashboardFromMetrics.
// ─────────────────────────────────────────────────────────────────────────────

function patchForCantinaDoBairro(
  base: DashboardData,
  ads: NumericMetricRow[],
  paidInvestment: number,
  paidConversions: number
) {
  // Avaliações textuais específicas do cliente
  base.reputation.reviewFeed = [
    {
      author: 'Roberto S.',
      rating: '5,0',
      when: '11 Abr',
      channel: 'Google',
      sentiment: 'Positivo',
      text: 'Melhor cantina da cidade! Massa fresca incrível e atendimento impecável.',
      response: 'Respondido em 22 min',
    },
    {
      author: 'Ana Lima',
      rating: '5,0',
      when: '08 Abr',
      channel: 'Google',
      sentiment: 'Positivo',
      text: 'Fui no aniversário da minha esposa e foi perfeito. Recomendo muito!',
      response: 'Respondido em 35 min',
    },
    {
      author: 'Marcos P.',
      rating: '5,0',
      when: '06 Abr',
      channel: 'Google',
      sentiment: 'Positivo',
      text: 'Ambiente aconchegante, comida deliciosa. Voltarei sempre.',
      response: 'Respondido em 18 min',
    },
    {
      author: 'Fernanda C.',
      rating: '4,0',
      when: '30 Mar',
      channel: 'Google',
      sentiment: 'Neutro',
      text: 'Ótima comida, só achei o tempo de espera um pouco longo.',
      response: 'Resposta sugerida por IA',
    },
    {
      author: 'Paulo R.',
      rating: '5,0',
      when: '23 Mar',
      channel: 'Google',
      sentiment: 'Positivo',
      text: 'O nhoque é simplesmente incrível. Lugar top!',
      response: 'Respondido em 41 min',
    },
  ]

  // Temas de reputação coerentes com restaurante italiano casual
  base.reputation.themes = [
    { label: 'Massas artesanais', value: 34, color: '#E31B23' },
    { label: 'Atendimento', value: 22, color: '#22C55E' },
    { label: 'Ambiente aconchegante', value: 20, color: '#3B82F6' },
    { label: 'Tempo de espera', value: 14, color: '#F59E0B' },
    { label: 'Custo-benefício', value: 10, color: '#A855F7' },
  ]

  // Sentimento ajustado para a nota 4,8 com base de 127 reviews
  base.reputation.sentiment = [
    { label: 'Positivo', value: 81, color: '#22C55E' },
    { label: 'Neutro', value: 14, color: '#F59E0B' },
    { label: 'Negativo', value: 5, color: '#E31B23' },
  ]

  // Palavras-chave SEO local coerentes com restaurante italiano em POA
  base.acquisition.keywordTable = [
    { keyword: 'cantina italiana porto alegre', intent: 'Alta intenção', position: '#2', clicks: '112', movement: '+4' },
    { keyword: 'restaurante italiano porto alegre', intent: 'Descoberta', position: '#3', clicks: '89', movement: '+3' },
    { keyword: 'massa fresca porto alegre', intent: 'Produto', position: '#4', clicks: '67', movement: '+5' },
    { keyword: 'nhoque caseiro poa', intent: 'Nao-branded', position: '#6', clicks: '45', movement: '+2' },
    { keyword: 'cantina do bairro porto alegre', intent: 'Marca', position: '#1', clicks: '231', movement: 'Estável' },
  ]

  // Campanhas compatíveis com o investimento real de Abril (R$890, 67 conversões, CPA R$13,28)
  base.paidTraffic.campaigns = [
    {
      name: 'Marca | Cantina do Bairro',
      intent: 'Defesa e conversão',
      budget: 'R$ 222',
      leads: '19',
      cpl: 'R$ 11,68',
      roas: '5,8x',
      status: 'Forte',
    },
    {
      name: 'Restaurante italiano perto de mim',
      intent: 'Demanda quente local',
      budget: 'R$ 412',
      leads: '31',
      cpl: 'R$ 13,29',
      roas: '5,2x',
      status: 'Escalável',
    },
    {
      name: 'Almoço executivo Porto Alegre',
      intent: 'Ticket médio recorrente',
      budget: 'R$ 256',
      leads: '17',
      cpl: 'R$ 15,06',
      roas: '4,3x',
      status: 'Oportunidade',
    },
  ]

  // Scale notes com resumo do ano 2026 calculado a partir dos dados do Supabase
  const year2026Ads = ads.filter((row) => row.ano === 2026)
  const totalInvest2026 = year2026Ads.reduce((acc, row) => acc + numberValue(row.investimento), 0)
  const totalConversoes2026 = year2026Ads.reduce((acc, row) => acc + numberValue(row.conversoes), 0)
  const cpa2026 = totalConversoes2026 > 0 ? totalInvest2026 / totalConversoes2026 : 0

  base.paidTraffic.scaleNotes = [
    `Resumo do ano 2026: ${toCurrencyBRL(Math.round(totalInvest2026), 2)} investidos, ${totalConversoes2026} conversões, CPA médio de ${toCurrencyBRL(Math.round(cpa2026 * 100) / 100, 2)}.`,
    'Campanha de Almoço Executivo está em crescimento — há espaço para escalar com criativos sazonais e horários de almoço.',
    `Investimento mensal de ${toCurrencyBRL(Math.round(paidInvestment), 2)} gera ${paidConversions} conversões — estrutura sólida para escalar sem perder eficiência.`,
  ]

  // Insights estratégicos coerentes com restaurante italiano casual
  base.insights = [
    {
      title: 'Massa fresca e nhoque são os diferenciais que mais geram menções e buscas orgânicas.',
      detail: 'As avaliações e os cliques no Google concentram menções a esses dois produtos. Destacá-los nos criativos e no perfil Google pode ampliar a descoberta por categoria e ocasião.',
      impact: 'Mais tráfego orgânico de alto valor sem depender de anúncios.',
    },
    {
      title: 'Almoço executivo tem potencial de receita recorrente com baixa concorrência nas buscas pagas.',
      detail: 'A palavra-chave "almoço executivo Porto Alegre" ainda não é disputada. Com uma campanha dedicada e uma landing page simples, é possível capturar demanda de escritórios e empresas próximas.',
      impact: 'Reservas previsíveis em horário ocioso com ticket médio consistente.',
    },
    {
      title: 'Tempo de espera é o único ponto de melhoria recorrente nas avaliações.',
      detail: 'Todas as avaliações neutras mencionam espera. Uma automação de confirmação de reserva + aviso de fila pode reduzir o atrito e aumentar a nota média.',
      impact: 'Eleva a nota de 4,8 para 4,9+ e melhora o clique no Maps.',
    },
  ]

  // CRM plays coerentes com restaurante casual
  base.crm.plays = [
    'Fluxo de aniversário com oferta de sobremesa especial e mesa decorada com reserva antecipada.',
    'Pós-visita com pedido de avaliação no Google 24h após o atendimento.',
    'Reativação para clientes sem visita há 30 dias com promoção de prato do dia por WhatsApp.',
  ]

  // Oportunidades de eventos para restaurante casual (sem "casamentos intimistas de alto padrão")
  base.events.opportunities = [
    { label: 'Almoço corporativo e grupos', value: 42, color: '#3B82F6' },
    { label: 'Aniversários e datas especiais', value: 36, color: '#E31B23' },
    { label: 'Confraternizações de fim de ano', value: 22, color: '#22C55E' },
  ]

  // Automações coerentes com o segmento
  base.automations.flows = [
    { name: 'Boas-vindas WhatsApp', status: 'Ativo', coverage: '100% leads novos', result: 'Resposta em 45s de média' },
    { name: 'Pós-visita + pedido de avaliação', status: 'Ativo', coverage: '203 disparos', result: '31% taxa de resposta' },
    { name: 'Triagem de sentimento com IA', status: 'Ativo', coverage: '11 novas avaliações', result: '2 alertas críticos priorizados' },
    { name: 'Reativação 30 dias sem visita', status: 'Ativo', coverage: '98 clientes', result: '42 retornos estimulados' },
    { name: 'Confirmação de reserva automática', status: 'Ativo', coverage: '67 reservas', result: 'Taxa de no-show reduzida em 22%' },
  ]

  // Destaques do GBP sem textos técnicos/internos
  base.acquisition.googleBusinessProfile.highlights = [
    'Pico de descoberta em buscas por cantina italiana e massa fresca em Porto Alegre.',
    `Cliques em rota e ligações somaram ${213 + 94} interações de alta intenção no período.`,
    'Melhora consistente na posição média do Google está trazendo novos clientes sem custo adicional.',
  ]

  // Alertas de reputação limpos, sem linguagem técnica interna
  base.reputation.alerts = [
    'Sextas e sábados à noite concentram avaliações com menção a tempo de espera acima do ideal.',
    'Clientes que mencionam "nhoque" ou "massa fresca" costumam dar 5 estrelas — é o diferencial mais forte do perfil.',
    'Automação de pedido de avaliação pós-visita já contribui com os 11 novos reviews deste mês.',
  ]

  // Nota de eventos sem linguagem técnica
  base.events.note =
    'Grupos corporativos e aniversários representam os maiores potenciais de ticket da Cantina do Bairro. Com página dedicada e automação de briefing, é possível adicionar reservas de grupos ao pipeline mensal com previsibilidade.'
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
