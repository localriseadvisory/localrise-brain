import { NextResponse } from 'next/server'
import { getRestaurantDashboard } from '@/lib/dashboard/source'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const restaurantSlug = searchParams.get('restaurantSlug')

  const data = await getRestaurantDashboard({
    source: source === 'supabase' || source === 'mock' ? source : 'supabase',
    restaurantSlug: restaurantSlug || process.env.LOCALRISE_DEMO_RESTAURANT_SLUG || 'don-aurelio-prime-grill',
  })

  return NextResponse.json(data)
}
