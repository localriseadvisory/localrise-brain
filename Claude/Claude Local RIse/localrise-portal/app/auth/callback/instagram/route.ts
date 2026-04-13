import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET /auth/callback/instagram?code=xxx&state=base64(clientId)
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { searchParams } = request.nextUrl

  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    const msg = error === 'access_denied' ? 'Autorização cancelada' : 'Erro no fluxo OAuth Instagram'
    return NextResponse.redirect(`${appUrl}/admin/clientes/sem-cliente/conexoes?erro=${encodeURIComponent(msg)}`)
  }

  let clientId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    clientId = decoded.clientId
  } catch {
    return NextResponse.redirect(`${appUrl}/admin?erro=${encodeURIComponent('State OAuth inválido')}`)
  }

  const redirectBase = `${appUrl}/admin/clientes/${clientId}/conexoes`

  try {
    const metaAppId     = process.env.META_APP_ID     ?? ''
    const metaAppSecret = process.env.META_APP_SECRET ?? ''
    const redirectUri   = `${appUrl}/auth/callback/instagram`

    // ── 1. Trocar code por token de curta duração ─────────────
    const shortRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     metaAppId,
        client_secret: metaAppSecret,
        redirect_uri:  redirectUri,
        code,
      }),
    })

    if (!shortRes.ok) {
      const txt = await shortRes.text()
      throw new Error(`Meta token exchange falhou: ${txt}`)
    }

    const { access_token: shortToken } = await shortRes.json()

    // ── 2. Trocar por token de longa duração (~60 dias) ───────
    const longRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type:        'fb_exchange_token',
        client_id:         metaAppId,
        client_secret:     metaAppSecret,
        fb_exchange_token: shortToken,
      })
    )

    if (!longRes.ok) {
      const txt = await longRes.text()
      throw new Error(`Meta long-lived token falhou: ${txt}`)
    }

    const { access_token: longToken, expires_in } = await longRes.json()

    const tokenExpiresAt = new Date(
      Date.now() + (expires_in ?? 5183944) * 1000  // ~60 dias default
    ).toISOString()

    // ── 3. Descobrir Instagram Business Account ───────────────
    let igUserId:   string | null = null
    let igUsername: string | null = null

    try {
      // Lista páginas do Facebook da conta
      const pagesRes = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${longToken}`
      )
      if (pagesRes.ok) {
        const pagesData = await pagesRes.json()
        const firstPage = pagesData.data?.[0]

        if (firstPage) {
          // Busca conta Instagram Business vinculada à página
          const igRes = await fetch(
            `https://graph.facebook.com/v18.0/${firstPage.id}` +
            `?fields=instagram_business_account&access_token=${firstPage.access_token ?? longToken}`
          )
          if (igRes.ok) {
            const igData = await igRes.json()
            igUserId = igData.instagram_business_account?.id ?? null

            if (igUserId) {
              // Busca username do perfil
              const profileRes = await fetch(
                `https://graph.instagram.com/${igUserId}?fields=username,name&access_token=${longToken}`
              )
              if (profileRes.ok) {
                const profile = await profileRes.json()
                igUsername = profile.username ?? profile.name ?? null
              }
            }
          }
        }
      }
    } catch { /* silencioso */ }

    // ── 4. Salvar no Supabase ─────────────────────────────────
    const supabase = createAdminClient()

    const { error: upsertError } = await supabase
      .from('client_integrations')
      .upsert(
        {
          client_id:        clientId,
          provider:         'instagram',
          access_token:     longToken,
          refresh_token:    null,          // Instagram não usa refresh_token
          token_expires_at: tokenExpiresAt,
          account_id:       igUserId,
          account_name:     igUsername,
          is_active:        true,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'client_id,provider' }
      )

    if (upsertError) throw new Error(`Supabase upsert: ${upsertError.message}`)

    const label = igUsername ? `@${igUsername}` : 'conta Instagram'
    return NextResponse.redirect(
      `${redirectBase}?sucesso=${encodeURIComponent(`Instagram conectado: ${label}`)}`
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.redirect(
      `${redirectBase}?erro=${encodeURIComponent(msg)}`
    )
  }
}
