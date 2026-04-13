import Stripe from 'stripe'

// Cliente Stripe reutilizável — instância única no servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})
