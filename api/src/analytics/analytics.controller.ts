import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PaymentMetrics, TrendData } from '@payment/shared-types';

/**
 * Query DTO for metrics endpoint
 */
class GetMetricsQueryDto {
    tenantId!: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Query DTO for trends endpoint
 */
class GetTrendsQueryDto {
    tenantId!: string;
    period!: 'day' | 'week' | 'month'; // period for aggregation
}

/**
 * Analytics Controller
 * 
 * REST endpoints for payment analytics.
 * All endpoints require tenantId for multi-tenant isolation.
 */
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * GET /api/analytics/metrics
     * 
     * Returns comprehensive payment metrics for a tenant.
     * 
     * Query Parameters:
     * - tenantId (required): Tenant identifier
     * - startDate (optional): Start date for filtering (ISO 8601)
     * - endDate (optional): End date for filtering (ISO 8601)
     * 
     * Example:
     * GET /api/analytics/metrics?tenantId=tenant-alpha
     * GET /api/analytics/metrics?tenantId=tenant-alpha&startDate=2024-10-01&endDate=2024-10-10
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
    async getMetrics(@Query() query: GetMetricsQueryDto): Promise<PaymentMetrics> {
        const { tenantId, startDate, endDate } = query;

        // Validate tenantId
        if (!tenantId) {
            throw new BadRequestException('tenantId is required');
        }

        // If date range is provided, validate and use it
        if (startDate || endDate) {
            if (!startDate || !endDate) {
                throw new BadRequestException('Both startDate and endDate are required when filtering by date');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new BadRequestException('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)');
            }

            if (start > end) {
                throw new BadRequestException('startDate must be before endDate');
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
     * Query Parameters:
     * - tenantId (required): Tenant identifier
     * - period (required): Aggregation period. One of "day", "week", or "month".
     * 
     * Examples:
     * GET /api/analytics/trends?tenantId=tenant-alpha&period=day
     * GET /api/analytics/trends?tenantId=tenant-alpha&period=week
     * GET /api/analytics/trends?tenantId=tenant-alpha&period=month
     * 
     * Response:
     * [
     *   {
     *     "timestamp": "2025-10-10T00:00:00.000Z", // Start of period (day/week/month)
     *     "amount": 50234,                          // Total transaction volume in this period
     *     "count": 12,                               // Total number of payments in this period
     *     "successRate": 83.3                        // Percentage of successful payments
     *   },
     *   {
     *     "timestamp": "2025-10-11T00:00:00.000Z",
     *     "amount": 41234,
     *     "count": 10,
     *     "successRate": 90
     *   }
     * ]
     */
    @Get('trends')
    async getTrends(@Query() query: GetTrendsQueryDto): Promise<TrendData[]> {
        const { tenantId, period } = query;

        if (!tenantId) {
            throw new BadRequestException('tenantId is required');
        }

        if (!period || !['day', 'week', 'month'].includes(period)) {
            throw new BadRequestException('period must be one of "day", "week", "month"');
        }

        return this.analyticsService.getTrends(tenantId, period);
    }
}