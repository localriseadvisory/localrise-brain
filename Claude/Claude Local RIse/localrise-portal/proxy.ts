import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Quantos dias de trial gratuito antes de exigir pagamento
const TRIAL_DAYS = 7

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: não adicionar código entre createServerClient e auth.getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/login')
  const isPublicPage =
    path === '/' ||
    path.startsWith('/demo') ||
    path.startsWith('/demo-data') ||
    path.startsWith('/pagamento-pendente')

  const isDashboard = path.startsWith('/dashboard')
  const isAdmin = path.startsWith('/admin')

  // 1. Não autenticado
  if (!user && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Já autenticado tentando acessar login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Rotas protegidas: verificar assinatura (só para /dashboard)
  if (user && isDashboard) {
    // Admins nunca são bloqueados
    if (user.user_metadata?.role === 'admin') {
      return supabaseResponse
    }

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
            return NextResponse.redirect(new URL('/pagamento-pendente', request.url))
          }
        }
        return supabaseResponse
      }

      // Assinatura ativa — liberar
      if (status_assinatura === 'ativa') {
        return supabaseResponse
      }

      // Qualquer outro status (inativa, cancelada, null) — bloquear
      return NextResponse.redirect(new URL('/pagamento-pendente', request.url))
    } catch {
      // Fail-open: não bloquear por erro de infraestrutura
      return supabaseResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
