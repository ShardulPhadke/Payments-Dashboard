import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  PaymentMetrics,
  TrendData,
  TrendPeriod,
} from '@payment/shared-types'

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
    prepareHeaders: (headers) => {
      headers.set('X-Tenant-Id', process.env.NEXT_PUBLIC_TENANT_ID || 'tenant-alpha')
      return headers
    },
  }),
  endpoints: (builder) => ({
    getMetrics: builder.query<PaymentMetrics, void>({
      query: () => '/api/analytics/metrics',
    }),
    getTrends: builder.query<TrendData[], TrendPeriod>({
      query: (period) => `/api/analytics/trends?period=${period}`,
    }),
  }),
})

export const { useGetMetricsQuery, useGetTrendsQuery } = paymentsApi
