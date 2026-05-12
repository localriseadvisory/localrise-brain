import type { DashboardRequest, DashboardSection } from '@/lib/dashboard/contracts'
import { getRestaurantDashboard } from '@/lib/dashboard/source'

export async function getDashboardPagePayload(
  section: DashboardSection,
  options: DashboardRequest & { basePath?: string } = {}
) {
  const data = await getRestaurantDashboard(options)
  return {
    section,
    basePath: options.basePath ?? '/dashboard',
    data,
  }
}
