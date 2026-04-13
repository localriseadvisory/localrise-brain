import Stripe from 'stripe'

// Cliente Stripe reutilizável — instância única no servidor
// O fallback vazio evita falha no build quando STRIPE_SECRET_KEY não está definida.
// Em produção a variável deve estar configurada no painel do Vercel.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder_set_in_vercel',
  { apiVersion: '2026-03-25.dahlia' }
)
