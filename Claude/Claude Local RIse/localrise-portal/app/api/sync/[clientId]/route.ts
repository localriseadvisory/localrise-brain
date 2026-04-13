import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Utilitário: renovar token Google se expirado
// ─────────────────────────────────────────────────────────────
async function getValidGoogleToken(
  supabase: ReturnType<typeof createAdminClient>,
  clientId: string,
  integ: {
    access_token: string | null
    refresh_token: string | null
    token_expires_at: string | null
  }
): Promise<string> {
  const expiresAt = integ.token_expires_at ? new Date(integ.token_expires_at) : null
  const stillValid = expiresAt && expiresAt > new Date(Date.now() + 5 * 60 * 1000)

  if (stillValid && integ.access_token) return integ.access_token

  if (!integ.refresh_token) throw new Error('Sem refresh_token — reconecte a conta Google.')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: integ.refresh_token,
      grant_type:    'refresh_token',
    }),
  })

  if (!tokenRes.ok) {
    const txt = await tokenRes.text()
    throw new Error(`Falha ao renovar token Google: ${txt}`)
  }

  const { access_token, expires_in } = await tokenRes.json()

  await supabase
    .from('client_integrations')
    .update({
      access_token,
      token_expires_at: new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString(),
    })
    .eq('client_id', clientId)
    .eq('provider', 'google')

  return access_token
}

// ─────────────────────────────────────────────────────────────
// GA4 — Google Analytics Data API
// ─────────────────────────────────────────────────────────────
async function syncGA4(propertyId: string, accessToken: string, mes: number, ano: number) {
  // propertyId vem como "properties/123456789" — normaliza
  const property = propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`

  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const endDate   = new Date(ano, mes, 0).toISOString().slice(0, 10)

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${property}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
    }
  )

  if (!res.ok) throw new Error(`GA4 erro ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const row  = data.rows?.[0]?.metricValues

  if (!row) return null

  return {
    sessoes:           Math.round(Number(row[0]?.value ?? 0)),
    usuarios:          Math.round(Number(row[1]?.value ?? 0)),
    pageviews:         Math.round(Number(row[2]?.value ?? 0)),
    taxa_rejeicao:     Number((Number(row[3]?.value ?? 0) * 100).toFixed(1)),
    duracao_media_seg: Math.round(Number(row[4]?.value ?? 0)),
  }
}

// ─────────────────────────────────────────────────────────────
// Search Console — Google Webmasters API
// ─────────────────────────────────────────────────────────────
async function syncSearchConsole(siteUrl: string, accessToken: string, mes: number, ano: number) {
  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const endDate   = new Date(ano, mes, 0).toISOString().slice(0, 10)

  const encodedSite = encodeURIComponent(siteUrl)

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
      }),
    }
  )

  if (!res.ok) throw new Error(`Search Console erro ${res.status}: ${await res.text()}`)

  const data = await res.json()

  // Quando não há dimensão selecionada, retorna uma linha com o agregado
  const row = data.rows?.[0]

  if (!row) return null

  return {
    cliques_organicos:    Math.round(Number(row.clicks      ?? 0)),
    impressoes_organicas: Math.round(Number(row.impressions ?? 0)),
    posicao_media:        Number(Number(row.position ?? 0).toFixed(1)),
  }
}

// ─────────────────────────────────────────────────────────────
// Instagram — Meta Graph API
// ─────────────────────────────────────────────────────────────
async function syncInstagram(userId: string, accessToken: string, mes: number, ano: number) {
  const since = Math.floor(new Date(ano, mes - 1, 1).getTime() / 1000)
  const until = Math.floor(new Date(ano, mes,     1).getTime() / 1000)

  const profileRes = await fetch(
    `https://graph.instagram.com/${userId}?fields=followers_count,media_count&access_token=${accessToken}`
  )
  if (!profileRes.ok) throw new Error(`Instagram perfil erro ${profileRes.status}: ${await profileRes.text()}`)
  const profile = await profileRes.json()

  const insightsRes = await fetch(
    `https://graph.instagram.com/${userId}/insights` +
    `?metric=impressions,reach,profile_views` +
    `&period=day&since=${since}&until=${until}&access_token=${accessToken}`
  )
  if (!insightsRes.ok) throw new Error(`Instagram insights erro ${insightsRes.status}: ${await insightsRes.text()}`)
  const insights = await insightsRes.json()

  function soma(nome: string) {
    const m = insights.data?.find((x: { name: string }) => x.name === nome)
    return m?.values?.reduce((acc: number, v: { value: number }) => acc + (v.value ?? 0), 0) ?? 0
  }

  return {
    seguidores:    profile.followers_count ?? 0,
    alcance:       soma('reach'),
    impressoes:    soma('impressions'),
    visitas_perfil: soma('profile_views'),
  }
}

// ─────────────────────────────────────────────────────────────
// Google Ads — REST API v17
// ─────────────────────────────────────────────────────────────
async function syncGoogleAds(
  customerId:     string,
  developerToken: string,
  accessToken:    string,
  mes:            number,
  ano:            number
) {
  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const endDate   = new Date(ano, mes, 0).toISOString().slice(0, 10)

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

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        Authorization:   `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ query }),
    }
  )

  if (!res.ok) throw new Error(`Google Ads erro ${res.status}: ${await res.text()}`)

  const results = await res.json()
  const rows    = results.flatMap((r: { results?: unknown[] }) => r.results ?? [])

  let impressoes = 0, cliques = 0, investimento = 0, conversoes = 0

  for (const row of rows as Array<{ metrics: { impressions?: number; clicks?: number; cost_micros?: number; conversions?: number } }>) {
    impressoes  += Number(row.metrics?.impressions ?? 0)
    cliques     += Number(row.metrics?.clicks      ?? 0)
    investimento += Number(row.metrics?.cost_micros ?? 0) / 1_000_000
    conversoes  += Number(row.metrics?.conversions  ?? 0)
  }

  const ctr                = impressoes > 0 ? Number(((cliques / impressoes) * 100).toFixed(2)) : 0
  const cpc                = cliques    > 0 ? Number((investimento / cliques).toFixed(2))       : 0
  const custo_por_conversao = conversoes > 0 ? Number((investimento / conversoes).toFixed(2))   : 0

  return {
    impressoes:            Math.round(impressoes),
    cliques:               Math.round(cliques),
    ctr,
    cpc,
    investimento:          Number(investimento.toFixed(2)),
    conversoes:            Math.round(conversoes),
    custo_por_conversao,
  }
}

// ─────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId }          = await params
  const { mes, ano, provider } = await request.json()

  const supabase = createAdminClient()

  // Busca todas as integrações ativas do cliente
  const { data: integrations, error: integError } = await supabase
    .from('client_integrations')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)

  if (integError) {
    return NextResponse.json({ error: 'Erro ao buscar integrações.' }, { status: 500 })
  }

  const googleInteg    = integrations?.find(i => i.provider === 'google')    ?? null
  const instagramInteg = integrations?.find(i => i.provider === 'instagram') ?? null

  if (!googleInteg && !instagramInteg) {
    return NextResponse.json({ error: 'Nenhuma integração ativa para este cliente.' }, { status: 404 })
  }

  const resultados: Record<string, string> = {}
  const erros:      Record<string, string> = {}

  // ── Google (GA4 + Search Console + Ads) ──────────────────
  const syncGoogle = !provider || provider === 'google'

  if (syncGoogle && googleInteg) {
    let accessToken: string | null = null

    try {
      accessToken = await getValidGoogleToken(supabase, clientId, googleInteg)
    } catch (e) {
      erros.google_token = (e as Error).message
    }

    if (accessToken) {
      // GA4
      if (googleInteg.ga4_property_id) {
        try {
          const ga4Data = await syncGA4(googleInteg.ga4_property_id, accessToken, mes, ano)
          if (ga4Data) {
            await supabase.from('metrics_site').upsert(
              { client_id: clientId, mes, ano, ...ga4Data },
              { onConflict: 'client_id,mes,ano' }
            )
            resultados.ga4 = `GA4 — sessões: ${ga4Data.sessoes.toLocaleString('pt-BR')}, usuários: ${ga4Data.usuarios.toLocaleString('pt-BR')}`
          }
        } catch (e) { erros.ga4 = (e as Error).message }
      }

      // Search Console
      if (googleInteg.search_console_site) {
        try {
          const scData = await syncSearchConsole(googleInteg.search_console_site, accessToken, mes, ano)
          if (scData) {
            await supabase.from('metrics_site').upsert(
              { client_id: clientId, mes, ano, ...scData },
              { onConflict: 'client_id,mes,ano' }
            )
            resultados.search_console = `SEO — posição: ${scData.posicao_media}, cliques: ${scData.cliques_organicos.toLocaleString('pt-BR')}`
          }
        } catch (e) { erros.search_console = (e as Error).message }
      }

      // Google Ads
      const devToken = googleInteg.ads_developer_token ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN
      if (googleInteg.ads_customer_id && devToken) {
        try {
          const adsData = await syncGoogleAds(googleInteg.ads_customer_id, devToken, accessToken, mes, ano)
          await supabase.from('metrics_ads').upsert(
            { client_id: clientId, mes, ano, ...adsData },
            { onConflict: 'client_id,mes,ano' }
          )
          resultados.ads = `Ads — cliques: ${adsData.cliques.toLocaleString('pt-BR')}, investimento: R$ ${adsData.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        } catch (e) { erros.ads = (e as Error).message }
      }
    }

    // Atualiza last_sync_at do Google
    await supabase
      .from('client_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('provider', 'google')
  }

  // ── Instagram ─────────────────────────────────────────────
  const syncInsta = !provider || provider === 'instagram'

  if (syncInsta && instagramInteg?.access_token && instagramInteg?.account_id) {
    try {
      const igData = await syncInstagram(instagramInteg.account_id, instagramInteg.access_token, mes, ano)
      await supabase.from('metrics_instagram').upsert(
        { client_id: clientId, mes, ano, ...igData },
        { onConflict: 'client_id,mes,ano' }
      )
      resultados.instagram = `Instagram — seguidores: ${igData.seguidores.toLocaleString('pt-BR')}, alcance: ${igData.alcance.toLocaleString('pt-BR')}`

      await supabase
        .from('client_integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .eq('provider', 'instagram')
    } catch (e) { erros.instagram = (e as Error).message }
  }

  return NextResponse.json({ resultados, erros })
}
