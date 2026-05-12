import { NextResponse } from 'next/server'
import { getRestaurantDashboard } from '@/lib/dashboard/source'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const restaurantSlug = searchParams.get('restaurantSlug')

  const data = await getRestaurantDashboard({
    source: source === 'supabase' || source === 'mock' ? source : undefined,
    restaurantSlug: restaurantSlug || undefined,
  })

  return NextResponse.json(data)
}
