import Stripe from 'stripe'

// Cliente Stripe reutilizável — instância única no servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})
