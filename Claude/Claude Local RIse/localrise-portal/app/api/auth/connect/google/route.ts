import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auth/connect/google?clientId=xxx
// Verifica autenticação admin e redireciona para Google OAuth
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

  const clientIdGoogle = process.env.GOOGLE_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!clientIdGoogle) {
    return NextResponse.redirect(
      `${appUrl}/admin/clientes/${clientId}/conexoes?erro=GOOGLE_CLIENT_ID não configurado no servidor`
    )
  }

  // state = base64(clientId) — proteção CSRF básica
  const state = Buffer.from(JSON.stringify({ clientId })).toString('base64url')

  const scopes = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics.manage.users.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/business.manage',
    'email',
    'profile',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientIdGoogle,
    redirect_uri: `${appUrl}/auth/callback/google`,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',   // garante refresh_token na resposta
    state,
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
