'use client'

import { useGetMetricsQuery, useGetTrendsQuery } from '@/store/services/paymentsApi'
import { TrendPeriod } from '@payment/shared-types'

export default function DashboardPage() {
  const { data: metrics, isLoading: mLoading } = useGetMetricsQuery()
  const { data: trends, isLoading: tLoading } = useGetTrendsQuery(TrendPeriod.DAY)

  if (mLoading || tLoading) return <div className="p-6">Loading…</div>
  if (!metrics || !trends) return <div className="p-6">No data</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payments Dashboard</h1>

      <section className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Metrics</h2>
        <pre className="text-sm">{JSON.stringify(metrics, null, 2)}</pre>
      </section>

      <section className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Trends</h2>
        <pre className="text-sm">{JSON.stringify(trends.slice(0, 5), null, 2)}</pre>
      </section>
    </div>
  )
}
