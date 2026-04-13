import type { DashboardSection } from '@/lib/dashboard/contracts'
import { getDashboardPagePayload } from '@/lib/dashboard/page-data'
import { DemoDashboardPage } from '@/components/dashboard-demo/page'

export async function DemoDashboardServerPage({
  section,
  basePath = '/dashboard',
  restaurantSlug,
  source,
}: {
  section: DashboardSection
  basePath?: string
  restaurantSlug?: string
  source?: 'mock' | 'supabase'
}) {
  const isPublicDemo = basePath === '/demo'
  const payload = await getDashboardPagePayload(section, {
    basePath,
    source: source ?? 'supabase',
    restaurantSlug:
      restaurantSlug ??
      (isPublicDemo ? process.env.LOCALRISE_DEMO_RESTAURANT_SLUG ?? 'don-aurelio-prime-grill' : undefined),
  })
  return <DemoDashboardPage section={payload.section} basePath={payload.basePath} data={payload.data} isOnboarding={payload.isOnboarding} />
}
