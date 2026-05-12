import type { DashboardSection } from '@/lib/dashboard/contracts'
import { getDashboardPagePayload } from '@/lib/dashboard/page-data'
import { DemoDashboardPage } from '@/components/dashboard-demo/page'

export async function DemoDashboardServerPage({
  section,
  basePath = '/dashboard',
}: {
  section: DashboardSection
  basePath?: string
}) {
  const payload = await getDashboardPagePayload(section, { basePath })
  return <DemoDashboardPage section={payload.section} basePath={payload.basePath} data={payload.data} />
}
