import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { PaymentMetrics, PaymentMethod, PaymentStatus, StatusCountResult, TrendData } from '@payment/shared-types';

/**
 * Analytics Service
 * 
 * Handles all analytics calculations using MongoDB aggregation pipelines.
 * All queries are tenant-scoped for multi-tenancy.
 */
@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) { }

    /**
     * Calculate comprehensive payment metrics for a tenant
     * 
     * Uses MongoDB aggregation pipeline for efficient calculation:
     * - Total volume (sum of all amounts)
     * - Success rate (percentage of successful payments)
     * - Average amount
     * - Peak hour (hour with most transactions)
     * - Top payment method
     * - Status counts
     */
    async getMetrics(tenantId: string): Promise<PaymentMetrics> {
        // Aggregation pipeline for metrics calculation
        const metricsAggregation = await this.paymentModel.aggregate([
            // Filter by tenant
            { $match: { tenantId } },

            // Calculate all metrics in one pass
            {
                $facet: {
                    // Overall statistics
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalVolume: { $sum: '$amount' },
                                totalCount: { $sum: 1 },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                    ],

                    // Status counts
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],

                    // Payment method counts (for finding top method)
                    methodCounts: [
                        {
                            $group: {
                                _id: '$method',
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 },
                    ],

                    // Peak hour analysis
                    hourCounts: [
                        {
                            $group: {
                                _id: { $hour: '$createdAt' },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 },
                    ],
                },
            },
        ]);

        // Extract results from aggregation
        const result = metricsAggregation[0];

        // Parse overall metrics
        const overall = result.overall[0] || {
            totalVolume: 0,
            totalCount: 0,
            averageAmount: 0,
        };

        // Parse status counts
        const statusCounts = (result.statusCounts as StatusCountResult[]).reduce(
            (acc, item) => {
                acc[item._id] = item.count;
                return acc;
            },
            {} as Record<string, number>,
        );

        // Parse top method
        const topMethod = result.methodCounts[0];
        const topPaymentMethod = topMethod
            ? (topMethod._id as PaymentMethod)
            : PaymentMethod.UPI;

        // Parse peak hour
        const peakHourData = result.hourCounts[0];
        const peakHour = peakHourData ? peakHourData._id : 0;

        // Calculate success rate
        const successCount = statusCounts[PaymentStatus.SUCCESS] || 0;
        const successRate = overall.totalCount > 0
            ? (successCount / overall.totalCount) * 100
            : 0;

        // Build response
        return {
            totalVolume: overall.totalVolume,
            successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
            averageAmount: Math.round(overall.averageAmount * 100) / 100, // Round to 2 decimals
            peakHour,
            topPaymentMethod,
            totalCount: overall.totalCount,
            successCount: successCount,
            failedCount: statusCounts[PaymentStatus.FAILED] || 0,
            refundedCount: statusCounts[PaymentStatus.REFUNDED] || 0,
        };
    }

    /**
     * Get metrics for a specific date range
     * 
     * @param tenantId - Tenant identifier
     * @param startDate - Start of date range
     * @param endDate - End of date range
     */
    async getMetricsForDateRange(
        tenantId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<PaymentMetrics> {
        const metricsAggregation = await this.paymentModel.aggregate([
            // Filter by tenant and date range
            {
                $match: {
                    tenantId,
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },

            // Same facet structure as getMetrics
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalVolume: { $sum: '$amount' },
                                totalCount: { $sum: 1 },
                                averageAmount: { $avg: '$amount' },
                            },
                        },
                    ],
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    methodCounts: [
                        {
                            $group: {
                                _id: '$method',
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 },
                    ],
                    hourCounts: [
                        {
                            $group: {
                                _id: { $hour: '$createdAt' },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 },
                    ],
                },
            },
        ]);

        const result = metricsAggregation[0];
        const overall = result.overall[0] || {
            totalVolume: 0,
            totalCount: 0,
            averageAmount: 0,
        };

        const statusCounts = (result.statusCounts as StatusCountResult[]).reduce(
            (acc, item) => {
                acc[item._id] = item.count;
                return acc;
            },
            {} as Record<string, number>,
        );

        const topMethod = result.methodCounts[0];
        const topPaymentMethod = topMethod
            ? (topMethod._id as PaymentMethod)
            : PaymentMethod.UPI;

        const peakHourData = result.hourCounts[0];
        const peakHour = peakHourData ? peakHourData._id : 0;

        const successCount = statusCounts[PaymentStatus.SUCCESS] || 0;
        const successRate = overall.totalCount > 0
            ? (successCount / overall.totalCount) * 100
            : 0;

        return {
            totalVolume: overall.totalVolume,
            successRate: Math.round(successRate * 10) / 10,
            averageAmount: Math.round(overall.averageAmount * 100) / 100,
            peakHour,
            topPaymentMethod,
            totalCount: overall.totalCount,
            successCount: successCount,
            failedCount: statusCounts[PaymentStatus.FAILED] || 0,
            refundedCount: statusCounts[PaymentStatus.REFUNDED] || 0,
        };
    }

    /**
     * Calculate payment trends for a tenant over a specified period.
     * 
     * Uses MongoDB aggregation pipeline to compute trends:
     * - Aggregates payments by day, week, or month
     * - Calculates total amount per period
     * - Counts number of transactions per period
     * - Computes success rate (percentage of successful payments)
     * 
     * @param tenantId - Tenant identifier (required)
     * @param period - Aggregation period: 'day', 'week', or 'month' (required)
     * 
     * @returns TrendData[] - Array of trend points sorted chronologically
     * 
     * Example:
     * GET /api/analytics/trends?tenantId=tenant-alpha&period=day
     * GET /api/analytics/trends?tenantId=tenant-alpha&period=week
     * 
     * Sample Response:
     * [
     *   {
     *     "timestamp": "2025-10-01T00:00:00.000Z",
     *     "amount": 150000,
     *     "count": 25,
     *     "successRate": 88.0
     *   },
     *   ...
     * ]
     */
    async getTrends(
        tenantId: string,
        period: 'day' | 'week' | 'month',
    ): Promise<TrendData[]> {
        // Determine grouping key based on period
        let groupId: any;
        switch (period) {
            case 'day':
                groupId = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
                break;
            case 'week':
                groupId = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' },
                };
                break;
            case 'month':
                groupId = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
                break;
        }

        const trendsAggregation = await this.paymentModel.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: groupId,
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    successCount: {
                        $sum: {
                            $cond: [{ $eq: ['$status', PaymentStatus.SUCCESS] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
        ]);

        // Transform MongoDB _id to ISO string timestamp
        return trendsAggregation.map((item) => {
            let date: Date;
            const id = item._id;

            switch (period) {
                case 'day':
                    date = new Date(Date.UTC(id.year, id.month - 1, id.day));
                    break;
                case 'week':
                    // First day of year + (week - 1) * 7 days
                    date = new Date(Date.UTC(id.year, 0, 1 + (id.week - 1) * 7));
                    break;
                case 'month':
                    date = new Date(Date.UTC(id.year, id.month - 1, 1));
                    break;
            }

            const successRate =
                item.count > 0 ? Math.round((item.successCount / item.count) * 1000) / 10 : 0;

            return {
                timestamp: date,
                amount: item.amount,
                count: item.count,
                successRate,
            } as TrendData;
        });
    }
}