export type DashboardSection =
  | 'overview'
  | 'aquisicao'
  | 'trafego-pago'
  | 'crm'
  | 'automacoes'
  | 'reputacao'
  | 'eventos'
  | 'sistema-localrise'

export type Tone = 'red' | 'blue' | 'green' | 'amber' | 'purple'

export type TrendPoint = { label: string; value: number }

export type SourceItem = { label: string; value: number; color: string }

export type DashboardKpi = {
  label: string
  value: string
  delta: string
  tone: Tone
  footnote: string
}

export type KeywordItem = {
  keyword: string
  intent: string
  position: string
  clicks: string
  movement: string
}

export type CampaignItem = {
  name: string
  intent: string
  budget: string
  leads: string
  cpl: string
  roas: string
  status: string
}

export type AutomationItem = {
  name: string
  status: string
  coverage: string
  result: string
}

export type InsightItem = {
  title: string
  detail: string
  impact: string
}

export type ReviewFeedItem = {
  author: string
  rating: string
  when: string
  channel: string
  sentiment: string
  text: string
  response: string
}

export type ActionItem = {
  title: string
  owner: string
  due: string
  impact: string
}

export type DashboardRestaurant = {
  slug: string
  name: string
  city: string
  segment: string
  owner: string
  period: string
  healthScore: number
  growthMessage: string
}

export type DashboardData = {
  restaurant: DashboardRestaurant
  overview: {
    headline: string
    kpis: DashboardKpi[]
    revenueTrend: TrendPoint[]
    sourceMix: SourceItem[]
  }
  acquisition: {
    performance: { label: string; value: string; delta: string }[]
    keywordTable: KeywordItem[]
    brandedVsNonBranded: SourceItem[]
    trafficOrigins: SourceItem[]
    googleBusinessProfile: {
      rating: string
      reviews: string
      newReviews: string
      photos: string
      mapsViews: string
      searchViews: string
      highlights: string[]
    }
  }
  paidTraffic: {
    summary: { label: string; value: string; delta: string }[]
    campaigns: CampaignItem[]
    funnel: TrendPoint[]
    scaleNotes: string[]
  }
  crm: {
    summary: { label: string; value: string; delta: string }[]
    customerMix: SourceItem[]
    lifecycle: TrendPoint[]
    leadFunnel: TrendPoint[]
    plays: string[]
  }
  automations: {
    summary: { label: string; value: string; delta: string }[]
    flows: AutomationItem[]
    aiOps: SourceItem[]
  }
  reputation: {
    sentiment: SourceItem[]
    metrics: { label: string; value: string; delta: string }[]
    themes: SourceItem[]
    alerts: string[]
    reviewFeed: ReviewFeedItem[]
  }
  events: {
    summary: { label: string; value: string; delta: string }[]
    pipeline: TrendPoint[]
    opportunities: SourceItem[]
    note: string
  }
  insights: InsightItem[]
  actionPlan: ActionItem[]
  systemPillars: { title: string; description: string }[]
}

export type DashboardDataSource = 'mock' | 'supabase'

export type DashboardRequest = {
  restaurantSlug?: string
  source?: DashboardDataSource
}
