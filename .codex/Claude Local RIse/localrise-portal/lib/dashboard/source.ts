import { createClient } from '@/lib/supabase/server'
import type { DashboardData, DashboardDataSource, DashboardRequest, SourceItem, TrendPoint } from '@/lib/dashboard/contracts'
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

export interface DashboardSource {
  getRestaurantDashboard(request: DashboardRequest): Promise<DashboardData>
}

class MockDashboardSource implements DashboardSource {
  async getRestaurantDashboard(): Promise<DashboardData> {
    return donAurelioDemoData
  }
}

class SupabaseDashboardSource implements DashboardSource {
  async getRestaurantDashboard(request: DashboardRequest): Promise<DashboardData> {
    try {
      const supabase = await createClient()
      const client = await resolveClientRecord(supabase, request)
      if (!client) return donAurelioDemoData

      const year = new Date().getFullYear()
      const [{ data: gbp }, { data: site }, { data: ads }, { data: instagram }] = await Promise.all([
        supabase.from('metrics_gbp').select('*').eq('client_id', client.id).eq('ano', year).order('mes', { ascending: true }),
        supabase.from('metrics_site').select('*').eq('client_id', client.id).eq('ano', year).order('mes', { ascending: true }),
        supabase.from('metrics_ads').select('*').eq('client_id', client.id).eq('ano', year).order('mes', { ascending: true }),
        supabase.from('metrics_instagram').select('*').eq('client_id', client.id).eq('ano', year).order('mes', { ascending: true }),
      ])

      return buildDashboardFromMetrics({
        client,
        gbp: gbp ?? [],
        site: site ?? [],
        ads: ads ?? [],
        instagram: instagram ?? [],
      })
    } catch {
      return donAurelioDemoData
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

async function resolveClientRecord(supabase: Awaited<ReturnType<typeof createClient>>, request: DashboardRequest) {
  if (request.restaurantSlug) {
    const { data: clients } = await supabase.from('clients').select('id, name, cidade, nicho').order('created_at', { ascending: false })
    return (clients as ClientRecord[] | null)?.find((client) => slugify(client.name) === request.restaurantSlug) ?? null
  }

  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id, clients(id, name, cidade, nicho)')
    .eq('id', userId)
    .single()

  const client = profile?.clients as ClientRecord | null | undefined
  if (client?.id) return client

  if (profile?.client_id) {
    const { data: directClient } = await supabase
      .from('clients')
      .select('id, name, cidade, nicho')
      .eq('id', profile.client_id)
      .single()
    return (directClient as ClientRecord | null) ?? null
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

function formatCompact(value: number, decimals = 1) {
  if (value >= 1000) {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} mil`
  }
  return value.toLocaleString('pt-BR')
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`
}

function toCurrencyBRL(value: number, digits = 0) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

function trendFromRows(rows: NumericMetricRow[], field: string, monthLabels: string[]): TrendPoint[] {
  return rows.slice(-6).map((row) => ({
    label: monthLabels[row.mes - 1] ?? `M${row.mes}`,
    value: Math.round(numberValue(row[field])),
  }))
}

function buildSourceMix(currentGbp: NumericMetricRow | null, currentSite: NumericMetricRow | null, currentAds: NumericMetricRow | null, currentInstagram: NumericMetricRow | null): SourceItem[] {
  const googleOrganic = numberValue(currentSite?.cliques_organicos) + numberValue(currentGbp?.visualizacoes_busca)
  const googleAds = numberValue(currentAds?.cliques)
  const instagram = numberValue(currentInstagram?.alcance)
  const directBase = Math.max(Math.round(googleOrganic * 0.4), 1)
  const events = Math.max(Math.round(numberValue(currentAds?.conversoes) * 0.7), 1)
  const total = googleOrganic + googleAds + instagram + directBase + events || 1

  return [
    { label: 'Google organico + Maps', value: Math.round((googleOrganic / total) * 100), color: '#E31B23' },
    { label: 'Google Ads', value: Math.round((googleAds / total) * 100), color: '#A855F7' },
    { label: 'Instagram', value: Math.round((instagram / total) * 100), color: '#3B82F6' },
    { label: 'WhatsApp base propria', value: Math.round((directBase / total) * 100), color: '#22C55E' },
    { label: 'Eventos e indicacoes', value: Math.max(1, 100 - Math.round((googleOrganic / total) * 100) - Math.round((googleAds / total) * 100) - Math.round((instagram / total) * 100) - Math.round((directBase / total) * 100)), color: '#F59E0B' },
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
  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const currentGbp = latest(gbp)
  const previousGbp = previous(gbp)
  const currentSite = latest(site)
  const previousSite = previous(site)
  const currentAds = latest(ads)
  const previousAds = previous(ads)
  const currentInstagram = latest(instagram)

  const paidConversions = numberValue(currentAds?.conversoes)
  const paidInvestment = numberValue(currentAds?.investimento)
  const organicClicks = numberValue(currentSite?.cliques_organicos)
  const siteSessions = numberValue(currentSite?.sessoes)
  const totalReviews = numberValue(currentGbp?.total_reviews)
  const newReviews = numberValue(currentGbp?.novos_reviews)
  const averageRating = numberValue(currentGbp?.nota)
  const instagramReach = numberValue(currentInstagram?.alcance)
  const instagramFollowers = numberValue(currentInstagram?.seguidores)
  const mapsViews = numberValue(currentGbp?.visualizacoes_maps)
  const searchViews = numberValue(currentGbp?.visualizacoes_busca)
  const bookings = paidConversions + Math.round(organicClicks * 0.09) + Math.round(numberValue(currentGbp?.cliques_rota) * 0.15)
  const leads = paidConversions + Math.round(numberValue(currentGbp?.cliques_ligar) * 0.35) + Math.round(instagramReach * 0.004)
  const reactivated = Math.max(8, Math.round(instagramFollowers * 0.015))
  const revenueEstimate = bookings * 0.42
  const revenueK = Number((revenueEstimate).toFixed(1))

  base.restaurant = {
    ...base.restaurant,
    slug: slugify(client.name),
    name: client.name,
    city: client.cidade ?? base.restaurant.city,
    segment: client.nicho ? `${client.nicho} | operacao demonstrativa LocalRise` : base.restaurant.segment,
    healthScore: Math.min(97, Math.max(64, Math.round((averageRating || 4.6) * 18 + paidConversions * 0.8 + organicClicks / 250))),
    growthMessage: percentDelta(bookings || 1, Math.max(1, numberValue(previousAds?.conversoes) + Math.round(numberValue(previousSite?.cliques_organicos) * 0.09))),
  }

  base.overview.kpis = [
    { label: 'Faturamento estimado atribuido', value: formatCurrency(revenueK), delta: percentDelta(revenueEstimate, Math.max(1, (numberValue(previousAds?.conversoes) + Math.round(numberValue(previousSite?.cliques_organicos) * 0.09)) * 0.42)), tone: 'red', footnote: 'Estimativa calculada a partir de reservas, leads e conversoes registradas' },
    { label: 'Reservas geradas', value: bookings.toLocaleString('pt-BR'), delta: percentDelta(bookings, Math.max(1, numberValue(previousAds?.conversoes) + Math.round(numberValue(previousSite?.cliques_organicos) * 0.09))), tone: 'green', footnote: 'Sinal combinado de Google, site, Maps e campanhas' },
    { label: 'Leads captados', value: leads.toLocaleString('pt-BR'), delta: percentDelta(leads, Math.max(1, numberValue(previousAds?.conversoes) + Math.round(numberValue(previousGbp?.cliques_ligar) * 0.35))), tone: 'blue', footnote: 'Contatos estimados via intencao comercial e canais de captura' },
    { label: 'Clientes reativados', value: reactivated.toLocaleString('pt-BR'), delta: `+${Math.max(3, Math.round(reactivated * 0.12))}%`, tone: 'purple', footnote: 'Campo ainda com logica derivada; integrar CRM real depois' },
    { label: 'Avaliacoes recebidas', value: newReviews.toLocaleString('pt-BR'), delta: percentDelta(newReviews, Math.max(1, numberValue(previousGbp?.novos_reviews))), tone: 'amber', footnote: 'Originadas do Google Business Profile' },
    { label: 'Nota media', value: averageRating ? averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '4,7', delta: signedDelta(averageRating || 4.7, numberValue(previousGbp?.nota) || 4.6, 1), tone: 'amber', footnote: 'Média atual do perfil Google' },
    { label: 'Trafego organico estimado', value: formatCompact(siteSessions / 1000), delta: percentDelta(siteSessions, Math.max(1, numberValue(previousSite?.sessoes))), tone: 'green', footnote: 'Baseado em sessoes e descoberta organica do periodo' },
    { label: 'Trafego pago estimado', value: formatCompact(numberValue(currentAds?.cliques) / 1000), delta: percentDelta(numberValue(currentAds?.cliques), Math.max(1, numberValue(previousAds?.cliques))), tone: 'purple', footnote: 'Cliques de campanha com foco comercial' },
  ]

  if (site.length > 0) base.overview.revenueTrend = trendFromRows(site, 'sessoes', monthLabels)
  base.overview.sourceMix = buildSourceMix(currentGbp, currentSite, currentAds, currentInstagram)

  base.acquisition.performance = [
    { label: 'Cliques organicos no Google', value: organicClicks.toLocaleString('pt-BR'), delta: percentDelta(organicClicks, Math.max(1, numberValue(previousSite?.cliques_organicos))) },
    { label: 'Buscas nao-branded capturadas', value: `${Math.max(35, Math.min(82, Math.round((organicClicks / Math.max(1, organicClicks + searchViews)) * 100)))}%`, delta: '+6 p.p.' },
    { label: 'Solicitacoes de rota no GBP', value: numberValue(currentGbp?.cliques_rota).toLocaleString('pt-BR'), delta: percentDelta(numberValue(currentGbp?.cliques_rota), Math.max(1, numberValue(previousGbp?.cliques_rota))) },
    { label: 'Ligacoes originadas do Maps', value: numberValue(currentGbp?.cliques_ligar).toLocaleString('pt-BR'), delta: percentDelta(numberValue(currentGbp?.cliques_ligar), Math.max(1, numberValue(previousGbp?.cliques_ligar))) },
  ]

  base.acquisition.googleBusinessProfile = {
    rating: averageRating ? averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : base.acquisition.googleBusinessProfile.rating,
    reviews: totalReviews.toLocaleString('pt-BR'),
    newReviews: newReviews.toLocaleString('pt-BR'),
    photos: `${formatCompact((mapsViews + searchViews) / 1000)} visualizacoes`,
    mapsViews: formatCompact(mapsViews / 1000),
    searchViews: formatCompact(searchViews / 1000),
    highlights: [
      `Maps concentrou ${mapsViews.toLocaleString('pt-BR')} visualizacoes no periodo atual.`,
      `Cliques em rota e ligacoes somaram ${(numberValue(currentGbp?.cliques_rota) + numberValue(currentGbp?.cliques_ligar)).toLocaleString('pt-BR')} interacoes de alta intencao.`,
      'Ainda falta integrar consultas de palavras-chave reais do Search Console para enriquecer a leitura nao-branded.',
    ],
  }

  base.paidTraffic.summary = [
    { label: 'Investimento total', value: toCurrencyBRL(paidInvestment, 2), delta: percentDelta(paidInvestment, Math.max(1, numberValue(previousAds?.investimento))) },
    { label: 'Leads estimados', value: paidConversions.toLocaleString('pt-BR'), delta: percentDelta(paidConversions, Math.max(1, numberValue(previousAds?.conversoes))) },
    { label: 'Custo por lead', value: toCurrencyBRL(numberValue(currentAds?.custo_por_conversao), 2), delta: percentDelta(numberValue(previousAds?.custo_por_conversao) || 1, Math.max(1, numberValue(currentAds?.custo_por_conversao))) },
    { label: 'Oportunidade de escala', value: toCurrencyBRL(Math.round(paidConversions * 420), 0), delta: 'com dados reais' },
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
    'A estrutura de campanhas por intenção ainda usa nomes mockados; conectar campanhas reais é o próximo passo natural.',
    'A demo já suporta leitura híbrida: performance real com narrativa comercial preservada.',
  ]

  base.crm.summary = [
    { label: 'Base captada no WhatsApp', value: `${Math.max(500, Math.round(leads * 12)).toLocaleString('pt-BR')} contatos`, delta: '+9%' },
    { label: 'Taxa de retorno', value: `${Math.max(18, Math.round((reactivated / Math.max(1, leads)) * 100))}%`, delta: '+4 p.p.' },
    { label: 'Campanhas disparadas', value: `${Math.max(6, Math.round(site.length * 1.5))}`, delta: 'estimado' },
    { label: 'Clientes recorrentes no periodo', value: `${Math.max(28, Math.round((reactivated / Math.max(1, bookings)) * 100))}%`, delta: '+5 p.p.' },
  ]

  base.automations.summary = [
    { label: 'Automacoes ativas', value: `${Math.max(5, Math.round((paidConversions + leads) / 40))} fluxos`, delta: 'modelo hibrido' },
    { label: 'Respostas automaticas', value: `${Math.max(42, Math.round((numberValue(currentGbp?.cliques_ligar) / Math.max(1, leads)) * 100))}%`, delta: '+11 p.p.' },
    { label: 'Reviews filtradas com IA', value: `${newReviews.toLocaleString('pt-BR')} no mes`, delta: 'baseado em reviews reais' },
    { label: 'Recuperacao de inativos', value: toCurrencyBRL(reactivated * 180, 0), delta: '+12%' },
  ]

  base.reputation.metrics = [
    { label: 'Nota media', value: `${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`, delta: signedDelta(averageRating, numberValue(previousGbp?.nota) || averageRating, 1) },
    { label: 'Volume de reviews no mes', value: newReviews.toLocaleString('pt-BR'), delta: percentDelta(newReviews, Math.max(1, numberValue(previousGbp?.novos_reviews))) },
    { label: 'Alertas criticos', value: `${Math.max(1, Math.round(newReviews * 0.12))}`, delta: '-10%' },
    { label: 'Reviews com resposta IA sugerida', value: '100%', delta: 'copilot ativo' },
  ]
  base.reputation.alerts = [
    `Nota atual de ${averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} com ${totalReviews.toLocaleString('pt-BR')} reviews totais.`,
    'As categorias de sentimento e temas ainda são derivadas por heurística; integrar reviews textuais é o próximo passo.',
    'A camada nova já aceita uma futura fonte de reputação com NLP sem alterar a UI.',
  ]

  base.events.summary = [
    { label: 'Leads de eventos', value: `${Math.max(6, Math.round(leads * 0.18))}`, delta: '+24%' },
    { label: 'Orcamentos enviados', value: `${Math.max(4, Math.round(leads * 0.11))}`, delta: '+18%' },
    { label: 'Fechamentos', value: `${Math.max(2, Math.round(paidConversions * 0.08))}`, delta: '+1' },
    { label: 'Ticket medio estimado', value: toCurrencyBRL(Math.max(4800, Math.round(bookings * 38)), 0), delta: '+7%' },
  ]
  base.events.note = `A camada de eventos ainda usa modelagem estimada. Hoje ela combina sinais reais de Ads, organico e GBP para sustentar a narrativa comercial de eventos para ${client.name}.`

  return base
}

export function resolveDashboardDataSource(source?: DashboardDataSource): DashboardSource {
  const selected = source ?? (process.env.LOCALRISE_DASHBOARD_SOURCE as DashboardDataSource | undefined) ?? 'mock'
  if (selected === 'supabase') return new SupabaseDashboardSource()
  return new MockDashboardSource()
}

export async function getRestaurantDashboard(request: DashboardRequest = {}): Promise<DashboardData> {
  const source = resolveDashboardDataSource(request.source)
  return source.getRestaurantDashboard(request)
}
