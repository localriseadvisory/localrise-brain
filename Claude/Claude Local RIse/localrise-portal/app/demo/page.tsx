import { DemoDashboardServerPage } from '@/components/dashboard-demo/server-page'

export default async function DemoPage() {
  return <DemoDashboardServerPage section="overview" basePath="/demo" />
}
