import type { DashboardData } from '@/lib/dashboard/contracts'
import { dashboardDemo as legacyData } from '@/lib/dashboard-demo'

export const donAurelioDemoData: DashboardData = {
  ...legacyData,
  restaurant: {
    slug: 'don-aurelio-prime-grill',
    ...legacyData.restaurant,
  },
}
