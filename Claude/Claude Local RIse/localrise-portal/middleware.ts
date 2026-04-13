import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Quantos dias de trial gratuito antes de exigir pagamento
const TRIAL_DAYS = 7

export async function middleware(req: NextRequest) {
  // Cria a resposta base mantendo os cookies do Supabase atualizados
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Necessário para renovação automática do token Supabase
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Verificar autenticação
  // IMPORTANTE: não adicionar código entre createServerClient e auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Admins nunca são bloqueados
  if (user.user_metadata?.role === 'admin') {
    return supabaseResponse
  }

  // 3. Verificar status da assinatura do cliente
  // Se a verificação falhar por qualquer motivo, deixa passar (fail-open)
  // para não bloquear clientes por instabilidade do banco.
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', user.id)
      .single()

    if (!profile?.client_id) {
      // Usuário sem perfil de cliente — deixa passar
      return supabaseResponse
    }

    const { data: client } = await supabase
      .from('clients')
      .select('status_assinatura, trial_iniciado_em')
      .eq('id', profile.client_id)
      .single()

    if (!client) return supabaseResponse

    const { status_assinatura, trial_iniciado_em } = client as {
      status_assinatura: string | null
      trial_iniciado_em: string | null
    }

    // Trial ativo: verificar se ainda está no prazo
    if (status_assinatura === 'trial') {
      if (trial_iniciado_em) {
        const trialEnd = new Date(
          new Date(trial_iniciado_em).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
        )
        if (new Date() > trialEnd) {
          // Trial expirado — bloquear
          return NextResponse.redirect(new URL('/pagamento-pendente', req.url))
        }
      }
      // Trial ainda válido
      return supabaseResponse
    }

    // Assinatura ativa — liberar acesso
    if (status_assinatura === 'ativa') {
      return supabaseResponse
    }

    // Qualquer outro status (inativa, cancelada, null) — bloquear
    return NextResponse.redirect(new URL('/pagamento-pendente', req.url))
  } catch {
    // Falha silenciosa: não bloquear o usuário por erro de infraestrutura
    return supabaseResponse
  }
}

export const config = {
  // Protege /dashboard e qualquer sub-rota
  matcher: ['/dashboard', '/dashboard/:path*'],
}
