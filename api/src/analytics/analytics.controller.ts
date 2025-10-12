import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PaymentMetrics, TrendData } from '@payment/shared-types';
import { GetTrendsDto } from './dto/get-trends.dto';
import { GetMetricsDto } from './dto/get-metrics.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

/**
 * Analytics Controller
 * 
 * REST endpoints for payment analytics.
 * All endpoints require X-Tenant-Id header for multi-tenant isolation.
 * 
 * @UseGuards(TenantGuard) - Validates X-Tenant-Id header on all routes
 */
@Controller('api/analytics')
@UseGuards(TenantGuard)  // Apply guard to all routes in this controller
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * GET /api/analytics/metrics
     * 
     * Returns comprehensive payment metrics for a tenant.
     * 
     * Headers (required):
     * - X-Tenant-Id: Tenant identifier
     * 
     * Query Parameters (optional):
     * - startDate: Start date for filtering (ISO 8601)
     * - endDate: End date for filtering (ISO 8601)
     * 
     * Example:
     * curl -H "X-Tenant-Id: tenant-alpha" \
     *   "http://localhost:3333/api/analytics/metrics"
     * 
     * curl -H "X-Tenant-Id: tenant-alpha" \
     *   "http://localhost:3333/api/analytics/metrics?startDate=2024-10-01&endDate=2024-10-10"
     * 
     * Response:
     * {
     *   totalVolume: 5023450,
     *   successRate: 85.0,
     *   averageAmount: 5023.45,
     *   peakHour: 14,
     *   topPaymentMethod: "upi",
     *   totalCount: 1000,
     *   successCount: 850,
     *   failedCount: 120,
     *   refundedCount: 30
     * }
     */
    @Get('metrics')
    async getMetrics(
        @TenantId() tenantId: string,  // Extracted by TenantGuard
        @Query() query: GetMetricsDto
    ): Promise<PaymentMetrics> {
        const { startDate, endDate } = query;

        // If date range is provided, validate and use it
        if (startDate || endDate) {
            if (!startDate || !endDate) {
                throw new Error('Both startDate and endDate are required when filtering by date');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)');
            }

            if (start > end) {
                throw new Error('startDate must be before endDate');
            }

            return this.analyticsService.getMetricsForDateRange(tenantId, start, end);
        }

        // No date range - return all-time metrics
        return this.analyticsService.getMetrics(tenantId);
    }

    /**
     * GET /api/analytics/trends
     * 
     * Returns payment trends for a tenant aggregated by the requested period.
     * 
     * Headers (required):
     * - X-Tenant-Id: Tenant identifier
     * 
     * Query Parameters (required):
     * - period: Aggregation period. One of "day", "week", or "month".
     * 
     * Examples:
     * curl -H "X-Tenant-Id: tenant-alpha" \
     *   "http://localhost:3333/api/analytics/trends?period=day"
     * 
     * curl -H "X-Tenant-Id: tenant-beta" \
     *   "http://localhost:3333/api/analytics/trends?period=week"
     * 
     * Response:
     * [
     *   {
     *     "timestamp": "2025-10-10T00:00:00.000Z",
     *     "amount": 50234,
     *     "count": 12,
     *     "successRate": 83.3
     *   }
     * ]
     */
    @Get('trends')
    async getTrends(
        @TenantId() tenantId: string,  // Extracted by TenantGuard
        @Query() query: GetTrendsDto
    ): Promise<TrendData[]> {
        const { period } = query;

        if (!period || !['day', 'week', 'month'].includes(period)) {
            throw new Error('period must be one of "day", "week", "month"');
        }

        return this.analyticsService.getTrends(tenantId, period);
    }
}