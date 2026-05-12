import type { DashboardData } from '@/lib/dashboard/contracts'
import { dashboardDemo as legacyData } from '@/lib/dashboard-demo'

export const donAurelioDemoData: DashboardData = {
  ...legacyData,
  restaurant: {
    slug: 'don-aurelio-prime-grill',
    ...legacyData.restaurant,
  },
  connections: { gbp: true, site: true, ads: true, instagram: true },
  topStats: {
    gbpImpressions: '1.240',
    gbpDelta: '+12% esse mês',
    instagramFollowers: '847',
    instagramDelta: '+8% esse mês',
    siteVisits: '312',
    siteDelta: '+5% esse mês',
    seoPosition: '4,2',
    seoDelta: '-0,3 vs mês anterior',
    adsClicks: '98',
    adsDelta: '+21% esse mês',
  },
}
