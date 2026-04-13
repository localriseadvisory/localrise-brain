import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auth/connect/instagram?clientId=xxx
// Verifica autenticação admin e redireciona para Meta OAuth
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!clientId) {
    return NextResponse.json({ error: 'clientId obrigatório' }, { status: 400 })
  }

  const metaAppId = process.env.META_APP_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!metaAppId) {
    return NextResponse.redirect(
      `${appUrl}/admin/clientes/${clientId}/conexoes?erro=META_APP_ID não configurado no servidor`
    )
  }

  const state = Buffer.from(JSON.stringify({ clientId })).toString('base64url')

  const scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',')

  const params = new URLSearchParams({
    app_id: metaAppId,
    redirect_uri: `${appUrl}/auth/callback/instagram`,
    scope: scopes,
    response_type: 'code',
    state,
  })

  return NextResponse.redirect(
    `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  )
}
