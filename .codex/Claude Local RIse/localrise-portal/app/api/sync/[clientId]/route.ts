import { createAdminClient as createClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// ────────────────────────────────────────────────────────────
// GA4 — Google Analytics Data API
// ────────────────────────────────────────────────────────────
async function syncGA4(propertyId: string, accessToken: string, mes: number, ano: number) {
  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const endDate = new Date(ano, mes, 0).toISOString().slice(0, 10) // último dia do mês

  const body = {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  }

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GA4 erro ${res.status}: ${err}`)
  }

  const data = await res.json()
  const row = data.rows?.[0]?.metricValues

  if (!row) return null

  return {
    sessoes: Math.round(Number(row[0]?.value ?? 0)),
    usuarios: Math.round(Number(row[1]?.value ?? 0)),
    pageviews: Math.round(Number(row[2]?.value ?? 0)),
    taxa_rejeicao: Number((Number(row[3]?.value ?? 0) * 100).toFixed(1)),
    duracao_media_seg: Math.round(Number(row[4]?.value ?? 0)),
  }
}

// ────────────────────────────────────────────────────────────
// Instagram — Graph API
// ────────────────────────────────────────────────────────────
async function syncInstagram(userId: string, accessToken: string, mes: number, ano: number) {
  // Datas do período
  const since = Math.floor(new Date(ano, mes - 1, 1).getTime() / 1000)
  const until = Math.floor(new Date(ano, mes, 1).getTime() / 1000)

  // Dados do perfil (seguidores, posts)
  const profileRes = await fetch(
    `https://graph.instagram.com/${userId}?fields=followers_count,media_count&access_token=${accessToken}`
  )

  if (!profileRes.ok) {
    const err = await profileRes.text()
    throw new Error(`Instagram perfil erro ${profileRes.status}: ${err}`)
  }

  const profile = await profileRes.json()

  // Insights do período
  const insightsRes = await fetch(
    `https://graph.instagram.com/${userId}/insights?metric=impressions,reach,profile_views&period=day&since=${since}&until=${until}&access_token=${accessToken}`
  )

  if (!insightsRes.ok) {
    const err = await insightsRes.text()
    throw new Error(`Instagram insights erro ${insightsRes.status}: ${err}`)
  }

  const insights = await insightsRes.json()

  // Soma os valores diários para o período
  function somaMetrica(nome: string) {
    const metrica = insights.data?.find((m: { name: string }) => m.name === nome)
    return metrica?.values?.reduce((acc: number, v: { value: number }) => acc + (v.value ?? 0), 0) ?? 0
  }

  return {
    seguidores: profile.followers_count ?? 0,
    alcance: somaMetrica('reach'),
    impressoes: somaMetrica('impressions'),
    visitas_perfil: somaMetrica('profile_views'),
  }
}

// ────────────────────────────────────────────────────────────
// Google Ads — REST API
// ────────────────────────────────────────────────────────────
async function syncGoogleAds(
  customerId: string,
  developerToken: string,
  refreshToken: string,
  mes: number,
  ano: number
) {
  // 1. Obter access token via refresh token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!tokenRes.ok) throw new Error(`Google Ads token erro ${tokenRes.status}`)
  const { access_token } = await tokenRes.json()

  // 2. Consultar relatório via GAQL
  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const endDate = new Date(ano, mes, 0).toISOString().slice(0, 10)

  const query = `
    SELECT
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status = 'ENABLED'
  `

  const adsRes = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  )

  if (!adsRes.ok) {
    const err = await adsRes.text()
    throw new Error(`Google Ads query erro ${adsRes.status}: ${err}`)
  }

  const results = await adsRes.json()
  const rows = results.flatMap((r: { results?: unknown[] }) => r.results ?? [])

  // Agrega todas as campanhas
  let impressoes = 0, cliques = 0, investimento = 0, conversoes = 0
  for (const row of rows as Array<{ metrics: { impressions?: number; clicks?: number; cost_micros?: number; conversions?: number } }>) {
    impressoes += Number(row.metrics?.impressions ?? 0)
    cliques += Number(row.metrics?.clicks ?? 0)
    investimento += Number(row.metrics?.cost_micros ?? 0) / 1_000_000
    conversoes += Number(row.metrics?.conversions ?? 0)
  }

  const ctr = impressoes > 0 ? Number(((cliques / impressoes) * 100).toFixed(2)) : 0
  const cpc = cliques > 0 ? Number((investimento / cliques).toFixed(2)) : 0
  const custo_por_conversao = conversoes > 0 ? Number((investimento / conversoes).toFixed(2)) : 0

  return {
    impressoes: Math.round(impressoes),
    cliques: Math.round(cliques),
    ctr,
    cpc,
    investimento: Number(investimento.toFixed(2)),
    conversoes: Math.round(conversoes),
    custo_por_conversao,
  }
}

// ────────────────────────────────────────────────────────────
// Handler principal
// ────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const { mes, ano } = await request.json()

  const supabase = createClient()

  // Buscar integrações do cliente
  const { data: integ, error: integError } = await supabase
    .from('client_integrations')
    .select('*')
    .eq('client_id', clientId)
    .single()

  if (integError || !integ) {
    return NextResponse.json({ error: 'Integrações não configuradas para este cliente.' }, { status: 404 })
  }

  const resultados: Record<string, string> = {}
  const erros: Record<string, string> = {}

  // ── GA4 ──
  if (integ.ga4_property_id && integ.ga4_access_token) {
    try {
      const ga4Data = await syncGA4(integ.ga4_property_id, integ.ga4_access_token, mes, ano)
      if (ga4Data) {
        await supabase.from('metrics_site').upsert(
          { client_id: clientId, mes, ano, ...ga4Data },
          { onConflict: 'client_id,mes,ano' }
        )
        resultados.ga4 = `Sessões: ${ga4Data.sessoes.toLocaleString('pt-BR')}, Usuários: ${ga4Data.usuarios.toLocaleString('pt-BR')}`
      }
    } catch (e) {
      erros.ga4 = (e as Error).message
    }
  }

  // ── Instagram ──
  if (integ.instagram_user_id && integ.instagram_access_token) {
    try {
      const igData = await syncInstagram(integ.instagram_user_id, integ.instagram_access_token, mes, ano)
      await supabase.from('metrics_instagram').upsert(
        { client_id: clientId, mes, ano, ...igData },
        { onConflict: 'client_id,mes,ano' }
      )
      resultados.instagram = `Seguidores: ${igData.seguidores.toLocaleString('pt-BR')}, Alcance: ${igData.alcance.toLocaleString('pt-BR')}`
    } catch (e) {
      erros.instagram = (e as Error).message
    }
  }

  // ── Google Ads ──
  if (integ.google_ads_customer_id && integ.google_ads_developer_token && integ.google_ads_refresh_token) {
    try {
      const adsData = await syncGoogleAds(
        integ.google_ads_customer_id,
        integ.google_ads_developer_token,
        integ.google_ads_refresh_token,
        mes,
        ano
      )
      await supabase.from('metrics_ads').upsert(
        { client_id: clientId, mes, ano, ...adsData },
        { onConflict: 'client_id,mes,ano' }
      )
      resultados.ads = `Cliques: ${adsData.cliques.toLocaleString('pt-BR')}, Investimento: R$ ${adsData.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    } catch (e) {
      erros.ads = (e as Error).message
    }
  }

  // Atualizar timestamp de última sincronização
  await supabase
    .from('client_integrations')
    .update({ ultima_sincronizacao: new Date().toISOString() })
    .eq('client_id', clientId)

  return NextResponse.json({ resultados, erros })
}
