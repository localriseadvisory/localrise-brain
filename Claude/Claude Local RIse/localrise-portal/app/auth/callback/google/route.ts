import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET /auth/callback/google?code=xxx&state=base64(clientId)
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { searchParams } = request.nextUrl

  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Usuário cancelou ou houve erro na tela do Google
  if (error || !code || !state) {
    const msg = error === 'access_denied' ? 'Autorização cancelada' : 'Erro no fluxo OAuth Google'
    return NextResponse.redirect(`${appUrl}/admin/clientes/sem-cliente/conexoes?erro=${encodeURIComponent(msg)}`)
  }

  // Decodifica state para obter clientId
  let clientId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    clientId = decoded.clientId
  } catch {
    return NextResponse.redirect(`${appUrl}/admin?erro=${encodeURIComponent('State OAuth inválido')}`)
  }

  const redirectBase = `${appUrl}/admin/clientes/${clientId}/conexoes`

  try {
    // ── 1. Trocar code por tokens ─────────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        code,
        grant_type:    'authorization_code',
        redirect_uri:  `${appUrl}/auth/callback/google`,
      }),
    })

    if (!tokenRes.ok) {
      const txt = await tokenRes.text()
      throw new Error(`Token exchange falhou: ${txt}`)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokens

    if (!access_token) throw new Error('access_token ausente na resposta Google')

    const tokenExpiresAt = new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString()

    // ── 2. Buscar info da conta Google ────────────────────────
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const userInfo = userInfoRes.ok ? await userInfoRes.json() : {}

    // ── 3. Auto-descobrir GA4 Property ────────────────────────
    let ga4PropertyId:   string | null = null
    let ga4PropertyName: string | null = null

    try {
      const ga4Res = await fetch(
        'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      if (ga4Res.ok) {
        const ga4Data = await ga4Res.json()
        const firstProp = ga4Data.accountSummaries?.[0]?.propertySummaries?.[0]
        if (firstProp) {
          ga4PropertyId   = firstProp.property        // "properties/123456789"
          ga4PropertyName = firstProp.displayName
        }
      }
    } catch { /* silencioso — admin pode configurar depois */ }

    // ── 4. Auto-descobrir Search Console site ─────────────────
    let searchConsoleSite: string | null = null

    try {
      const scRes = await fetch(
        'https://www.googleapis.com/webmasters/v3/sites',
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      if (scRes.ok) {
        const scData = await scRes.json()
        // Prefere sc-domain: (domain property) sobre URL property
        const sites: Array<{ siteUrl: string; permissionLevel: string }> = scData.siteEntry ?? []
        const domainProp = sites.find(s => s.siteUrl.startsWith('sc-domain:'))
        searchConsoleSite = domainProp?.siteUrl ?? sites[0]?.siteUrl ?? null
      }
    } catch { /* silencioso */ }

    // ── 5. Salvar no Supabase ─────────────────────────────────
    const supabase = createAdminClient()

    const { error: upsertError } = await supabase
      .from('client_integrations')
      .upsert(
        {
          client_id:           clientId,
          provider:            'google',
          access_token,
          refresh_token:       refresh_token ?? null,
          token_expires_at:    tokenExpiresAt,
          account_id:          userInfo.email ?? null,
          account_name:        userInfo.name  ?? null,
          ga4_property_id:     ga4PropertyId,
          ga4_property_name:   ga4PropertyName,
          search_console_site: searchConsoleSite,
          ads_developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? null,
          is_active:           true,
          updated_at:          new Date().toISOString(),
        },
        { onConflict: 'client_id,provider' }
      )

    if (upsertError) throw new Error(`Supabase upsert: ${upsertError.message}`)

    const accountLabel = userInfo.email ?? 'conta Google'
    return NextResponse.redirect(
      `${redirectBase}?sucesso=${encodeURIComponent(`Google conectado: ${accountLabel}`)}`
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.redirect(
      `${redirectBase}?erro=${encodeURIComponent(msg)}`
    )
  }
}
