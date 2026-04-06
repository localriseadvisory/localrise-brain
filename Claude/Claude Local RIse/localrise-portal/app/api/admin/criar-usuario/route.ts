import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, full_name, client_id } = await request.json()

    if (!email || !password || !client_id) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: `Auth: ${authError.message}` }, { status: 400 })
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ client_id, full_name, role: 'client' })
      .eq('id', authData.user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
