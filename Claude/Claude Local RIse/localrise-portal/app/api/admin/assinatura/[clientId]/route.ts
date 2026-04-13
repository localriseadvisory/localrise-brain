import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

type Action = 'ativar' | 'cancelar'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  // 1. Verificar que o chamador é admin
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const { action } = await request.json() as { action: Action }

  if (!['ativar', 'cancelar'].includes(action)) {
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  }

  const db = createAdminClient()

  // 2. Buscar cliente
  const { data: client, error } = await db
    .from('clients')
    .select('id, name, stripe_subscription_id, status_assinatura')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  try {
    if (action === 'ativar') {
      // Ativação manual: 30 dias a partir de hoje
      const dataVencimento = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString()

      const log = `Ativado manualmente por admin (${user.email}) em ${new Date().toLocaleString('pt-BR')} — vencimento: ${new Date(dataVencimento).toLocaleDateString('pt-BR')}`

      await db
        .from('clients')
        .update({
          status_assinatura: 'ativa',
          data_vencimento: dataVencimento,
          ativado_manualmente: true,
          log_ativacao: log,
        })
        .eq('id', clientId)

      return NextResponse.json({
        ok: true,
        message: `${client.name} ativado manualmente até ${new Date(dataVencimento).toLocaleDateString('pt-BR')}.`,
      })
    }

    if (action === 'cancelar') {
      // Cancelar assinatura no Stripe se existir
      if (client.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(client.stripe_subscription_id)
        } catch (stripeErr) {
          // Se não existir mais no Stripe, continua mesmo assim
          console.warn('[admin/assinatura] Erro ao cancelar no Stripe:', stripeErr)
        }
      }

      await db
        .from('clients')
        .update({
          status_assinatura: 'cancelada',
          stripe_subscription_id: null,
        })
        .eq('id', clientId)

      return NextResponse.json({
        ok: true,
        message: `Assinatura de ${client.name} cancelada.`,
      })
    }
  } catch (err) {
    console.error('[admin/assinatura]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 })
}
