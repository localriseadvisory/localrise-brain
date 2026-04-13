import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { clienteId } = await request.json() as { clienteId: string }

    if (!clienteId) {
      return NextResponse.json({ error: 'clienteId obrigatório.' }, { status: 400 })
    }

    // 2. Buscar dados do cliente no banco
    const db = createAdminClient()
    const { data: client, error: clientError } = await db
      .from('clients')
      .select('id, name, stripe_customer_id')
      .eq('id', clienteId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
    }

    // 3. Encontrar ou criar customer no Stripe
    let stripeCustomerId: string = client.stripe_customer_id ?? ''

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: client.name,
        email: user.email,
        metadata: {
          supabase_client_id: clienteId,
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id

      // Salvar o customer ID no banco
      await db
        .from('clients')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', clienteId)
    }

    // 4. Criar sessão de checkout com assinatura recorrente
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          // TODO: STRIPE_PRICE_ID é o ID do plano mensal criado no painel do Stripe
          // Crie em: Stripe Dashboard → Products → Add product → Recurring → mensal
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        supabase_client_id: clienteId,
      },
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pagamento-pendente?checkout=cancelled`,
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[criar-checkout]', err)
    return NextResponse.json(
      { error: 'Erro interno ao criar checkout.' },
      { status: 500 }
    )
  }
}
