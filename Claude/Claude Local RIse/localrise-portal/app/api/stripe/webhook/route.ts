import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

// IMPORTANTE: esta rota precisa receber o body RAW (não parseado)
// para que o Stripe possa verificar a assinatura do evento.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Sem assinatura Stripe.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Webhook inválido.' }, { status: 400 })
  }

  const db = createAdminClient()

  try {
    switch (event.type) {
      // ── Checkout concluído: primeira assinatura confirmada ─────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clientId = session.metadata?.supabase_client_id

        if (!clientId) {
          console.warn('[webhook] checkout.session.completed sem supabase_client_id')
          break
        }

        await db
          .from('clients')
          .update({
            status_assinatura: 'ativa',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            data_vencimento: null, // será preenchido pelo invoice.payment_succeeded
          })
          .eq('id', clientId)

        console.log(`[webhook] checkout concluído → cliente ${clientId} ativo`)
        break
      }

      // ── Cobrança mensal bem-sucedida ───────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Calcular próxima data de vencimento (próximo período)
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )
        const dataVencimento = new Date(
          subscription.current_period_end * 1000
        ).toISOString()

        await db
          .from('clients')
          .update({
            status_assinatura: 'ativa',
            data_vencimento: dataVencimento,
          })
          .eq('stripe_customer_id', customerId)

        console.log(`[webhook] cobrança OK → customer ${customerId}, vencimento ${dataVencimento}`)
        break
      }

      // ── Falha no pagamento: bloquear acesso ────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await db
          .from('clients')
          .update({ status_assinatura: 'inativa' })
          .eq('stripe_customer_id', customerId)

        console.log(`[webhook] cobrança falhou → customer ${customerId} bloqueado`)
        break
      }

      // ── Assinatura cancelada pelo cliente ou pelo admin ────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await db
          .from('clients')
          .update({
            status_assinatura: 'cancelada',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)

        console.log(`[webhook] assinatura cancelada → customer ${customerId}`)
        break
      }

      default:
        // Evento não tratado — ignorar silenciosamente
        break
    }
  } catch (err) {
    console.error('[webhook] Erro ao processar evento:', event.type, err)
    // Retornar 200 para o Stripe não ficar tentando reenviar
    return NextResponse.json({ received: true, warning: 'Erro interno ao processar.' })
  }

  return NextResponse.json({ received: true })
}
